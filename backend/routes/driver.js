import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/** In-memory set of SSE clients: Map<res, intervalId> */
const clients = new Map();

/** Fetch the current-turn data from the DB */
async function fetchTurn() {
  try {
    const [[row]] = await pool.query(`
      SELECT
        t.id,
        t.bus_id      AS busId,
        b.number      AS busNumber,
        b.route,
        t.started_at  AS startedAt,
        COUNT(bk.id)  AS passengerCount
      FROM driver_turns t
      JOIN buses b     ON b.id = t.bus_id
      LEFT JOIN bookings bk ON bk.bus_id = t.bus_id AND bk.status = 'confirmed'
      WHERE t.ended_at IS NULL
      ORDER BY t.started_at DESC
      LIMIT 1
    `);
    return row ?? { id: 'N/A', busId: null, busNumber: '-', route: '-', passengerCount: 0 };
  } catch {
    return { id: 'N/A', busId: null, busNumber: '-', route: '-', passengerCount: 0 };
  }
}

/**
 * GET /api/driver/turn/stream
 * Server-Sent Events endpoint — pushes turn data every 5 s.
 */
router.get('/turn/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = async () => {
    const data = await fetchTurn();
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send immediately, then every 5 seconds
  send();
  const intervalId = setInterval(send, 5000);

  clients.set(res, intervalId);

  req.on('close', () => {
    clearInterval(intervalId);
    clients.delete(res);
  });
});

/** GET /api/driver/current-turn — polling fallback */
router.get('/current-turn', async (_req, res) => {
  const data = await fetchTurn();
  return res.json(data);
});

export default router;

