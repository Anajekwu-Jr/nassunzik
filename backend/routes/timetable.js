import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { level, semester, day } = req.query;
  let query = 'SELECT * FROM timetable WHERE 1=1';
  const params = [];

  if (level) {
    query += ' AND level = ?';
    params.push(parseInt(level, 10));
  }
  if (semester) {
    query += ' AND semester = ?';
    params.push(parseInt(semester, 10));
  }
  if (day) {
    query += ' AND day = ?';
    params.push(day);
  }

  // Order by day of week then start time
  query += ` ORDER BY 
    CASE day
      WHEN 'Monday' THEN 1
      WHEN 'Tuesday' THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday' THEN 4
      WHEN 'Friday' THEN 5
      ELSE 6
    END ASC,
    start_time ASC`;

  const entries = db.prepare(query).all(...params);
  res.json(entries);
});

router.post('/', requireAuth(), (req, res) => {
  const { level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue } = req.body;
  if (!level || !semester || !day || !start_time || !end_time || !course_code) {
    return res.status(400).json({ error: 'Level, semester, day, start time, end time, and course code are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO timetable (level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      parseInt(level, 10),
      parseInt(semester, 10),
      day,
      start_time,
      end_time,
      course_code.toUpperCase().trim(),
      course_title || '',
      lecturer || '',
      venue || ''
    );

    const entry = db.prepare('SELECT * FROM timetable WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue } = req.body;
  try {
    const update = db.prepare(`
      UPDATE timetable
      SET level = ?, semester = ?, day = ?, start_time = ?, end_time = ?, course_code = ?, course_title = ?, lecturer = ?, venue = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      parseInt(level, 10),
      parseInt(semester, 10),
      day,
      start_time,
      end_time,
      course_code.toUpperCase().trim(),
      course_title || '',
      lecturer || '',
      venue || '',
      req.params.id
    );

    const entry = db.prepare('SELECT * FROM timetable WHERE id = ?').get(req.params.id);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM timetable WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }
    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
