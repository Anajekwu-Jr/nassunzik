import express from 'express';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all site settings
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    // Cross-alias keys for frontend compatibility
    if (settings.dept_name && !settings.department_name) settings.department_name = settings.dept_name;
    if (settings.department_name && !settings.dept_name) settings.dept_name = settings.department_name;
    if (settings.accreditation && !settings.stat_accreditation) settings.stat_accreditation = settings.accreditation;
    if (settings.stat_accreditation && !settings.accreditation) settings.accreditation = settings.stat_accreditation;

    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to retrieve site settings' });
  }
});

// GET single setting by key
router.get('/:key', (req, res) => {
  try {
    const row = db.prepare('SELECT key, value FROM site_settings WHERE key = ?').get(req.params.key);
    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: row.key, value: row.value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve setting' });
  }
});

// Update settings (Admin only)
router.post('/', requireAuth(), (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `);

    for (const [key, value] of Object.entries(updates)) {
      if (typeof key === 'string' && key.trim()) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        upsertStmt.run(key.trim(), valStr);
      }
    }

    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    exportSnapshot();

    res.json({ success: true, message: 'Site settings updated successfully', settings });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/', requireAuth(), (req, res) => {
  // Alias to POST
  return router.handle(Object.assign(req, { method: 'POST' }), res);
});

export default router;
