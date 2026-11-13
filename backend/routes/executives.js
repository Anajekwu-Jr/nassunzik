import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db, exportSnapshot } from '../database.js';
import { requireAuth } from '../middleware/auth.js';
import {
  NASS_EXECS_DRIVE_FOLDER_ID,
  NASS_EXECS_DRIVE_FOLDER_URL,
  getDriveExecutiveFolderMap,
  resolveDriveFileIdForExecutive,
  shouldUseDrivePhoto,
  fetchDrivePhoto,
  resolveLocalFallbackPath,
  clearDriveCaches
} from '../services/driveExecutivesSync.js';

const router = express.Router();

function formatExecutive(exec, driveEntries = null) {
  if (!exec) return null;
  const basePhotoUrl = exec.photo_url || '/resources/images/executives/president.jpg?v=3';
  let resolvedPhotoUrl = basePhotoUrl;
  let driveFileId = null;

  if (driveEntries && shouldUseDrivePhoto(basePhotoUrl)) {
    driveFileId = resolveDriveFileIdForExecutive(exec, driveEntries);
    if (driveFileId) {
      resolvedPhotoUrl = `/api/executives/drive-photo/${driveFileId}?fallback=${encodeURIComponent(basePhotoUrl)}`;
    }
  }

  return {
    ...exec,
    photo_url: resolvedPhotoUrl,
    local_photo_url: basePhotoUrl,
    drive_file_id: driveFileId,
    portfolio: exec.office,
    role: exec.office
  };
}

const OFFICIAL_FALLBACK_EXECUTIVES = [
  {
    id: 1,
    name: 'Comr. Anajekwu Chidera Patrick (PhanCore)',
    office: 'President & Executive Lead',
    level: 400,
    phone: '08087955696',
    email: 'cp.anajekwu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/president.jpg?v=3',
    bio: 'Leading the Executive Administration with dedication to student welfare, academic excellence, data skills development, and industrial linkages.',
    tenure: '2026/2027',
    display_order: 1
  },
  {
    id: 2,
    name: 'Comr. Obunadike Vivian Chiemerie',
    office: 'Vice President',
    level: 400,
    phone: '+234 916 664 5452',
    email: 'cv.obunadike@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/vice_president.jpg?v=2',
    bio: 'Vice President of NASS UNIZIK Chapter, leading executive committee oversight, student welfare coordination, and collaborative departmental development.',
    tenure: '2026/2027',
    display_order: 2
  },
  {
    id: 3,
    name: 'Comr. Chidozie Rejoice Ogochukwu',
    office: 'Secretary General',
    level: 400,
    phone: '07043119361',
    email: 'ro.chidozie@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/secretary_general.jpg?v=2',
    bio: 'Managing administrative correspondence, official secretarial records, meeting archives, and departmental notifications.',
    tenure: '2026/2027',
    display_order: 3
  },
  {
    id: 4,
    name: 'Comr. Ejefonye Mmesoma Stephanie',
    office: 'Director of Academics',
    level: 300,
    phone: '07062399227',
    email: 'm.ejefonye@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/director_of_academics.jpg?v=2',
    bio: 'Directing academic affairs and scholastic development for statistics undergraduates. Coordinating course study circles, syllabus coverage, tutorial classes, and past question archives.',
    tenure: '2026/2027',
    display_order: 4
  },
  {
    id: 5,
    name: 'Comr. Chinedu Chidinma Veronica',
    office: 'Financial Secretary',
    level: 400,
    phone: '09022372647',
    email: 'vc.chinedu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/financial_secretary.jpg?v=2',
    bio: 'Responsible for departmental association dues records, fiscal receipts, statutory accounting, and financial transparency.',
    tenure: '2026/2027',
    display_order: 5
  },
  {
    id: 6,
    name: 'Comr. Ezenwelu Chiamaka Princess',
    office: 'Treasurer',
    level: 400,
    phone: '09071473090',
    email: 'cp.ezenwelu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/treasurer.jpg?v=2',
    bio: 'Custodian of association funds, managing treasury disbursements, banking transactions, and financial custody.',
    tenure: '2026/2027',
    display_order: 6
  },
  {
    id: 7,
    name: 'Comr. Ugochukwu Franklin',
    office: 'Director of Sports',
    level: 400,
    phone: '08165607073',
    email: 'f_878.ugochukwu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/director_of_sports.jpg?v=2',
    bio: 'Coordinating departmental athletic events, Dean Cup championships, inter-level football fixtures, and student fitness activities.',
    tenure: '2026/2027',
    display_order: 7
  },
  {
    id: 8,
    name: 'Comr. Offorkee Chidera Elvis',
    office: 'Director of Socials',
    level: 300,
    phone: '08144016159/09050148729',
    email: '',
    photo_url: '/resources/images/executives/director_of_socials.jpg?v=2',
    bio: 'Coordinator of social activities in the department.',
    tenure: '2026/2027',
    display_order: 8
  }
];

