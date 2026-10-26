import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';
import { db } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CACHE_FILE = path.join(ROOT_DIR, 'data', 'sam_ai_knowledge_cache.json');

// Directories to scan for PDF files
const PDF_DIRS = [
  path.join(ROOT_DIR, 'resources', 'materials'),
  path.join(ROOT_DIR, 'public', 'resources', 'materials'),
  path.join(ROOT_DIR, 'resources', 'documents'),
  path.join(ROOT_DIR, 'public', 'resources', 'documents'),
  path.join(ROOT_DIR, 'uploads'),
  path.join(ROOT_DIR, 'public', 'uploads')
];

let cachedChunks = [];
let lastIndexedTime = 0;
let isIndexing = false;

function hasNewOrModifiedFiles(sinceTime) {
  if (!sinceTime) return true;
  for (const dir of PDF_DIRS) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!file.toLowerCase().endsWith('.pdf')) continue;
        const stat = fs.statSync(path.join(dir, file));
        if (stat.mtimeMs > sinceTime) return true;
      }
    } catch {}
  }
  return false;
}

/**
 * Extracts a course code from filename or text header.
 */
function detectCourseCode(filename, textSample = '') {
  const combined = `${filename} ${textSample.slice(0, 300)}`.toUpperCase();
  const match = combined.match(/\b(STA|STAT|MTH|MAT|COS|CSC|GST|BIO|PHY|BUA|ENT)\s*[-_]?\s*(\d{3})\b/i);
  if (match) {
    const prefix = match[1].replace('STAT', 'STA').replace('MAT', 'MTH').toUpperCase();
    return `${prefix} ${match[2]}`;
  }
  if (combined.includes('SIWES') || combined.includes('INDUSTRIAL TRAINING')) {
    return 'SIWES';
  }
  if (combined.includes('TABLE') || combined.includes('STATISTICAL TABLES')) {
    return 'STAT TABLES';
  }
  if (combined.includes('SCHAUM') || combined.includes('PROBABILITY')) {
    return 'STA REF';
  }
  return 'GENERAL';
}

/**
 * Splits text into readable chunks with slight overlap.
 */
function splitIntoChunks(text, chunkSize = 750, overlap = 100) {
  const clean = text.replace(/\r/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
  if (clean.length <= chunkSize) {
    return clean.length > 30 ? [clean] : [];
  }
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = start + chunkSize;
    if (end < clean.length) {
      // Try to break at a sentence or newline boundary
      const boundary = clean.lastIndexOf('. ', end);
      const newlineBoundary = clean.lastIndexOf('\n', end);
      const naturalCut = Math.max(boundary !== -1 ? boundary + 1 : -1, newlineBoundary !== -1 ? newlineBoundary : -1);
      if (naturalCut > start + 300) {
        end = naturalCut;
      }
    } else {
      end = clean.length;
    }
    const chunk = clean.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
    start = end - overlap;
    if (start >= clean.length || end === clean.length) break;
  }
  return chunks;
}

/**
 * Reads and chunks text from departmental database (courses, staff, excos, announcements, faqs).
 */
