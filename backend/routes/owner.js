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

function requireOwner(req, res, next) {
  const caller = parseToken(req);
  if (!caller || caller.role !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' });
  }
  req.caller = caller;
  next();
}

/** GET /api/owner/buses — buses belonging to the logged-in owner */
router.get('/buses', requireOwner, async (req, res) => {
  try {
    const [buses] = await pool.query(
      `SELECT
         b.id,
         b.name,
         b.number,
         b.type,
         b.route,
         b.trip_date  AS tripDate,
         b.departure  AS departureTime,
         b.arrival    AS arrivalTime,
         b.ticket_price AS ticketPrice,
         b.rating
       FROM buses b
       WHERE b.owner_id = ?
       ORDER BY b.trip_date, b.departure`,
      [req.caller.userId]
    );
    return res.json({ ok: true, buses });
  } catch (err) {
    console.error('[GET /owner/buses]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/** GET /api/owner/drivers — drivers assigned to this owner's buses */
router.get('/drivers', requireOwner, async (req, res) => {
  try {
    const [drivers] = await pool.query(
      `SELECT DISTINCT
         u.id,
         u.name,
         u.phone,
         u.email,
         b.name AS assignedBus
       FROM bus_drivers bd
       JOIN buses b ON b.id = bd.bus_id
       JOIN users  u ON u.id = bd.driver_id
       WHERE b.owner_id = ?`,
      [req.caller.userId]
    );
    return res.json({ ok: true, drivers });
  } catch (err) {
    console.error('[GET /owner/drivers]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;
