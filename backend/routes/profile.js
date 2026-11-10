import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/** Simple token parser (matches auth.js) */
function parseToken(req) {
  const header = req.headers.authorization ?? '';
  const raw = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const [userId, role] = decoded.split(':');
    return { userId: Number(userId), role };
  } catch {
    return null;
  }
}

/** GET /api/profile — get logged-in user's profile */
router.get('/', async (req, res) => {
  const caller = parseToken(req);
  if (!caller) return res.status(401).json({ message: 'Unauthorised' });

  try {
    const [[user]] = await pool.query(
      'SELECT id, name, phone, email, role, nic, address, gender, city, preferred_station AS preferredStation, emergency_contact AS emergencyContact, bio FROM users WHERE id = ?',
      [caller.userId]
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('[GET /profile]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/** PATCH /api/profile — update logged-in user's profile */
router.patch('/', async (req, res) => {
  const caller = parseToken(req);
  if (!caller) return res.status(401).json({ message: 'Unauthorised' });

  const { name, phone, nic, address, gender, city, preferredStation, emergencyContact, bio } = req.body ?? {};

  try {
    await pool.query(
      `UPDATE users SET
         name               = COALESCE(?, name),
         phone              = COALESCE(?, phone),
         nic                = COALESCE(?, nic),
         address            = COALESCE(?, address),
         gender             = COALESCE(?, gender),
         city               = COALESCE(?, city),
         preferred_station  = COALESCE(?, preferred_station),
         emergency_contact  = COALESCE(?, emergency_contact),
         bio                = COALESCE(?, bio)
       WHERE id = ?`,
      [name ?? null, phone ?? null, nic ?? null, address ?? null, gender ?? null,
       city ?? null, preferredStation ?? null, emergencyContact ?? null, bio ?? null,
       caller.userId]
    );
    return res.json({ ok: true, message: 'Profile updated' });
  } catch (err) {
    console.error('[PATCH /profile]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;
