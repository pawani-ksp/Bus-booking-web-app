import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/** GET /api/buses — list all buses with seat availability */
router.get('/', async (_req, res) => {
  try {
    const [buses] = await pool.query(`
      SELECT
        b.id,
        b.name,
        b.number,
        b.type,
        b.route,
        b.trip_date   AS tripDate,
        b.departure   AS departureTime,
        b.arrival     AS arrivalTime,
        b.ticket_price AS ticketPrice,
        b.rating,
        COUNT(s.id)   AS totalSeats,
        SUM(CASE WHEN s.is_available = 1 THEN 1 ELSE 0 END) AS availableSeats
      FROM buses b
      LEFT JOIN seats s ON s.bus_id = b.id
      GROUP BY b.id
      ORDER BY b.trip_date, b.departure
    `);

    return res.json({ ok: true, buses });
  } catch (err) {
    console.error('[GET /buses]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/** GET /api/buses/:id/seats — seat map for a specific bus */
router.get('/:id/seats', async (req, res) => {
  const busId = Number(req.params.id);
  if (!Number.isFinite(busId)) {
    return res.status(400).json({ message: 'Invalid bus id' });
  }

  try {
    const [seats] = await pool.query(
      'SELECT id, label, is_available AS isAvailable FROM seats WHERE bus_id = ? ORDER BY label',
      [busId]
    );
    return res.json({ ok: true, seats });
  } catch (err) {
    console.error('[GET /buses/:id/seats]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/** GET /api/buses/:id/route — route stops for a bus */
router.get('/:id/route', async (req, res) => {
  const busId = Number(req.params.id);
  if (!Number.isFinite(busId)) {
    return res.status(400).json({ message: 'Invalid bus id' });
  }

  try {
    const [stops] = await pool.query(
      'SELECT id, stop_name AS stopName, stop_order AS stopOrder FROM route_stops WHERE bus_id = ? ORDER BY stop_order',
      [busId]
    );
    return res.json({ ok: true, stops });
  } catch (err) {
    console.error('[GET /buses/:id/route]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

export default router;

