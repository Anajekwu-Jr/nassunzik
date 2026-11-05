import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

let cachedPathways = null;

function getCareerPathways() {
  if (Array.isArray(cachedPathways) && cachedPathways.length > 0) {
    return cachedPathways;
  }

  const candidatePaths = [
    path.join(ROOT_DIR, 'data', 'career_pathways.json'),
    path.join(process.cwd(), 'data', 'career_pathways.json'),
    path.join(ROOT_DIR, 'dist', 'data', 'career_pathways.json'),
    path.join(process.cwd(), 'dist', 'data', 'career_pathways.json')
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedPathways = parsed;
          return cachedPathways;
        }
      } catch (err) {
        console.warn('Notice reading career_pathways.json from', filePath, err.message);
      }
    }
  }

  // Backup check in portal_state_backup.json
  const backupPath = path.join(ROOT_DIR, 'data', 'portal_state_backup.json');
  if (fs.existsSync(backupPath)) {
    try {
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      if (Array.isArray(backup.careers) && backup.careers.length > 0) {
        cachedPathways = backup.careers;
        return cachedPathways;
      }
    } catch (_) {}
  }

  return [];
}

// GET all career pathways with optional filters
router.get('/', (req, res) => {
  try {
    let pathways = getCareerPathways();
    const { domain, level, q } = req.query;

    if (domain && domain.trim() !== '') {
      const dLower = domain.toLowerCase().trim();
      pathways = pathways.filter(p => (p.domain || '').toLowerCase().includes(dLower));
    }

    if (level && level.trim() !== '') {
      const lvlNum = parseInt(level, 10);
      if (!isNaN(lvlNum)) {
        pathways = pathways.filter(p =>
          Array.isArray(p.unizik_courses) && p.unizik_courses.some(c => c && c.level === lvlNum)
        );
      }
    }

    if (q && q.trim() !== '') {
      const qLower = q.toLowerCase().trim();
      pathways = pathways.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(qLower);
        const taglineMatch = (p.tagline || '').toLowerCase().includes(qLower);
        const overviewMatch = (p.overview || '').toLowerCase().includes(qLower);
        const roleMatch = Array.isArray(p.potential_roles) && p.potential_roles.some(r => (r || '').toLowerCase().includes(qLower));
        const skillMatch = Array.isArray(p.skills_to_add) && p.skills_to_add.some(s => (s || '').toLowerCase().includes(qLower));
        const courseMatch = Array.isArray(p.unizik_courses) && p.unizik_courses.some(c =>
          (c.code || '').toLowerCase().includes(qLower) || (c.title || '').toLowerCase().includes(qLower)
        );
        return titleMatch || taglineMatch || overviewMatch || roleMatch || skillMatch || courseMatch;
      });
    }

    return res.json(pathways);
  } catch (err) {
    console.error('Error serving /api/careers:', err);
    return res.json(getCareerPathways());
  }
});

// GET summary breakdown for a specific academic level (100, 200, 300, 400)
router.get('/level/:level', (req, res) => {
  try {
    const lvlNum = parseInt(req.params.level, 10);
    if (isNaN(lvlNum) || ![100, 200, 300, 400].includes(lvlNum)) {
      return res.status(400).json({ error: 'Valid levels are 100, 200, 300, 400' });
    }

    const pathways = getCareerPathways();
    const levelData = {
      level: lvlNum,
      courses_taught: [],
      unlocked_pathways: []
    };

    const courseMap = new Map();

    for (const p of pathways) {
      let matchesPathway = false;
      if (Array.isArray(p.unizik_courses)) {
        for (const c of p.unizik_courses) {
          if (c && c.level === lvlNum) {
            matchesPathway = true;
            if (!courseMap.has(c.code)) {
              courseMap.set(c.code, {
                code: c.code,
                title: c.title,
                level: c.level,
                relevant_pathways: [p.title]
              });
            } else {
              const existing = courseMap.get(c.code);
              if (!existing.relevant_pathways.includes(p.title)) {
                existing.relevant_pathways.push(p.title);
              }
            }
          }
        }
      }
      if (matchesPathway) {
        levelData.unlocked_pathways.push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          domain: p.domain,
          tagline: p.tagline
        });
      }
    }

    levelData.courses_taught = Array.from(courseMap.values());
    return res.json(levelData);
  } catch (err) {
    console.error('Error serving /api/careers/level/:level:', err);
    return res.json({ level: parseInt(req.params.level, 10) || 100, courses_taught: [], unlocked_pathways: [] });
  }
});

// GET single career pathway by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const pathways = getCareerPathways();
    const pathway = pathways.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug);

    if (!pathway) {
      return res.status(404).json({ error: 'Career pathway not found' });
    }

    return res.json(pathway);
  } catch (err) {
    console.error('Error serving /api/careers/:idOrSlug:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