function getDepartmentChunks() {
  const deptChunks = [];

  try {
    // 1. Courses
    const courses = db.prepare('SELECT code, title, level, semester, credit_units, description, outline FROM courses').all();
    for (const c of courses) {
      const text = `Course Code: ${c.code}\nCourse Title: ${c.title}\nLevel: ${c.level} Level (Semester ${c.semester})\nCredit Units: ${c.credit_units || 3}\nDescription: ${c.description || 'Core Departmental Statistics Course'}\nSyllabus Outline: ${c.outline || 'Standard NUC / UNIZIK syllabus curriculum.'}`;
      deptChunks.push({
        id: `dept-course-${c.code.replace(/\s+/g, '')}`,
        courseCode: c.code,
        fileName: 'Department Course Catalog / Curriculum',
        text,
        category: 'course'
      });
    }
  } catch (err) {
    console.warn('Could not index courses for Sam AI:', err.message);
  }

  try {
    // 2. Executives
    const excos = db.prepare('SELECT name, office, level, phone, bio, tenure FROM executives').all();
    for (const e of excos) {
      const text = `Executive Officer: ${e.name}\nOffice: ${e.office}\nLevel: ${e.level} Level\nTenure: ${e.tenure || '2026/2027'}\nPhone/Contact: ${e.phone || 'Available via NASS Secretariat'}\nDuties & Bio: ${e.bio || 'Executive Officer of the National Association of Statistics Students (NASS UNIZIK).'}`;
      deptChunks.push({
        id: `dept-exco-${e.office.replace(/\s+/g, '')}`,
        courseCode: 'NASS EXCO',
        fileName: 'NASS Executive Council Directory',
        text,
        category: 'executive'
      });
    }
  } catch (err) {
    console.warn('Could not index executives for Sam AI:', err.message);
  }

  try {
    // 3. Staff members
    const staff = db.prepare('SELECT name, title, role_category, qualifications, specialization, email, phone, office, bio FROM staff').all();
    for (const s of staff) {
      const text = `Staff Member: ${s.title || ''} ${s.name}\nRole Category: ${s.role_category || 'Academic'}\nQualifications: ${s.qualifications || 'B.Sc, M.Sc, Ph.D'}\nArea of Specialization: ${s.specialization || 'Statistics'}\nOffice: ${s.office || 'Statistics Complex, Faculty of Physical Sciences'}\nEmail: ${s.email || 'statistics@unizik.edu.ng'}\nBiography & Background: ${s.bio || 'Department of Statistics Lecturer, Nnamdi Azikiwe University'}`;
      deptChunks.push({
        id: `dept-staff-${s.name.replace(/\s+/g, '').slice(0, 15)}`,
        courseCode: 'STAFF',
        fileName: 'Department Academic Staff & CIRS Directory',
        text,
        category: 'staff'
      });
    }
  } catch (err) {
    console.warn('Could not index staff for Sam AI:', err.message);
  }

  try {
    // 4. Announcements
    const announcements = db.prepare('SELECT title, content, priority, created_at FROM announcements WHERE is_active = 1').all();
    for (const a of announcements) {
      const text = `Announcement Title: ${a.title}\nPriority: ${a.priority}\nDate: ${a.created_at || 'Current 2026/2027 Academic Term'}\nDetails: ${a.content}`;
      deptChunks.push({
        id: `dept-ann-${a.title.slice(0, 20).replace(/\s+/g, '')}`,
        courseCode: 'NOTICEBOARD',
        fileName: 'Departmental Noticeboard Bulletin',
        text,
        category: 'announcement'
      });
    }
  } catch (err) {
    console.warn('Could not index announcements for Sam AI:', err.message);
  }

  try {
    // 5. FAQs
    const faqs = db.prepare('SELECT question, answer, category FROM faqs').all();
    for (const f of faqs) {
      const text = `Frequently Asked Question: ${f.question}\nCategory: ${f.category}\nOfficial Answer: ${f.answer}`;
      deptChunks.push({
        id: `dept-faq-${f.question.slice(0, 20).replace(/\s+/g, '')}`,
        courseCode: f.category || 'FAQ',
        fileName: 'Departmental Knowledge Base FAQ',
        text,
        category: 'faq'
      });
    }
  } catch (err) {
    console.warn('Could not index FAQs for Sam AI:', err.message);
  }

  // 6. Explicit authoritative SIWES guidelines chunk
  deptChunks.push({
    id: 'dept-siwes-official-rules',
    courseCode: 'SIWES',
    fileName: 'Official SIWES Industrial Training Protocol',
    text: `STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES) - DEPARTMENT OF STATISTICS, UNIZIK:\n` +
      `Duration & Structure: SIWES is 3 months and is done twice: first after 200 Level second semester (SIWES I), and second after 300 Level second semester (SIWES II).\n` +
      `Departmental SIWES Coordinator: Mr. Charles Anabike (Dr. Anabike Ifeanyi Charles), Assistant Lecturer. Office: Ground floor, New Physical Sciences Building. Advisory hours: Mon - Thu 10:00 AM - 2:00 PM. Email: ci.anabike@unizik.edu.ng.\n` +
      `Procedure: Collect official introductory letter signed by HOD and Coordinator, submit application, obtain host acceptance letter and submit copy to Coordinator. Maintain daily logbook and present 3 spiral-bound technical reports and oral defense before departmental panel.\n` +
      `Note: SIWES is strictly 3 months each time (twice total), NOT 6 months.`,
    category: 'siwes'
  });

  return deptChunks;
}

/**
 * Parses a single PDF file and returns chunks.
 */
async function parsePdfFile(filePath, filename) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Limit parsing to max 25MB buffer
    if (buffer.length > 25 * 1024 * 1024) {
      console.warn(`Skipping oversized file ${filename} (${buffer.length} bytes)`);
      return [];
    }

    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    const text = result && result.text ? result.text : (typeof result === 'string' ? result : '');
    await parser.destroy().catch(() => {});

    if (!text || text.trim().length < 40) {
      return [];
    }

    const courseCode = detectCourseCode(filename, text);
    const rawChunks = splitIntoChunks(text, 800, 120);

    return rawChunks.map((chunk, index) => ({
      id: `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_chunk_${index}`,
      courseCode,
      fileName: filename,
      text: chunk,
      category: 'pdf_material'
    }));
  } catch (err) {
    console.warn(`Error parsing PDF ${filename}:`, err.message);
    return [];
  }
}

/**
 * Builds or refreshes the knowledge base chunks.
 */
