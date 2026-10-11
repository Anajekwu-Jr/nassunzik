import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all materials with optional filtering by level, semester, resource_type, or search
router.get('/', (req, res) => {
  const { level, semester, resource_type, search, course_id } = req.query;
  let query = `
    SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester, c.credit_units as course_credit_units
    FROM course_resources cr
    JOIN courses c ON cr.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (level) {
    query += ' AND c.level = ?';
    params.push(parseInt(level, 10));
  }
  if (semester) {
    query += ' AND c.semester = ?';
    params.push(parseInt(semester, 10));
  }
  if (resource_type) {
    query += ' AND cr.resource_type = ?';
    params.push(resource_type);
  }
  if (course_id) {
    query += ' AND cr.course_id = ?';
    params.push(parseInt(course_id, 10));
  }
  if (search) {
    query += ' AND (cr.title LIKE ? OR c.code LIKE ? OR c.title LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY c.level ASC, c.code ASC, cr.academic_year DESC, cr.id DESC';
  try {
    const materials = db.prepare(query).all(...params);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single material by ID
router.get('/:id', (req, res) => {
  try {
    const query = `
      SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester
      FROM course_resources cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ?
    `;
    const material = db.prepare(query).get(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create material (Admin only)
router.post('/', requireAuth(), (req, res) => {
  const { course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester } = req.body;
  if (!course_id || !title || !resource_type || !file_path) {
    return res.status(400).json({ error: 'Course ID, title, resource type, and file path are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const info = insert.run(
      parseInt(course_id, 10),
      title,
      resource_type,
      file_name || title,
      file_path,
      file_size || 0,
      academic_year || null,
      semester ? parseInt(semester, 10) : null
    );

    const query = `
      SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester
      FROM course_resources cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ?
    `;
    const newMaterial = db.prepare(query).get(info.lastInsertRowid);
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update material (Admin only)
router.put('/:id', requireAuth(), (req, res) => {
  const { course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM course_resources WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const update = db.prepare(`
      UPDATE course_resources
      SET course_id = COALESCE(?, course_id),
          title = COALESCE(?, title),
          resource_type = COALESCE(?, resource_type),
          file_name = COALESCE(?, file_name),
          file_path = COALESCE(?, file_path),
          file_size = COALESCE(?, file_size),
          academic_year = COALESCE(?, academic_year),
          semester = COALESCE(?, semester),
          updated_at = datetime('now')
      WHERE id = ?
    `);

    update.run(
      course_id ? parseInt(course_id, 10) : null,
      title || null,
      resource_type || null,
      file_name || null,
      file_path || null,
      file_size !== undefined ? file_size : null,
      academic_year || null,
      semester !== undefined ? parseInt(semester, 10) : null,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester
      FROM course_resources cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE material (Admin only)
router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM course_resources WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    db.prepare('DELETE FROM course_resources WHERE id = ?').run(req.params.id);
    res.json({ message: 'Material deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
