import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const ROOT_DIR = path.resolve(process.cwd());
const CIRS_DETAILS_FILE = path.join(ROOT_DIR, 'data', 'official_cirs_details.json');

let cirsDetailsCache = null;
function getCirsDetails() {
  if (!cirsDetailsCache) {
    try {
      if (fs.existsSync(CIRS_DETAILS_FILE)) {
        cirsDetailsCache = JSON.parse(fs.readFileSync(CIRS_DETAILS_FILE, 'utf-8'));
      } else {
        cirsDetailsCache = {};
      }
    } catch (_) {
      cirsDetailsCache = {};
    }
  }
  return cirsDetailsCache;
}

router.get('/', (req, res) => {
  const { category, role, search, include_cirs } = req.query;
  const roleFilter = category || role;
  let query = 'SELECT * FROM staff WHERE 1=1';
  const params = [];

  if (roleFilter) {
    query += ' AND role_category = ?';
    params.push(roleFilter);
  }
  if (search) {
    query += ' AND (name LIKE ? OR title LIKE ? OR qualifications LIKE ? OR specialization LIKE ? OR cirs_id LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  query += ' ORDER BY display_order ASC, name ASC';
  const staff = db.prepare(query).all(...params);

  const cirsDetails = getCirsDetails();
  // Attach quick CIRS counts to summary cards
  staff.forEach(s => {
    const cid = (s.cirs_id || '').toUpperCase();
    if (cid && cirsDetails[cid]) {
      const cd = cirsDetails[cid];
      s.cirs_pub_count = cd.publications ? cd.publications.length : 0;
      s.cirs_qual_count = cd.qualifications ? cd.qualifications.length : 0;
      s.cirs_exp_count = cd.experience ? cd.experience.length : 0;
      if (include_cirs === 'true' || include_cirs === '1') {
        s.cirs_data = cd;
      }
    } else {
      s.cirs_pub_count = 0;
      s.cirs_qual_count = 0;
      s.cirs_exp_count = 0;
    }
  });

  res.json(staff);
});

router.get('/:id', (req, res) => {
  const param = req.params.id;
  let staff;
  if (/^\d+$/.test(param)) {
    staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(param);
  } else {
    staff = db.prepare('SELECT * FROM staff WHERE UPPER(cirs_id) = UPPER(?) OR LOWER(name) LIKE LOWER(?)').get(param, `%${param}%`);
  }

  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  // Attach enriched CIRS details
  const cirsDetails = getCirsDetails();
  const cid = (staff.cirs_id || '').toUpperCase();
  if (cid && cirsDetails[cid]) {
    staff.cirs_data = cirsDetails[cid];
  } else {
    staff.cirs_data = {
      qualifications: staff.qualifications ? staff.qualifications.split(/[,;]\s*/).map(q => q.trim()).filter(Boolean) : [],
      publications: [],
      experience: [],
      leadership: [],
      memberships: [],
      eventsAttended: []
    };
  }

  res.json(staff);
});

router.post('/', requireAuth(), (req, res) => {
  const { name, title, role_category, qualifications, specialization, email, phone, office, photo_url, bio, display_order, cirs_url, cirs_id } = req.body;
  if (!name || !title) {
    return res.status(400).json({ error: 'Name and title are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO staff (name, title, role_category, qualifications, specialization, email, phone, office, photo_url, bio, display_order, cirs_url, cirs_id, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      name.trim(),
      title.trim(),
      role_category || 'ACADEMIC',
      (qualifications || '').trim(),
      specialization || '',
      email || '',
      phone || '',
      office || '',
      photo_url || '/resources/images/staff_default.jpg',
      bio || '',
      parseInt(display_order || 10, 10),
      cirs_url || '',
      cirs_id || ''
    );

    const newStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(result.lastInsertRowid);
    exportSnapshot();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { name, title, role_category, qualifications, specialization, email, phone, office, photo_url, bio, display_order, cirs_url, cirs_id } = req.body;
  try {
    const update = db.prepare(`
      UPDATE staff
      SET name = ?, title = ?, role_category = ?, qualifications = ?, specialization = ?, email = ?, phone = ?, office = ?, photo_url = ?, bio = ?, display_order = ?, cirs_url = ?, cirs_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      name.trim(),
      title.trim(),
      role_category || 'ACADEMIC',
      (qualifications || '').trim(),
      specialization || '',
      email || '',
      phone || '',
      office || '',
      photo_url || '/resources/images/staff_default.jpg',
      bio || '',
      parseInt(display_order || 10, 10),
      cirs_url || '',
      cirs_id || '',
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
    exportSnapshot();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    exportSnapshot();
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
