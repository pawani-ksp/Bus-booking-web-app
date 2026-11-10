import { Router } from 'express';
import pool from '../config/db.js';
import crypto from 'crypto';

const router = Router();

/** Simple SHA-256 hash used as a lightweight password hash (no native bcrypt needed) */
function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

/** POST /api/auth/register */
router.post('/register', async (req, res) => {
  const { name, phone, email, password, role } = req.body ?? {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }

  const allowedRoles = ['passenger', 'owner', 'driver'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'role must be passenger, owner, or driver' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, phone ?? null, email, hashed, role]
    );

    return res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0 || rows[0].password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    // Simple token: base64(userId:role:timestamp) — replace with JWT in production
    const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

