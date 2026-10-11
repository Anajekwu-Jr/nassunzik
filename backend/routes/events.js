import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { status, category, featured, is_featured } = req.query;
  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status.toUpperCase());
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured === 'true' || featured === '1' || is_featured === '1' || is_featured === 'true') {
    query += ' AND is_featured = 1';
  }

  query += ' ORDER BY event_date DESC, event_time ASC';
  const events = db.prepare(query).all(...params);
  res.json(events);
});

router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

router.post('/', requireAuth(), (req, res) => {
  const { title, event_date, event_time, venue, description, category, status, registration_url, banner_image, is_featured } = req.body;
  if (!title || !event_date || !venue) {
    return res.status(400).json({ error: 'Title, event date, and venue are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO events (title, event_date, event_time, venue, description, category, status, registration_url, banner_image, is_featured, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      title.trim(),
      event_date,
      event_time || '10:00 AM',
      venue.trim(),
      description || '',
      category || 'Academic',
      status ? status.toUpperCase() : 'UPCOMING',
      registration_url || '',
      banner_image || '/resources/images/event_default.jpg',
      (is_featured === 1 || is_featured === true || is_featured === '1' || is_featured === 'true') ? 1 : 0
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { title, event_date, event_time, venue, description, category, status, registration_url, banner_image, is_featured } = req.body;
  try {
    const update = db.prepare(`
      UPDATE events
      SET title = ?, event_date = ?, event_time = ?, venue = ?, description = ?, category = ?, status = ?, registration_url = ?, banner_image = ?, is_featured = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      title.trim(),
      event_date,
      event_time || '10:00 AM',
      venue.trim(),
      description || '',
      category || 'Academic',
      status ? status.toUpperCase() : 'UPCOMING',
      registration_url || '',
      banner_image || '/resources/images/event_default.jpg',
      (is_featured === 1 || is_featured === true || is_featured === '1' || is_featured === 'true') ? 1 : 0,
      req.params.id
    );

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
