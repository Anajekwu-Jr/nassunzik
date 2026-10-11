import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'data/nass_portal.db');
const db = new DatabaseSync(dbPath);

export const officialExecs = [
  {
    name: 'Comr. Anajekwu Chidera Patrick (PhanCore)',
    office: 'President & Executive Lead',
    roleKey: '%President%',
    level: 400,
    phone: '08087955696',
    email: 'cp.anajekwu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/president.png?v=2',
    bio: 'Leading the Executive Administration with dedication to student welfare, academic excellence, data skills development, and industrial linkages.',
    tenure: '2026/2027',
    display_order: 1
  },
  {
    name: 'Comr. Obunadike Vivian Chiemerie',
    office: 'Vice President',
    roleKey: '%Vice President%',
    level: 400,
    phone: '+234 916 664 5452',
    email: 'cv.obunadike@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/vice_president.jpg?v=2',
    bio: 'Vice President of NASS UNIZIK Chapter, leading executive committee oversight, student welfare coordination, and collaborative departmental development.',
    tenure: '2026/2027',
    display_order: 2
  },
  {
    name: 'Comr. Chidozie Rejoice Ogochukwu',
    office: 'Secretary General',
    roleKey: '%Secretary General%',
    level: 400,
    phone: '+234 812 345 6791',
    email: 'secgen@nass-unizik.org',
    photo_url: '/resources/images/executives/secretary_general.jpg?v=2',
    bio: 'Managing administrative correspondence, official secretarial records, meeting archives, and departmental notifications.',
    tenure: '2026/2027',
    display_order: 3
  },
  {
    name: 'Comr. Ejefonye Mmesoma Stephanie',
    office: 'Director of Academics',
    roleKey: '%Academics%',
    level: 300,
    phone: '07062399227',
    email: 'm.ejefonye@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/director_of_academics.jpg?v=2',
    bio: 'Directing academic affairs and scholastic development for statistics undergraduates. Coordinating course study circles, syllabus coverage, tutorial classes, and past question archives.',
    tenure: '2026/2027',
    display_order: 4
  },
  {
    name: 'Comr. Chinedu Chidinma Veronica',
    office: 'Financial Secretary',
    roleKey: '%Financial%',
    level: 400,
    phone: '09022372647',
    email: 'vc.chinedu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/financial_secretary.jpg?v=2',
    bio: 'Responsible for departmental association dues records, fiscal receipts, statutory accounting, and financial transparency.',
    tenure: '2026/2027',
    display_order: 5
  },
  {
    name: 'Comr. Ezenwelu Chiamaka Princess',
    office: 'Treasurer',
    roleKey: '%Treasurer%',
    level: 400,
    phone: '09071473090',
    email: 'cp.ezenwelu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/treasurer.jpg?v=2',
    bio: 'Custodian of association funds, managing treasury disbursements, banking transactions, and financial custody.',
    tenure: '2026/2027',
    display_order: 6
  },
  {
    name: 'Comr. Ugochukwu Franklin',
    office: 'Director of Sports',
    roleKey: '%Sports%',
    level: 400,
    phone: '08165607073',
    email: 'f_878.ugochukwu@stu.unizik.edu.ng',
    photo_url: '/resources/images/executives/director_of_sports.jpg?v=2',
    bio: 'Coordinating departmental athletic events, Dean Cup championships, inter-level football fixtures, and student fitness activities.',
    tenure: '2026/2027',
    display_order: 7
  },
  {
    name: 'Comr. Offorkee Chidera Elvis',
    office: 'Director of Socials',
    roleKey: '%Socials%',
    level: 300,
    phone: '08144016159/09050148729',
    email: '',
    photo_url: '/resources/images/executives/director_of_socials.jpg?v=2',
    bio: 'Chief coordinator of the Annual NASS Week, freshmen orientation banquet, cultural festivals, student welfare, and social engagements.',
    tenure: '2026/2027',
    display_order: 8
  }
];

export function syncDatabase() {
  // Clear and re-populate the executives table cleanly with standard IDs and exact data
  db.exec('DELETE FROM executives');
  
  const insertExec = db.prepare(`
    INSERT INTO executives (id, name, office, level, phone, email, photo_url, bio, tenure, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  officialExecs.forEach((ex, idx) => {
    insertExec.run(
      idx + 1,
      ex.name,
      ex.office,
      ex.level,
      ex.phone,
      ex.email,
      ex.photo_url,
      ex.bio,
      ex.tenure,
      ex.display_order
    );
    console.log(`Inserted ID ${idx + 1}: ${ex.office} -> ${ex.name} (${ex.photo_url})`);
  });

  const rows = db.prepare('SELECT id, name, office, phone, email, photo_url FROM executives ORDER BY display_order ASC').all();
  console.log('\nFinal verified executives in DB:');
  console.log(JSON.stringify(rows, null, 2));
}

syncDatabase();
