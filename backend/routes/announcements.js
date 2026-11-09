import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    // STRICT REQUIREMENT: Only featured information from the news/event page on the website can be on the Noticeboard Bulletin and App's announcement board!
    const featuredNews = db.prepare('SELECT * FROM news WHERE is_featured = 1 ORDER BY published_at DESC, id DESC').all();
    const featuredEvents = db.prepare('SELECT * FROM events WHERE is_featured = 1 ORDER BY event_date ASC, id ASC').all();

    const announcements = [];

    // 1. Featured News dispatches
    for (const n of featuredNews) {
      const isUrgent = n.category === 'Academic Notice' || n.category === 'Resumption';
      announcements.push({
        id: n.id,
        title: n.title,
        content: n.summary || (n.content ? n.content.substring(0, 240) + '...' : ''),
        priority: isUrgent ? 'URGENT' : 'IMPORTANT',
        date: n.published_at ? new Date(n.published_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 2026',
        author: n.author || 'Head of Department & Senate',
        category: n.category,
        source: 'news',
        url: `/news.html?id=${n.id}`,
        is_active: 1
      });
    }

    // 2. Featured Events milestone dispatches (only if not duplicate of a news item)
    for (const e of featuredEvents) {
      const alreadyCovered = announcements.some(a => 
        a.title.toLowerCase().includes(e.title.toLowerCase().slice(0, 15)) ||
        (e.category && a.category && a.category.toLowerCase() === e.category.toLowerCase())
      );
      if (!alreadyCovered) {
        announcements.push({
          id: 1000 + e.id,
          title: `${e.title} · ${e.event_date}`,
          content: `${e.description} Venue: ${e.venue}. Time: ${e.event_time || 'TBA'}`,
          priority: 'NORMAL',
          date: e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Upcoming',
          author: 'NASS Academic Desk',
          category: e.category,
          source: 'events',
          url: `/events.html#event-${e.id}`,
          is_active: 1
        });
      }
    }

    res.json(announcements);
  } catch (err) {
    console.error('Unhandled error in /api/announcements GET:', err);
    res.json([]);
  }
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
    exportSnapshot();
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
    exportSnapshot();
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
    exportSnapshot();
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
