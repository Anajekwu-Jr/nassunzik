import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function getContactsFallback() {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.contacts) && data.contacts.length > 0) {
        return data.contacts;
      }
    }
  } catch (_) {}
  return [];
}

router.get('/', (req, res) => {
  try {
    const { type, contact_type, search } = req.query;
    const filterType = type || contact_type;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (filterType) {
      query += ' AND contact_type = ?';
      params.push(filterType);
    }
    if (search) {
      query += ' AND (name LIKE ? OR role_or_title LIKE ? OR department_or_level LIKE ? OR email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY 
      CASE contact_type
        WHEN 'HOD' THEN 1
        WHEN 'ADVISER' THEN 2
        WHEN 'EXECUTIVE' THEN 3
        WHEN 'COURSE_REP' THEN 4
        ELSE 5
      END ASC,
      CASE 
        WHEN department_or_level LIKE '%400%' THEN 1
        WHEN department_or_level LIKE '%300%' THEN 2
        WHEN department_or_level LIKE '%200%' THEN 3
        WHEN department_or_level LIKE '%100%' THEN 4
        ELSE 5
      END ASC,
      id ASC`;

    let contacts = [];
    try {
      contacts = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('Contacts DB query warning, using fallback:', dbErr.message);
      contacts = getContactsFallback();
      if (filterType) {
        contacts = contacts.filter(c => c.contact_type === filterType);
      }
      if (search) {
        const sLower = search.toLowerCase();
        contacts = contacts.filter(c => (c.name && c.name.toLowerCase().includes(sLower)) || (c.role_or_title && c.role_or_title.toLowerCase().includes(sLower)));
      }
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      contacts = getContactsFallback();
    }

    res.json(contacts);
  } catch (err) {
    console.error('Unhandled error in /api/contacts GET:', err);
    res.json(getContactsFallback());
  }
});

router.post('/', requireAuth(), (req, res) => {
  const { name, role_or_title, department_or_level, email, phone, office_location, contact_type } = req.body;
  if (!name || !role_or_title) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO contacts (name, role_or_title, department_or_level, email, phone, office_location, contact_type, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      name.trim(),
      role_or_title.trim(),
      department_or_level || 'Department of Statistics',
      email || '',
      phone || '',
      office_location || '',
      contact_type || 'GENERAL'
    );

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  const { name, role_or_title, department_or_level, email, phone, office_location, contact_type } = req.body;
  try {
    const update = db.prepare(`
      UPDATE contacts
      SET name = ?, role_or_title = ?, department_or_level = ?, email = ?, phone = ?, office_location = ?, contact_type = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      name.trim(),
      role_or_title.trim(),
      department_or_level || 'Department of Statistics',
      email || '',
      phone || '',
      office_location || '',
      contact_type || 'GENERAL',
      req.params.id
    );

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
