import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();

function getCareerPathways() {
  const filePath = path.join(process.cwd(), 'data', 'career_pathways.json');
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading career_pathways.json:', err);
    }
  }
  return [];
}

// GET all career pathways with optional filters
router.get('/', (req, res) => {
  let pathways = getCareerPathways();
  const { domain, level, q } = req.query;

  if (domain && domain.trim() !== '') {
    const dLower = domain.toLowerCase();
    pathways = pathways.filter(p => p.domain.toLowerCase().includes(dLower));
  }

  if (level && level.trim() !== '') {
    const lvlNum = parseInt(level, 10);
    if (!isNaN(lvlNum)) {
      pathways = pathways.filter(p => 
        p.unizik_courses && p.unizik_courses.some(c => c.level === lvlNum)
      );
    }
  }

  if (q && q.trim() !== '') {
    const qLower = q.toLowerCase();
    pathways = pathways.filter(p => 
      p.title.toLowerCase().includes(qLower) ||
      p.tagline.toLowerCase().includes(qLower) ||
      p.overview.toLowerCase().includes(qLower) ||
      (p.potential_roles && p.potential_roles.some(r => r.toLowerCase().includes(qLower))) ||
      (p.skills_to_add && p.skills_to_add.some(s => s.toLowerCase().includes(qLower))) ||
      (p.unizik_courses && p.unizik_courses.some(c => c.code.toLowerCase().includes(qLower) || c.title.toLowerCase().includes(qLower)))
    );
  }

  res.json(pathways);
});

// GET summary breakdown for a specific academic level (100, 200, 300, 400)
router.get('/level/:level', (req, res) => {
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
    if (p.unizik_courses) {
      for (const c of p.unizik_courses) {
        if (c.level === lvlNum) {
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
  res.json(levelData);
});

// GET single career pathway by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const pathways = getCareerPathways();
  const pathway = pathways.find(p => p.id === idOrSlug || p.slug === idOrSlug);

  if (!pathway) {
    return res.status(404).json({ error: 'Career pathway not found' });
  }

  res.json(pathway);
});

export default router;
