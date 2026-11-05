import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getEventsFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.events) && data.events.length > 0) {
        return data.events;
      }
    }
  } catch (_) {}
  return [];
}

router.get('/', (req, res) => {
  try {
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
    let events = [];
    try {
      events = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('Events DB query warning, using fallback:', dbErr.message);
      events = getEventsFallback();
      if (status) {
        events = events.filter(e => e.status && e.status.toUpperCase() === status.toUpperCase());
      }
      if (category) {
        events = events.filter(e => e.category === category);
      }
      if (featured === 'true' || featured === '1' || is_featured === '1' || is_featured === 'true') {
        events = events.filter(e => e.is_featured === 1);
      }
    }

    if (!Array.isArray(events) || events.length === 0) {
      events = getEventsFallback();
    }

    res.json(events);
  } catch (err) {
    console.error('Unhandled error in /api/events GET:', err);
    res.json(getEventsFallback());
  }
});

router.get('/:id', (req, res) => {
  try {
    let event;
    try {
      event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    } catch (dbErr) {
      console.warn('Single event DB query warning:', dbErr.message);
    }

    if (!event) {
      const fallbackList = getEventsFallback();
      const targetId = parseInt(req.params.id, 10);
      event = fallbackList.find(e => e.id === targetId || String(e.id) === String(req.params.id));
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error('Unhandled error in /api/events/:id GET:', err);
    res.status(500).json({ error: 'Unable to retrieve event details' });
  }
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
    exportSnapshot();
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
    exportSnapshot();
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
    exportSnapshot();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
