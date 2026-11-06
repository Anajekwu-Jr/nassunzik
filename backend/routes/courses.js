import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getLecturerMap() {
  const map = {};
  try {
    const timetableRows = db.prepare('SELECT course_code, lecturer FROM timetable').all();
    for (const row of timetableRows) {
      if (row.course_code && row.lecturer) {
        const norm = row.course_code.toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
        if (!map[norm]) map[norm] = row.lecturer;
        const full = row.course_code.toUpperCase().trim();
        if (!map[full]) map[full] = row.lecturer;
      }
    }
  } catch (_) {
    try {
      const fs = require('node:fs');
      const path = require('node:path');
      const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
      if (fs.existsSync(backupFile)) {
        const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
        if (Array.isArray(data.timetable)) {
          for (const row of data.timetable) {
            if (row.course_code && row.lecturer) {
              const norm = row.course_code.toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
              if (!map[norm]) map[norm] = row.lecturer;
              const full = row.course_code.toUpperCase().trim();
              if (!map[full]) map[full] = row.lecturer;
            }
          }
        }
      }
    } catch (_) {}
  }
  return map;
}

function getCoursesFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        const resources = Array.isArray(data.course_resources) ? data.course_resources : [];
        const lecturerMap = getLecturerMap();
        return data.courses.map(c => {
          const norm = (c.code || '').toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
          const full = (c.code || '').toUpperCase().trim();
          const cr = resources.filter(r => r.course_id === c.id);
          return {
            ...c,
            units: c.credit_units || c.units || 3,
            credit_units: c.credit_units || c.units || 3,
            lecturer: lecturerMap[norm] || lecturerMap[full] || c.lecturer || 'Department Faculty',
            resources: cr,
            resources_count: cr.length
          };
        });
      }
    }
  } catch (_) {}
  return [];
}

// GET all courses with optional filters
router.get('/', (req, res) => {
  try {
    const { level, semester, search, status } = req.query;
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];

    if (level) {
      query += ' AND level = ?';
      params.push(parseInt(level, 10));
    }
    if (semester) {
      query += ' AND semester = ?';
      params.push(parseInt(semester, 10));
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      const rawSearch = search.trim();
      const cleanSearch = rawSearch.toLowerCase();
      const cleanSpaced = cleanSearch.replace(/[_\-\.]+/g, ' ').trim();
      const cleanUnderscored = cleanSearch.replace(/[\s\-\.]+/g, '_').trim();
      const cleanWithoutExt = cleanSearch.replace(/\.(pdf|docx|jpg|png)$/i, '');

      const term = `%${rawSearch}%`;
      const termSpaced = `%${cleanSpaced}%`;
      const termUnderscored = `%${cleanUnderscored}%`;
      const termWithoutExt = `%${cleanWithoutExt}%`;

      query += ` AND (
        code LIKE ? OR title LIKE ? OR description LIKE ? OR outline LIKE ?
        OR code LIKE ? OR title LIKE ?
        OR id IN (
          SELECT course_id FROM course_resources 
          WHERE title LIKE ? OR file_name LIKE ? OR file_path LIKE ?
             OR title LIKE ? OR file_name LIKE ? OR file_path LIKE ?
             OR title LIKE ? OR file_name LIKE ? OR file_path LIKE ?
             OR title LIKE ? OR file_name LIKE ? OR file_path LIKE ?
        )
      )`;
      params.push(
        term, term, term, term,
        termSpaced, termSpaced,
        term, term, term,
        termSpaced, termSpaced, termSpaced,
        termUnderscored, termUnderscored, termUnderscored,
        termWithoutExt, termWithoutExt, termWithoutExt
      );
    }

    query += " ORDER BY level ASC, semester ASC, CASE WHEN status = 'Compulsory' THEN 0 ELSE 1 END, code ASC";
    let courses = [];
    try {
      courses = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('Courses DB query warning, using fallback:', dbErr.message);
      courses = getCoursesFallback();
      if (level) {
        const lvl = parseInt(level, 10);
        courses = courses.filter(c => c.level === lvl);
      }
      if (semester) {
        const sem = parseInt(semester, 10);
        courses = courses.filter(c => c.semester === sem);
      }
      if (search) {
        const sLower = search.toLowerCase();
        courses = courses.filter(c => (c.code && c.code.toLowerCase().includes(sLower)) || (c.title && c.title.toLowerCase().includes(sLower)));
      }
      return res.json(courses);
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      courses = getCoursesFallback();
      if (level) {
        const lvl = parseInt(level, 10);
        courses = courses.filter(c => c.level === lvl);
      }
      if (semester) {
        const sem = parseInt(semester, 10);
        courses = courses.filter(c => c.semester === sem);
      }
      return res.json(courses);
    }

    // Attach resources, units and timetable lecturer
    const lecturerMap = getLecturerMap();
    const coursesWithResources = courses.map(c => {
      let resources = [];
      try {
        resources = db.prepare('SELECT * FROM course_resources WHERE course_id = ?').all(c.id);
      } catch (_) {}
      const norm = (c.code || '').toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
      const full = (c.code || '').toUpperCase().trim();
      return {
        ...c,
        units: c.credit_units || c.units || 3,
        credit_units: c.credit_units || c.units || 3,
        lecturer: lecturerMap[norm] || lecturerMap[full] || c.lecturer || 'Department Faculty',
        resources,
        resources_count: resources.length
      };
    });

    res.json(coursesWithResources);
  } catch (err) {
    console.error('Unhandled error in /api/courses GET:', err);
    res.json(getCoursesFallback());
  }
});

