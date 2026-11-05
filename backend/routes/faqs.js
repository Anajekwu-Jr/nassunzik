import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getFaqsFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        return data.faqs;
      }
    }
  } catch (_) {}
  return [];
}

// GET all FAQs with optional category and search filters
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM faqs WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (question LIKE ? OR answer LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY sort_order ASC, id ASC';
  try {
    let faqs = db.prepare(query).all(...params);
    if (!Array.isArray(faqs) || faqs.length === 0) {
      faqs = getFaqsFallback();
    }
    res.json(faqs);
  } catch (err) {
    console.warn('FAQs DB query warning, returning fallback:', err.message);
    let faqs = getFaqsFallback();
    if (category && category !== 'All') {
      faqs = faqs.filter(f => f.category === category);
    }
    if (search) {
      const sLower = search.toLowerCase();
      faqs = faqs.filter(f => (f.question && f.question.toLowerCase().includes(sLower)) || (f.answer && f.answer.toLowerCase().includes(sLower)));
    }
    res.json(faqs);
  }
});

// GET single FAQ by ID
router.get('/:id', (req, res) => {
  try {
    let faq;
    try {
      faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
    } catch (_) {}
    if (!faq) {
      const targetId = parseInt(req.params.id, 10);
      faq = getFaqsFallback().find(f => f.id === targetId);
    }
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create FAQ (Admin only)
router.post('/', requireAuth(), (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO faqs (question, answer, category, sort_order, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const info = insert.run(question, answer, category || 'General', sort_order || 0);
    const newFaq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(info.lastInsertRowid);
    exportSnapshot();
    res.status(201).json(newFaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update FAQ (Admin only)
router.put('/:id', requireAuth(), (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    db.prepare(`
      UPDATE faqs
      SET question = ?, answer = ?, category = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      question || existing.question,
      answer || existing.answer,
      category || existing.category,
      sort_order !== undefined ? sort_order : existing.sort_order,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
    exportSnapshot();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE FAQ (Admin only)
router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
    exportSnapshot();
    res.json({ message: 'FAQ deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
