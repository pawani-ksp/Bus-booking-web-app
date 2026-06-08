import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-secret';

// In-memory user store — replace with a real database in production.
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'passenger' | 'owner' | 'driver';
};

const users: User[] = [];

function generateId(prefix = 'u') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const auth = req.headers['authorization'];
  if (!auth || Array.isArray(auth)) {
    return void res.status(401).json({ message: 'Missing token' });
  }
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return void res.status(401).json({ message: 'Invalid token format' });
  }
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    return next();
  } catch (err) {
    return void res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/auth/me', authRequired, (req, res): void => {
  const payload = (req as any).user;
  const u = users.find((x) => x.id === payload.id);
  if (!u) {
    return void res.status(404).json({ message: 'User not found' });
  }
  const { passwordHash, ...safe } = u;
  return void res.json(safe);
});

app.post('/api/auth/register', async (req, res): Promise<void> => {
  const { name, email, password, phone, role } = req.body as any;
  if (!email || !password || !name || !role) {
    return void res.status(400).json({ message: 'Missing fields' });
  }
  if (!['passenger', 'owner', 'driver'].includes(role)) {
    return void res.status(400).json({ message: 'Invalid role' });
  }
  if (users.some((u) => u.email === email)) {
    return void res.status(409).json({ message: 'Email already exists' });
  }
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const user: User = { id: generateId('u'), name, email, phone, passwordHash, role } as User;
  users.push(user);
  return void res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.post('/api/auth/login', async (req, res): Promise<void> => {
  const { email, password } = req.body as any;
  if (!email || !password) {
    return void res.status(400).json({ message: 'Missing credentials' });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return void res.status(401).json({ message: 'Invalid email or password' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return void res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
  return void res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
const angularApp = new AngularNodeAppEngine();

// In-memory simulation of current driver turn and passenger counts.
const currentTurn = {
  id: 'turn-1',
  passengerCount: 0,
};

// Simulate passenger count changes every 5 seconds for demo/live metrics.
setInterval(() => {
  // simple random walk between 0 and 50
  const delta = Math.floor(Math.random() * 3) - 1; // -1,0,1
  currentTurn.passengerCount = Math.max(0, Math.min(50, currentTurn.passengerCount + delta));
}, 5000);

/**
 * Simple JSON endpoint returning current turn data (for polling).
 */
app.get('/api/driver/current-turn', (req, res) => {
  res.json(currentTurn);
});

/**
 * Server-Sent Events endpoint that streams current turn updates.
 */
app.get('/api/driver/turn/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // send initial state
  res.write(`data: ${JSON.stringify(currentTurn)}\n\n`);

  const timer = setInterval(() => {
    res.write(`data: ${JSON.stringify(currentTurn)}\n\n`);
  }, 5000);

  req.on('close', () => {
    clearInterval(timer);
  });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