// GET single course by ID with resources
router.get('/:id', (req, res) => {
  try {
    let course;
    try {
      course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    } catch (dbErr) {
      console.warn('Single course DB query warning:', dbErr.message);
    }

    if (!course) {
      const fallbackList = getCoursesFallback();
      const targetId = parseInt(req.params.id, 10);
      course = fallbackList.find(c => c.id === targetId || String(c.id) === String(req.params.id) || (c.code && c.code.toUpperCase() === String(req.params.id).toUpperCase()));
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let resources = [];
    try {
      resources = db.prepare('SELECT * FROM course_resources WHERE course_id = ? ORDER BY id DESC').all(course.id);
    } catch (_) {
      resources = course.resources || [];
    }

    const lecturerMap = getLecturerMap();
    const norm = (course.code || '').toUpperCase().replace(/\s+/g, '').replace('NAU-', '');
    const full = (course.code || '').toUpperCase().trim();
    res.json({
      ...course,
      units: course.credit_units || course.units || 3,
      credit_units: course.credit_units || course.units || 3,
      lecturer: lecturerMap[norm] || lecturerMap[full] || course.lecturer || 'Department Faculty',
      resources,
      resources_count: resources.length
    });
  } catch (err) {
    console.error('Unhandled error in /api/courses/:id GET:', err);
    res.status(500).json({ error: 'Unable to retrieve course details' });
  }
});

// POST create course (Admin)
router.post('/', requireAuth(), (req, res) => {
  const { code, title, level, semester, credit_units, description, outline, status } = req.body;
  if (!code || !title || !level || !semester) {
    return res.status(400).json({ error: 'Course Code, Course Title, Level, and Semester are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO courses (code, title, level, semester, credit_units, status, description, outline, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      code.toUpperCase().trim(),
      title.trim(),
      parseInt(level, 10),
      parseInt(semester, 10),
      parseInt(credit_units || 3, 10),
      status ? status.trim() : 'Compulsory',
      description ? description.trim() : '',
      outline ? outline.trim() : ''
    );

    const courseId = result.lastInsertRowid;

    // Attach course materials if provided
    if (req.body.course_resources && Array.isArray(req.body.course_resources)) {
      for (const resItem of req.body.course_resources) {
        if (resItem && resItem.file_path) {
          db.prepare(`
            INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(
            courseId,
            resItem.title || `${title.trim()} Course Material`,
            resItem.resource_type || 'lecture_note',
            resItem.file_name || 'document.pdf',
            resItem.file_path,
            resItem.file_size || 0,
            resItem.academic_year || '2025/2026',
            parseInt(semester, 10) || 1
          );
        }
      }
    } else if (req.body.material_file_path) {
      db.prepare(`
        INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        courseId,
        req.body.material_title || `${title.trim()} Course Material`,
        req.body.material_type || 'lecture_note',
        req.body.material_file_name || 'document.pdf',
        req.body.material_file_path,
        req.body.material_file_size || 0,
        req.body.material_year || '2025/2026',
        parseInt(semester, 10) || 1
      );
    }

    const newCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
    const resources = db.prepare('SELECT * FROM course_resources WHERE course_id = ?').all(courseId);
    exportSnapshot();
    res.status(201).json({ ...newCourse, resources });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: `Course code '${code.toUpperCase().trim()}' already exists. Please use a unique code or edit the existing course.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update course (Admin)
router.put('/:id', requireAuth(), (req, res) => {
  const { code, title, level, semester, credit_units, description, outline, status } = req.body;
  if (!code || !title || !level || !semester) {
    return res.status(400).json({ error: 'Course Code, Course Title, Level, and Semester are required' });
  }

  try {
    const update = db.prepare(`
      UPDATE courses 
      SET code = ?, title = ?, level = ?, semester = ?, credit_units = ?, status = COALESCE(?, status), description = ?, outline = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      code.toUpperCase().trim(),
      title.trim(),
      parseInt(level, 10),
      parseInt(semester, 10),
      parseInt(credit_units || 3, 10),
      status ? status.trim() : null,
      description ? description.trim() : '',
      outline ? outline.trim() : '',
      req.params.id
    );

    // Attach course materials if provided
    if (req.body.course_resources && Array.isArray(req.body.course_resources)) {
      for (const resItem of req.body.course_resources) {
        if (resItem && resItem.file_path) {
          db.prepare(`
            INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(
            req.params.id,
            resItem.title || `${title.trim()} Course Material`,
            resItem.resource_type || 'lecture_note',
            resItem.file_name || 'document.pdf',
            resItem.file_path,
            resItem.file_size || 0,
            resItem.academic_year || '2025/2026',
            parseInt(semester, 10) || 1
          );
        }
      }
    } else if (req.body.material_file_path) {
      db.prepare(`
        INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        req.params.id,
        req.body.material_title || `${title.trim()} Course Material`,
        req.body.material_type || 'lecture_note',
        req.body.material_file_name || 'document.pdf',
        req.body.material_file_path,
        req.body.material_file_size || 0,
        req.body.material_year || '2025/2026',
        parseInt(semester, 10) || 1
      );
    }

    const updatedCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    const resources = db.prepare('SELECT * FROM course_resources WHERE course_id = ?').all(req.params.id);
    exportSnapshot();
    res.json({ ...updatedCourse, resources });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: `Course code '${code.toUpperCase().trim()}' already exists for another course.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE course (Admin)
router.delete('/:id', requireAuth(), (req, res) => {
  try {
    db.prepare('DELETE FROM course_resources WHERE course_id = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    exportSnapshot();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add resource to course (Admin)
router.post('/:id/resources', requireAuth(), (req, res) => {
  const { title, resource_type, file_name, file_path, file_size, academic_year, semester } = req.body;
  if (!title || !file_path) {
    return res.status(400).json({ error: 'Title and file path are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      req.params.id,
      title,
      resource_type || 'outline',
      file_name || 'document.pdf',
      file_path,
      file_size || 0,
      academic_year || '2025/2026',
      semester ? parseInt(semester, 10) : 1
    );

    const resource = db.prepare('SELECT * FROM course_resources WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE course resource (Admin)
router.delete('/resources/:resourceId', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM course_resources WHERE id = ?').run(req.params.resourceId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
