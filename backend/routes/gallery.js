import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { year, event_name, format } = req.query;
  let query = 'SELECT * FROM gallery WHERE 1=1';
  const params = [];

  if (year && year !== 'ALL') {
    query += ' AND year = ?';
    params.push(parseInt(year, 10));
  }
  if (event_name && event_name !== 'ALL') {
    query += ' AND event_name = ?';
    params.push(event_name);
  }

  query += ' ORDER BY year DESC, id DESC';
  const items = db.prepare(query).all(...params);

  // Group by year
  const years = [...new Set(items.map(i => i.year))].sort((a, b) => b - a);
  const grouped = {};
  years.forEach(y => {
    grouped[y] = items.filter(i => i.year === y);
  });

  if (format === 'array') {
    return res.json(items);
  }

  res.json({ items, grouped, availableYears: years });
});

router.post('/', requireAuth(), (req, res) => {
  const { title, year, event_name, category, image_url, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Photo title is required' });
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ error: 'Image file or URL is required' });
  }

  const currentYear = new Date().getFullYear();
  const parsedYear = parseInt(year || currentYear, 10) || currentYear;
  const resolvedEvent = (event_name || category || 'Departmental Event').trim();

  try {
    const insert = db.prepare(`
      INSERT INTO gallery (title, year, event_name, image_url, description, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      title.trim(),
      parsedYear,
      resolvedEvent,
      image_url.trim(),
      (description || '').trim()
    );

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { title, year, event_name, category, image_url, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Photo title is required' });
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ error: 'Image file or URL is required' });
  }

  const currentYear = new Date().getFullYear();
  const parsedYear = parseInt(year || currentYear, 10) || currentYear;
  const resolvedEvent = (event_name || category || 'Departmental Event').trim();

  try {
    const update = db.prepare(`
      UPDATE gallery
      SET title = ?, year = ?, event_name = ?, image_url = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      title.trim(),
      parsedYear,
      resolvedEvent,
      image_url.trim(),
      (description || '').trim(),
      req.params.id
    );

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
