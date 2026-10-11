import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM siwes_resources WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY id DESC';
  const resources = db.prepare(query).all(...params);
  res.json(resources);
});

router.post('/', requireAuth(), (req, res) => {
  const { title, description, category, file_name, file_path, file_size } = req.body;
  if (!title || !file_path) {
    return res.status(400).json({ error: 'Title and file path are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO siwes_resources (title, description, category, file_name, file_path, file_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      title.trim(),
      description || '',
      category || 'Guide',
      file_name || 'document.pdf',
      file_path,
      file_size || 0
    );

    const resource = db.prepare('SELECT * FROM siwes_resources WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { title, description, category, file_name, file_path, file_size } = req.body;
  try {
    const update = db.prepare(`
      UPDATE siwes_resources
      SET title = ?, description = ?, category = ?, file_name = ?, file_path = ?, file_size = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      title.trim(),
      description || '',
      category || 'Guide',
      file_name || 'document.pdf',
      file_path,
      file_size || 0,
      req.params.id
    );

    const resource = db.prepare('SELECT * FROM siwes_resources WHERE id = ?').get(req.params.id);
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM siwes_resources WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'SIWES resource not found' });
    }
    res.json({ success: true, message: 'SIWES resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
