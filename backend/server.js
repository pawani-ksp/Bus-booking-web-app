import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import authRouter    from './routes/auth.js';
import busRouter     from './routes/buses.js';
import bookingRouter from './routes/bookings.js';
import driverRouter  from './routes/driver.js';
import ownerRouter   from './routes/owner.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

app.get('/api/db-test', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS dbConnected');
    res.json({ ok: true, result: rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ── Feature routers ──────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/buses',    busRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/driver',   driverRouter);
app.use('/api/owner',    ownerRouter);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
