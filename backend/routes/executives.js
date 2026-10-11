import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function formatExecutive(exec) {
  if (!exec) return null;
  return {
    ...exec,
    portfolio: exec.office,
    role: exec.office
  };
}

router.get('/', (req, res) => {
  const { tenure } = req.query;
  let query = 'SELECT * FROM executives WHERE 1=1';
  const params = [];

  if (tenure) {
    query += ' AND tenure = ?';
    params.push(tenure);
  }

  query += ' ORDER BY display_order ASC, name ASC';
  const executives = db.prepare(query).all(...params);
  res.json(executives.map(formatExecutive));
});

router.get('/:id', (req, res) => {
  const executive = db.prepare('SELECT * FROM executives WHERE id = ?').get(req.params.id);
  if (!executive) {
    return res.status(404).json({ error: 'Executive not found' });
  }
  res.json(formatExecutive(executive));
});

router.post('/', requireAuth(), (req, res) => {
  const name = (req.body.name || '').trim();
  const office = (req.body.office || req.body.portfolio || req.body.role || '').trim();
  const level = parseInt(req.body.level, 10) || 400;
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').trim();
  const photo_url = (req.body.photo_url || req.body.image_url || '/resources/images/exco_president.jpg').trim();
  const bio = (req.body.bio || '').trim();
  const tenure = (req.body.tenure || '2025/2026').trim();
  const display_order = parseInt(req.body.display_order !== undefined ? req.body.display_order : 10, 10);

  if (!name || !office) {
    return res.status(400).json({ error: 'Full name and executive portfolio/office are required' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO executives (name, office, level, phone, email, photo_url, bio, tenure, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const result = insert.run(
      name,
      office,
      level,
      phone,
      email,
      photo_url,
      bio,
      tenure,
      display_order
    );

    const newExec = db.prepare('SELECT * FROM executives WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatExecutive(newExec));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth(), (req, res) => {
  try {
    const rawId = req.params.id;
    const targetId = parseInt(rawId, 10);
    const idToQuery = !isNaN(targetId) ? targetId : rawId;

    const existing = db.prepare('SELECT * FROM executives WHERE id = ?').get(idToQuery);
    if (!existing) {
      return res.status(404).json({ error: 'Executive not found' });
    }

    const name = (req.body.name !== undefined ? req.body.name : existing.name || '').trim();
    const office = (req.body.office || req.body.portfolio || req.body.role || existing.office || '').trim();
    
    const parsedLevel = req.body.level !== undefined ? parseInt(req.body.level, 10) : NaN;
    const level = !isNaN(parsedLevel) && parsedLevel > 0 ? parsedLevel : (existing.level || 400);

    const phone = req.body.phone !== undefined ? String(req.body.phone).trim() : (existing.phone || '');
    const email = req.body.email !== undefined ? String(req.body.email).trim() : (existing.email || '');
    const photo_url = (req.body.photo_url || req.body.image_url || existing.photo_url || '/resources/images/exco_president.jpg').trim();
    const bio = req.body.bio !== undefined ? String(req.body.bio).trim() : (existing.bio || '');
    const tenure = (req.body.tenure || existing.tenure || '2025/2026').trim();
    
    const parsedOrder = req.body.display_order !== undefined ? parseInt(req.body.display_order, 10) : NaN;
    const display_order = !isNaN(parsedOrder) && parsedOrder >= 0 ? parsedOrder : (existing.display_order || 1);

    if (!name || !office) {
      return res.status(400).json({ error: 'Full name and executive portfolio/office cannot be empty' });
    }

    const update = db.prepare(`
      UPDATE executives
      SET name = ?, office = ?, level = ?, phone = ?, email = ?, photo_url = ?, bio = ?, tenure = ?, display_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    update.run(
      name,
      office,
      level,
      phone,
      email,
      photo_url,
      bio,
      tenure,
      display_order,
      idToQuery
    );

    const updated = db.prepare('SELECT * FROM executives WHERE id = ?').get(idToQuery);
    res.json(formatExecutive(updated));
  } catch (err) {
    console.error('Error saving executive profile:', err);
    res.status(500).json({ error: err.message || 'Failed to update executive profile' });
  }
});

router.delete('/:id', requireAuth(), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM executives WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    res.json({ success: true, message: 'Executive deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
