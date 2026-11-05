import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getNewsFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.news) && data.news.length > 0) {
        return data.news;
      }
    }
  } catch (_) {}
  return [];
}

router.get('/', (req, res) => {
  try {
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

    let articles = [];
    try {
      articles = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('News DB query warning, using fallback:', dbErr.message);
      articles = getNewsFallback();
      if (category) {
        articles = articles.filter(a => a.category === category);
      }
      if (featured === 'true' || featured === '1') {
        articles = articles.filter(a => a.is_featured === 1);
      }
      if (search) {
        const sLower = search.toLowerCase();
        articles = articles.filter(a => (a.title && a.title.toLowerCase().includes(sLower)) || (a.summary && a.summary.toLowerCase().includes(sLower)));
      }
      if (limit) {
        articles = articles.slice(0, parseInt(limit, 10));
      }
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      articles = getNewsFallback();
    }

    res.json(articles);
  } catch (err) {
    console.error('Unhandled error in /api/news GET:', err);
    res.json(getNewsFallback());
  }
});

router.get('/:idOrSlug', (req, res) => {
  try {
    const param = req.params.idOrSlug;
    const isNumeric = /^\d+$/.test(param);
    let article;
    try {
      article = isNumeric
        ? db.prepare('SELECT * FROM news WHERE id = ?').get(param)
        : db.prepare('SELECT * FROM news WHERE slug = ?').get(param);
    } catch (dbErr) {
      console.warn('Single news DB query warning:', dbErr.message);
    }

    if (!article) {
      const fallbackList = getNewsFallback();
      if (isNumeric) {
        const targetId = parseInt(param, 10);
        article = fallbackList.find(a => a.id === targetId);
      } else {
        article = fallbackList.find(a => a.slug === param || (a.title && a.title.toLowerCase().includes(param.toLowerCase())));
      }
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get related articles
    let related = [];
    try {
      related = db.prepare(`
        SELECT id, title, slug, summary, category, published_at, featured_image
        FROM news 
        WHERE category = ? AND id != ?
        ORDER BY published_at DESC LIMIT 3
      `).all(article.category, article.id);
    } catch (_) {
      related = getNewsFallback().filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
    }

    res.json({ ...article, related });
  } catch (err) {
    console.error('Unhandled error in /api/news/:idOrSlug GET:', err);
    res.status(500).json({ error: 'Unable to retrieve article' });
  }
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
    exportSnapshot();
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
    exportSnapshot();
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
    exportSnapshot();
    res.json({ success: true, message: 'News article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