function getExecutivesFallback() {
  try {
    const backupFile = path.resolve(process.cwd(), 'data', 'portal_state_backup.json');
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
      if (Array.isArray(data.executives) && data.executives.length > 0) {
        return data.executives;
      }
    }
  } catch (_) {}
  return OFFICIAL_FALLBACK_EXECUTIVES;
}

// Live Google Drive photo proxy with in-memory/tmp caching & local fallback
router.get('/drive-photo/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';

  try {
    const photo = await fetchDrivePhoto(fileId, forceRefresh);
    if (photo && photo.buffer) {
      res.setHeader('Content-Type', photo.contentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
      res.setHeader('X-Image-Source', 'google-drive');
      return res.send(photo.buffer);
    }
  } catch (_) {}

  const fallbackPath =
    resolveLocalFallbackPath(req.query.fallback) ||
    resolveLocalFallbackPath('/resources/images/executives/president.jpg');

  if (fallbackPath) {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Image-Source', 'local-fallback');
    return res.sendFile(fallbackPath);
  }

  return res.status(404).json({ error: 'Executive photo not found' });
});

// Inspect connected Google Drive folder status
router.get('/drive-status', async (req, res) => {
  const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const folder = await getDriveExecutiveFolderMap(forceRefresh);
  res.json({
    folderId: NASS_EXECS_DRIVE_FOLDER_ID,
    folderUrl: NASS_EXECS_DRIVE_FOLDER_URL,
    fetchedAt: folder.fetchedAt ? new Date(folder.fetchedAt).toISOString() : null,
    lastError: folder.lastError,
    entries: folder.entries,
    rawFiles: folder.rawList
  });
});

// Force immediate refresh from connected Google Drive folder
router.post('/sync-drive', requireAuth(), async (_req, res) => {
  clearDriveCaches();
  const folder = await getDriveExecutiveFolderMap(true);
  res.json({
    success: true,
    folderId: NASS_EXECS_DRIVE_FOLDER_ID,
    folderUrl: NASS_EXECS_DRIVE_FOLDER_URL,
    entries: folder.entries,
    rawFiles: folder.rawList,
    lastError: folder.lastError
  });
});

router.get('/', async (req, res) => {
  const forceSync = req.query.sync === '1' || req.query.sync === 'true';
  let driveEntries = null;
  try {
    const folder = await getDriveExecutiveFolderMap(forceSync);
    driveEntries = folder.entries;
  } catch (_) {}

  try {
    const { tenure } = req.query;
    let query = 'SELECT * FROM executives WHERE 1=1';
    const params = [];

    if (tenure) {
      query += ' AND tenure = ?';
      params.push(tenure);
    }

    query += ' ORDER BY display_order ASC, name ASC';
    let executives = [];
    try {
      executives = db.prepare(query).all(...params);
    } catch (dbErr) {
      console.warn('Executives DB query warning, using fallback:', dbErr.message);
      executives = getExecutivesFallback();
      if (tenure) {
        executives = executives.filter(e => e.tenure === tenure);
      }
    }

    if (!Array.isArray(executives) || executives.length === 0) {
      executives = getExecutivesFallback();
    }

    res.json(executives.map(ex => formatExecutive(ex, driveEntries)));
  } catch (err) {
    console.error('Unhandled error in /api/executives GET:', err);
    res.json(getExecutivesFallback().map(ex => formatExecutive(ex, driveEntries)));
  }
});

router.get('/:id', async (req, res) => {
  let driveEntries = null;
  try {
    const folder = await getDriveExecutiveFolderMap(false);
    driveEntries = folder.entries;
  } catch (_) {}

  try {
    let executive;
    try {
      executive = db.prepare('SELECT * FROM executives WHERE id = ?').get(req.params.id);
    } catch (dbErr) {
      console.warn('Single executive DB query warning:', dbErr.message);
    }

    if (!executive) {
      const fallbackList = getExecutivesFallback();
      const targetId = parseInt(req.params.id, 10);
      executive = fallbackList.find(e => e.id === targetId || String(e.id) === String(req.params.id));
    }

    if (!executive) {
      return res.status(404).json({ error: 'Executive not found' });
    }
    res.json(formatExecutive(executive, driveEntries));
  } catch (err) {
    console.error('Unhandled error in /api/executives/:id GET:', err);
    res.status(500).json({ error: 'Unable to retrieve executive record' });
  }
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
    exportSnapshot();
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
    exportSnapshot();
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
    exportSnapshot();
    res.json({ success: true, message: 'Executive deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
