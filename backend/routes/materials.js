import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getBackupMaterials(filters = {}) {
  try {
    const backupPaths = [
      path.join(process.cwd(), 'data', 'portal_state_backup.json'),
      path.join(process.cwd(), 'dist', 'data', 'portal_state_backup.json')
    ];
    let backup = null;
    for (const bp of backupPaths) {
      if (fs.existsSync(bp)) {
        backup = JSON.parse(fs.readFileSync(bp, 'utf-8'));
        break;
      }
    }
    if (!backup || !Array.isArray(backup.course_resources)) return [];

    const courses = Array.isArray(backup.courses) ? backup.courses : [];
    const courseMap = new Map(courses.map(c => [c.id, c]));

    let list = backup.course_resources.map(cr => {
      const c = courseMap.get(cr.course_id) || {};
      return {
        ...cr,
        course_code: c.code || '',
        course_title: c.title || '',
        course_level: c.level || null,
        course_semester: c.semester || null,
        course_credit_units: c.credit_units || null
      };
    });

    if (filters.resource_type) {
      list = list.filter(m => m.resource_type === filters.resource_type);
    }
    if (filters.level) {
      const lvl = parseInt(filters.level, 10);
      list = list.filter(m => m.course_level === lvl);
    }
    if (filters.semester) {
      const sem = parseInt(filters.semester, 10);
      list = list.filter(m => m.course_semester === sem);
    }
    if (filters.course_id) {
      const cid = parseInt(filters.course_id, 10);
      list = list.filter(m => m.course_id === cid);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(m =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.course_code || '').toLowerCase().includes(q) ||
        (m.course_title || '').toLowerCase().includes(q)
      );
    }

    return list;
  } catch (err) {
    console.warn('Notice reading backup materials:', err.message);
    return [];
  }
}

// GET all materials with optional filtering by level, semester, resource_type, or search
router.get('/', (req, res) => {
  const { level, semester, resource_type, search, course_id } = req.query;
  let query = `
    SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester, c.credit_units as course_credit_units
    FROM course_resources cr
    LEFT JOIN courses c ON cr.course_id = c.id
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
    let materials = [];
    if (db) {
      try {
        materials = db.prepare(query).all(...params);
      } catch (dbErr) {
        console.warn('DB query in /api/materials failed, falling back to backup snapshot:', dbErr.message);
      }
    }

    if (!Array.isArray(materials) || materials.length === 0) {
      materials = getBackupMaterials({ level, semester, resource_type, search, course_id });
    }

    res.json(materials);
  } catch (err) {
    console.error('Error in /api/materials:', err);
    res.json(getBackupMaterials({ level, semester, resource_type, search, course_id }));
  }
});

// GET single material by ID
router.get('/:id', (req, res) => {
  try {
    const query = `
      SELECT cr.*, c.code as course_code, c.title as course_title, c.level as course_level, c.semester as course_semester
      FROM course_resources cr
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ?
    `;
    let material = null;
    if (db) {
      try {
        material = db.prepare(query).get(req.params.id);
      } catch (_) {}
    }
    if (!material) {
      const all = getBackupMaterials({});
      material = all.find(m => String(m.id) === String(req.params.id));
    }
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
    exportSnapshot();
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

    exportSnapshot();
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
    exportSnapshot();
    res.json({ message: 'Material deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
