import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const OFFICIAL_FALLBACK_GALLERY = [
  {
    id: 8,
    title: 'NASS - Probix Class of 2026',
    year: 2026,
    event_name: 'Class Sets & Graduands',
    image_url: '/resources/images/gallery/probix_class_2026.jpg',
    description: 'Official cohort portrait of the graduating Probix Class of 2026, Department of Statistics, Nnamdi Azikiwe University, Awka.'
  },
  {
    id: 9,
    title: 'NASS - Vantora Class of 2027',
    year: 2026,
    event_name: 'Class Sets & Cohorts',
    image_url: '/resources/images/gallery/vantora_class_2027.jpg',
    description: 'The energetic Vantora Class of 2027 during departmental assembly and academic orientation at the Faculty of Physical Sciences.'
  },
  {
    id: 10,
    title: 'NASS HOD Cup Runner Up 2025/2026',
    year: 2026,
    event_name: 'Sports & Competitions',
    image_url: '/resources/images/gallery/hod_cup_runner_up_2025_2026.jpg',
    description: 'Statistics departmental football team celebrating their runner-up triumph at the annual HOD Cup championship tournament.'
  },
  {
    id: 11,
    title: "Prof Osuji with Vantora'27 after First SIWES Defense",
    year: 2026,
    event_name: 'Academic Defense & Milestones',
    image_url: '/resources/images/gallery/prof_osuji_vantora27_siwes_defense_2026.jpg',
    description: 'Prof. George A. Osuji alongside 300L Vantora Class of 2027 students following the successful conclusion of their 1st SIWES departmental oral defense.'
  }
];

function getGalleryFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.gallery) && data.gallery.length > 0) {
        return data.gallery;
      }
    }
  } catch (_) {}
  return OFFICIAL_FALLBACK_GALLERY;
}

router.get('/', (req, res) => {
  try {
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
    let items = [];
    try {
      items = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('Gallery DB query warning, using fallback:', dbErr.message);
      items = getGalleryFallback();
      if (year && year !== 'ALL') {
        const yNum = parseInt(year, 10);
        items = items.filter(i => i.year === yNum);
      }
      if (event_name && event_name !== 'ALL') {
        items = items.filter(i => i.event_name === event_name);
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      items = getGalleryFallback();
    }

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
  } catch (err) {
    console.error('Unhandled error in /api/gallery GET:', err);
    const fallbackItems = getGalleryFallback();
    const years = [...new Set(fallbackItems.map(i => i.year))].sort((a, b) => b - a);
    const grouped = {};
    years.forEach(y => {
      grouped[y] = fallbackItems.filter(i => i.year === y);
    });
    if (req.query.format === 'array') {
      return res.json(fallbackItems);
    }
    res.json({ items: fallbackItems, grouped, availableYears: years });
  }
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
    exportSnapshot();
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
    exportSnapshot();
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
    exportSnapshot();
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
