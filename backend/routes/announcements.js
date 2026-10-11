import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { active_only } = req.query;
  let query = 'SELECT * FROM announcements WHERE 1=1';
  if (active_only === 'true') {
    query += ' AND is_active = 1';
  }
  query += ` ORDER BY 
    CASE priority
      WHEN 'URGENT' THEN 1
      WHEN 'IMPORTANT' THEN 2
      ELSE 3
    END ASC,
    id DESC`;

  const announcements = db.prepare(query).all();
  res.json(announcements);
});

router.post('/', requireAuth(), (req, res) => {
  const { title, content, priority, image_url, is_active } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO announcements (title, content, priority, image_url, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      title.trim(),
      content.trim(),
      priority || 'NORMAL',
      image_url || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { title, content, priority, image_url, is_active } = req.body;
  try {
    const update = db.prepare(`
      UPDATE announcements
      SET title = ?, content = ?, priority = ?, image_url = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      title.trim(),
      content.trim(),
      priority || 'NORMAL',
      image_url !== undefined ? image_url : null,
      is_active ? 1 : 0,
      req.params.id
    );

    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
