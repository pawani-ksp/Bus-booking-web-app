import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/**
 * Very lightweight token check.
 * Token format: base64(userId:role:timestamp)
 * Replace with JWT verification in production.
 */
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

/** POST /api/bookings — create a booking */
router.post('/', async (req, res) => {
  const caller = parseToken(req);
  if (!caller) {
    return res.status(401).json({ message: 'Unauthorised — please log in' });
  }

  const { busId, seatId } = req.body ?? {};
  if (!busId || !seatId) {
    return res.status(400).json({ message: 'busId and seatId are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check seat availability with a row-level lock
    const [[seat]] = await conn.query(
      'SELECT id, is_available FROM seats WHERE id = ? AND bus_id = ? FOR UPDATE',
      [seatId, busId]
    );

    if (!seat) {
      await conn.rollback();
      return res.status(404).json({ message: 'Seat not found on this bus' });
    }

    if (!seat.is_available) {
      await conn.rollback();
      return res.status(409).json({ message: 'Seat is already booked' });
    }

    // Mark seat as taken
    await conn.query('UPDATE seats SET is_available = 0 WHERE id = ?', [seatId]);

    // Insert booking record
    const [result] = await conn.query(
      'INSERT INTO bookings (user_id, bus_id, seat_id, status, booked_at) VALUES (?, ?, ?, ?, NOW())',
      [caller.userId, busId, seatId, 'confirmed']
    );

    await conn.commit();
    return res.status(201).json({ ok: true, bookingId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('[POST /bookings]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

/** GET /api/bookings/my — bookings for the logged-in user */
router.get('/my', async (req, res) => {
  const caller = parseToken(req);
  if (!caller) {
    return res.status(401).json({ message: 'Unauthorised — please log in' });
  }

  try {
    const [bookings] = await pool.query(
      `SELECT
         bk.id,
         bk.status,
         bk.booked_at   AS bookedAt,
         b.name         AS busName,
         b.number       AS busNumber,
         b.route,
         b.trip_date    AS tripDate,
         b.departure    AS departureTime,
         s.label        AS seatLabel
       FROM bookings bk
       JOIN buses b   ON b.id  = bk.bus_id
       JOIN seats s   ON s.id  = bk.seat_id
       WHERE bk.user_id = ?
       ORDER BY bk.booked_at DESC`,
      [caller.userId]
    );

    return res.json({ ok: true, bookings });
  } catch (err) {
    console.error('[GET /bookings/my]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/** PATCH /api/bookings/:id/cancel — cancel a booking */
router.patch('/:id/cancel', async (req, res) => {
  const caller = parseToken(req);
  if (!caller) {
    return res.status(401).json({ message: 'Unauthorised — please log in' });
  }

  const bookingId = Number(req.params.id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[booking]] = await conn.query(
      'SELECT id, user_id, seat_id, status FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (!booking) {
      await conn.rollback();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user_id !== caller.userId) {
      await conn.rollback();
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status === 'cancelled') {
      await conn.rollback();
      return res.status(409).json({ message: 'Booking is already cancelled' });
    }

    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', bookingId]);
    await conn.query('UPDATE seats SET is_available = 1 WHERE id = ?', [booking.seat_id]);

    await conn.commit();
    return res.json({ ok: true, message: 'Booking cancelled' });
  } catch (err) {
    await conn.rollback();
    console.error('[PATCH /bookings/:id/cancel]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

export default router;

