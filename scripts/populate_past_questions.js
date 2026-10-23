import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const db = new DatabaseSync('./data/nass_portal.db');
const manifest = JSON.parse(fs.readFileSync('./downloaded_pq_manifest.json', 'utf-8'));

console.log(`Loaded ${manifest.length} downloaded past questions.`);

// Map course codes to course details in the DB
const courseLookup = {
  'STA 311': { id: 61, code: 'STA 311', title: 'Probability III', level: 300, semester: 1 },
  'STA 312': { id: 71, code: 'STA 312', title: 'Distribution theory I', level: 300, semester: 2 },
  'STA 321': { id: 62, code: 'STA 321', title: 'Statistical Inference III', level: 300, semester: 1 },
  'STA 324': { id: 72, code: 'STA 324', title: 'Survey methods and sampling theory', level: 300, semester: 2 },
  'STA 342': { id: 75, code: 'NAU-STA 342', title: 'Statistical Application of Matrix Algebra', level: 300, semester: 2 },
  'STA 351': { id: 65, code: 'NAU-STA 351', title: 'Analysis of Variance I', level: 300, semester: 1 },
  'STA 361': { id: 66, code: 'NAU-STA 361', title: 'Demography', level: 300, semester: 1 },
  'STA 362': { id: 74, code: 'NAU-STA 362', title: 'Statistical Methods In Epidemiology', level: 300, semester: 2 },
  'STA 371': { id: 67, code: 'NAU-STA 371', title: 'Operations Research I', level: 300, semester: 1 }
};

// Remove any prior test/duplicate inserts of these downloaded files
db.prepare("DELETE FROM course_resources WHERE file_path LIKE '/resources/past_questions/%'").run();

const insertStmt = db.prepare(`
  INSERT INTO course_resources (
    course_id,
    title,
    resource_type,
    file_name,
    file_path,
    file_size,
    academic_year,
    semester,
    preview_image,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

// Count papers per course for numbering (Paper 1, Paper 2, etc.)
const coursePaperCounts = {};

manifest.forEach((item, index) => {
  const code = item.course_code;
  const cInfo = courseLookup[code] || { id: 61, code: code, title: 'Departmental Statistics Examination', level: 300, semester: 1 };
  
  coursePaperCounts[code] = (coursePaperCounts[code] || 0) + 1;
  const paperNumber = coursePaperCounts[code];
  
  // Format clean title e.g. "STA 311: Probability III Past Examination Paper (Paper 1)"
  const title = `${cInfo.code}: ${cInfo.title} Past Examination Paper (Paper ${paperNumber})`;
  const academicYear = '2023/2024'; // Standard recent exam session
  
  insertStmt.run(
    cInfo.id,
    title,
    'past_question',
    item.file_name,
    item.file_path,
    item.file_size,
    academicYear,
    cInfo.semester,
    item.file_path // The preview image is the image itself!
  );
  
  console.log(`[Inserted ${index + 1}/29] ${title} -> ${item.file_path}`);
});

const totalPQ = db.prepare("SELECT count(*) as count FROM course_resources WHERE resource_type = 'past_question'").get();
console.log(`Total past questions now in DB: ${totalPQ.count}`);
