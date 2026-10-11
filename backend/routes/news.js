import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search, limit, featured } = req.query;
  let query = 'SELECT * FROM news WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (featured === 'true' || featured === '1') {
    query += ' AND is_featured = 1';
  }
  if (search) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY published_at DESC, id DESC';
  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit, 10));
  }

  const articles = db.prepare(query).all(...params);
  res.json(articles);
});

router.get('/:idOrSlug', (req, res) => {
  const param = req.params.idOrSlug;
  const isNumeric = /^\d+$/.test(param);
  const article = isNumeric
    ? db.prepare('SELECT * FROM news WHERE id = ?').get(param)
    : db.prepare('SELECT * FROM news WHERE slug = ?').get(param);

  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  // Get related articles
  const related = db.prepare(`
    SELECT id, title, slug, summary, category, published_at, featured_image
    FROM news 
    WHERE category = ? AND id != ?
    ORDER BY published_at DESC LIMIT 3
  `).all(article.category, article.id);

  res.json({ ...article, related });
});

router.post('/', requireAuth(), (req, res) => {
  const { title, summary, content, category, author, featured_image, is_featured } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    const insert = db.prepare(`
      INSERT INTO news (title, slug, summary, content, category, author, featured_image, is_featured, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const result = insert.run(
      title.trim(),
      slug,
      summary || title.substring(0, 150),
      content,
      category || 'General',
      author || 'NASS Secretariat',
      featured_image || '/resources/images/news_default.jpg',
      is_featured ? 1 : 0
    );

    const article = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { title, summary, content, category, author, featured_image, is_featured } = req.body;
  try {
    const update = db.prepare(`
      UPDATE news
      SET title = ?, summary = ?, content = ?, category = ?, author = ?, featured_image = ?, is_featured = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      title.trim(),
      summary || title.substring(0, 150),
      content,
      category || 'General',
      author || 'NASS Secretariat',
      featured_image || '/resources/images/news_default.jpg',
      is_featured ? 1 : 0,
      req.params.id
    );

    const article = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }
    res.json({ success: true, message: 'News article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