export async function buildKnowledgeBase(force = false) {
  if (isIndexing) return cachedChunks;
  isIndexing = true;

  try {
    // If not forced, check if cache is valid and no files were added or modified
    if (!force && fs.existsSync(CACHE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        const cacheTime = data.timestamp || 0;
        if (!hasNewOrModifiedFiles(cacheTime) && Array.isArray(data.chunks) && data.chunks.length > 0) {
          cachedChunks = data.chunks;
          lastIndexedTime = cacheTime;
          console.log(`[Sam AI] Loaded ${cachedChunks.length} chunks from cache (${data.pdfCount || 0} PDFs).`);
          isIndexing = false;
          return cachedChunks;
        } else {
          console.log('[Sam AI] New or modified files detected. Re-indexing knowledge base...');
        }
      } catch (err) {
        console.warn('[Sam AI] Corrupted cache, rebuilding:', err.message);
      }
    }

    console.log('[Sam AI] Building knowledge base from PDFs and department records...');
    const allChunks = [];
    const seenFiles = new Set();
    let pdfCount = 0;

    // 1. Add Department database chunks
    const deptChunks = getDepartmentChunks();
    allChunks.push(...deptChunks);

    // 2. Scan and parse all PDF files
    for (const dir of PDF_DIRS) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);

      for (const file of files) {
        if (!file.toLowerCase().endsWith('.pdf')) continue;
        if (seenFiles.has(file)) continue;
        seenFiles.add(file);

        const fullPath = path.join(dir, file);
        try {
          const fileChunks = await parsePdfFile(fullPath, file);
          if (fileChunks.length > 0) {
            allChunks.push(...fileChunks);
            pdfCount++;
          }
        } catch (e) {
          console.warn(`[Sam AI] Error processing ${file}:`, e.message);
        }
      }
    }

    cachedChunks = allChunks;
    lastIndexedTime = Date.now();

    // Save to cache file asynchronously
    try {
      const cacheDir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify({
        timestamp: lastIndexedTime,
        pdfCount,
        chunkCount: cachedChunks.length,
        chunks: cachedChunks
      }, null, 2));
      console.log(`[Sam AI] Knowledge base saved to cache: ${cachedChunks.length} total chunks from ${pdfCount} PDFs.`);
    } catch (saveErr) {
      console.warn('[Sam AI] Could not write cache file:', saveErr.message);
    }

    return cachedChunks;
  } finally {
    isIndexing = false;
  }
}

/**
 * Retrieves the most relevant chunks for a user question.
 */
export function findRelevantChunks(question, chunks = cachedChunks, topK = 6) {
  if (!chunks || chunks.length === 0) return [];

  const qLower = question.toLowerCase();
  const qTokens = qLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Detect explicit course code in user query (e.g. STA 111, STA 312, SIWES, etc.)
  const courseMatch = qLower.match(/\b(sta|stat|mth|mat|cos|csc|gst|bio|phy|bua|ent)\s*[-_]?\s*(\d{3})\b/i);
  let queriedCourse = null;
  if (courseMatch) {
    const prefix = courseMatch[1].replace('stat', 'sta').replace('mat', 'mth').toUpperCase();
    queriedCourse = `${prefix} ${courseMatch[2]}`;
  } else if (qLower.includes('siwes') || qLower.includes('internship') || qLower.includes('industrial training')) {
    queriedCourse = 'SIWES';
  }

  // Key topic boosts
  const isExcoQuery = qLower.includes('exco') || qLower.includes('executive') || qLower.includes('president') ||
    qLower.includes('social') || qLower.includes('director') || qLower.includes('offorkee') || qLower.includes('treasurer');
  const isStaffQuery = qLower.includes('staff') || qLower.includes('hod') || qLower.includes('lecturer') ||
    qLower.includes('professor') || qLower.includes('osuji') || qLower.includes('enogwe') || qLower.includes('anabike');

  const scored = [];

  for (const chunk of chunks) {
    let score = 0;
    const chunkLower = chunk.text.toLowerCase();
    const fileNameLower = (chunk.fileName || '').toLowerCase();
    const courseCodeUpper = (chunk.courseCode || '').toUpperCase();

    // 1. Direct course code matching boost (+50)
    if (queriedCourse) {
      if (courseCodeUpper.includes(queriedCourse.toUpperCase()) || fileNameLower.includes(queriedCourse.toLowerCase().replace(/\s+/g, ''))) {
        score += 50;
      }
    }

    // 2. Exco / Staff category boosts
    if (isExcoQuery && chunk.category === 'executive') score += 35;
    if (isStaffQuery && (chunk.category === 'staff' || chunk.category === 'siwes')) score += 35;
    if (queriedCourse === 'SIWES' && (chunk.category === 'siwes' || chunk.courseCode === 'SIWES')) score += 60;

    // 3. Exact phrase match boost (+20)
    if (qTokens.length >= 3) {
      const phrase = qTokens.slice(0, 4).join(' ');
      if (chunkLower.includes(phrase)) score += 25;
    }

    // 4. Token presence match
    for (const token of qTokens) {
      if (chunkLower.includes(token)) {
        score += 3;
        // Boost if in title/filename
        if (fileNameLower.includes(token)) score += 5;
      }
    }

    if (score > 0) {
      scored.push({ chunk, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.chunk);
}

export function getKnowledgeBaseStatus() {
  return {
    totalChunks: cachedChunks.length,
    lastIndexedTime: new Date(lastIndexedTime).toISOString(),
    isIndexing
  };
}
