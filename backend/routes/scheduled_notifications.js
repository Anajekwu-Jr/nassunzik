import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all scheduled notification campaigns
router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM scheduled_notifications ORDER BY id DESC').all();
    const formatted = list.map(item => ({
      ...item,
      times_of_day: typeof item.times_of_day === 'string' ? JSON.parse(item.times_of_day) : item.times_of_day
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new scheduled recurring campaign
router.post('/', requireAuth(), (req, res) => {
  const { title, content, priority, target_cohort, times_of_day, start_date, total_days } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const daysCount = parseInt(total_days, 10) || 3;
  const start = start_date ? new Date(start_date) : new Date();
  const end = new Date(start.getTime() + (daysCount - 1) * 24 * 60 * 60 * 1000);

  const startDateStr = start.toISOString().split('T')[0];
  const endDateStr = end.toISOString().split('T')[0];

  const timesArray = Array.isArray(times_of_day) && times_of_day.length > 0
    ? times_of_day
    : ['09:00', '12:00', '19:00'];

  try {
    const insert = db.prepare(`
      INSERT INTO scheduled_notifications (
        title, content, priority, target_cohort, times_of_day,
        start_date, end_date, total_days, is_active, dispatch_count,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, datetime('now'), datetime('now'))
    `);

    const result = insert.run(
      title.trim(),
      content.trim(),
      priority || 'IMPORTANT',
      target_cohort || 'all',
      JSON.stringify(timesArray),
      startDateStr,
      endDateStr,
      daysCount
    );

    const created = db.prepare('SELECT * FROM scheduled_notifications WHERE id = ?').get(result.lastInsertRowid);
    created.times_of_day = JSON.parse(created.times_of_day);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle active/paused status
router.post('/:id/toggle', requireAuth(), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM scheduled_notifications WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const nextState = existing.is_active ? 0 : 1;
    db.prepare('UPDATE scheduled_notifications SET is_active = ?, updated_at = datetime("now") WHERE id = ?')
      .run(nextState, req.params.id);

    const updated = db.prepare('SELECT * FROM scheduled_notifications WHERE id = ?').get(req.params.id);
    updated.times_of_day = JSON.parse(updated.times_of_day);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST trigger immediate dispatch test
router.post('/:id/trigger', requireAuth(), (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM scheduled_notifications WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Insert an announcement representing this dispatch
    const insAnn = db.prepare(`
      INSERT INTO announcements (title, content, priority, is_active, updated_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `);
    insAnn.run(
      `[Scheduled Alert] ${item.title}`,
      item.content,
      item.priority
    );

    // Update dispatch counter
    db.prepare(`
      UPDATE scheduled_notifications
      SET dispatch_count = dispatch_count + 1, last_dispatched_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(item.id);

    res.json({
      success: true,
      message: `Notification for "${item.title}" dispatched successfully to all students!`,
      dispatched_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE scheduled notification
router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM scheduled_notifications WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
