import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../database.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Helper to format bytes
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(0) + ' KB';
  const mb = kb / 1024;
  return mb.toFixed(1) + ' MB';
}

router.get('/', (req, res) => {
  const rawQ = req.query.q ? req.query.q.trim() : '';
  if (!rawQ || rawQ.length < 2) {
    return res.json({
      query: rawQ,
      total: 0,
      categories: {}
    });
  }

  // Generate query variations for flexible matching
  const qClean = rawQ.toLowerCase();
  const qWithoutExt = qClean.replace(/\.(pdf|docx|doc|txt|jpg|jpeg|png|apk|mobileconfig|zip|pptx|ppt|xlsx|xls)$/i, '');
  const qSpaced = qClean.replace(/[_\-\.\/\\]+/g, ' ').trim();
  const qUnderscored = qClean.replace(/[\s\-\.\/\\]+/g, '_').trim();
  const qNoSpace = qClean.replace(/[\s_\-\.\/\\]+/g, '').trim();

  // Word tokens
  const words = qSpaced.split(/\s+/).filter(w => w.length >= 2);

  // Helper matching function
  function matchesQuery(text) {
    if (!text) return false;
    const lower = String(text).toLowerCase();
    const lowerSpaced = lower.replace(/[_\-\.\/\\]+/g, ' ');
    const lowerNoSpace = lower.replace(/[\s_\-\.\/\\]+/g, '');

    if (lower.includes(qClean)) return true;
    if (lower.includes(qWithoutExt)) return true;
    if (lowerSpaced.includes(qSpaced)) return true;
    if (lower.includes(qUnderscored)) return true;
    if (qNoSpace.length >= 3 && lowerNoSpace.includes(qNoSpace)) return true;

    if (words.length > 0 && words.every(w => lower.includes(w) || lowerSpaced.includes(w))) {
      return true;
    }
    return false;
  }

  const categories = {};
  let totalCount = 0;

  // ==========================================
  // 1. DOWNLOADABLE FILES, DOCUMENTS & PDFS
  // ==========================================
  const matchedFiles = [];
  const addedFilePaths = new Set();

  // (A) Core Official Statistical Tables Compendium (Priority Spotlight)
  const isStatsTableQuery = 
    qClean.includes('stat') || 
    qClean.includes('tabl') || 
    qClean.includes('norm') || 
    qClean.includes('distrib') || 
    qClean.includes('chi') || 
    qClean.includes('z-tab') || 
    qClean.includes('t-tab') || 
    qClean.includes('f-tab') || 
    qClean.includes('dougherty') ||
    qClean.includes('compendium');

  if (isStatsTableQuery) {
    matchedFiles.push({
      id: 'doc-statistical-tables',
      title: 'Official Statistical Tables & Distribution Values (10-Page Exam Compendium)',
      file_name: 'Statistical_Tables.pdf',
      file_size: 43961,
      subtitle: 'Normal (Z), Student\'s t, F-Distribution & Chi-Square · PDF (44 KB)',
      description: 'Official 10-page statistical distribution tables compiled by C. Dougherty for all undergraduate examinations, coursework, and statistical modeling.',
      url: '/academia.html#statisticalTablesCompendium',
      downloadUrl: '/resources/documents/Statistical_Tables.pdf',
      type: 'Official Exam Table (PDF)',
      isDownloadable: true,
      category: 'Official Tables'
    });
    addedFilePaths.add('/resources/documents/Statistical_Tables.pdf');
    addedFilePaths.add('/downloads/Statistical_Tables.pdf');
  }

  // (B) Official NASS Mobile Apps (Android APK and iOS WebClip)
  const isAppQuery = 
    qClean.includes('apk') || 
    qClean.includes('app') || 
    qClean.includes('android') || 
    qClean.includes('mobile') || 
    qClean.includes('ios') || 
    qClean.includes('iphone') || 
    qClean.includes('apple') || 
    qClean.includes('nass_unizik');

  if (isAppQuery) {
    if (!addedFilePaths.has('/resources/documents/NASS_UNIZIK.apk') && !addedFilePaths.has('/downloads/NASS_UNIZIK.apk')) {
      matchedFiles.push({
        id: 'app-android-apk',
        title: 'NASS UNIZIK Native Android Mobile App (APK)',
        file_name: 'NASS_UNIZIK.apk',
        file_size: 5350000,
        subtitle: 'Official Android Application Package · Version 2.4.0 (5.4 MB)',
        description: 'Native mobile client for UNIZIK Statistics undergraduates. Features offline lecture schedules, past questions repository, and real-time push notices.',
        url: '/index.html',
        downloadUrl: '/downloads/NASS_UNIZIK.apk',
        type: 'Android App (APK)',
        isDownloadable: true,
        category: 'Mobile Applications'
      });
      addedFilePaths.add('/resources/documents/NASS_UNIZIK.apk');
      addedFilePaths.add('/downloads/NASS_UNIZIK.apk');
    }

    if (!addedFilePaths.has('/downloads/NASS_UNIZIK.mobileconfig')) {
      matchedFiles.push({
        id: 'app-ios-webclip',
        title: 'NASS UNIZIK Apple iOS Mobile WebClip Profile',
        file_name: 'NASS_UNIZIK.mobileconfig',
        file_size: 1045,
        subtitle: 'Apple iOS Signed Configuration Profile · Mobile WebClip (1.0 KB)',
        description: 'Install the native NASS UNIZIK portal icon and fullscreen web experience directly to your iPhone or iPad home screen.',
        url: '/index.html',
        downloadUrl: '/downloads/NASS_UNIZIK.mobileconfig',
        type: 'Apple iOS WebClip Profile',
        isDownloadable: true,
        category: 'Mobile Applications'
      });
      addedFilePaths.add('/downloads/NASS_UNIZIK.mobileconfig');
    }
  }

  // (C) All Course Resources from SQLite Database
  try {
    const courseResources = db.prepare(`
      SELECT cr.id, cr.title, cr.resource_type, cr.academic_year, cr.file_path, cr.file_name, cr.file_size,
             c.id as course_id, c.code as course_code, c.title as course_title, c.level as course_level
      FROM course_resources cr
      JOIN courses c ON cr.course_id = c.id
      ORDER BY cr.id DESC
    `).all();

    for (const cr of courseResources) {
      if (addedFilePaths.has(cr.file_path)) continue;

      const searchableBlob = `${cr.title} ${cr.file_name} ${cr.file_path} ${cr.course_code} ${cr.course_title}`;
      if (matchesQuery(searchableBlob)) {
        addedFilePaths.add(cr.file_path);
        const isPdf = cr.file_name && cr.file_name.toLowerCase().endsWith('.pdf');

        matchedFiles.push({
          id: `cr-${cr.id}`,
          title: cr.title,
          file_name: cr.file_name || path.basename(cr.file_path),
          file_size: cr.file_size || 0,
          subtitle: `${cr.course_code} · ${cr.course_level}L · ${formatFileSize(cr.file_size)}`,
          description: `Course material for ${cr.course_code}: ${cr.course_title}`,
          url: `/academia.html?course=${cr.course_id}#course-${cr.course_id}`,
          downloadUrl: cr.file_path,
          type: isPdf ? 'Course Material (PDF)' : (cr.resource_type === 'past_question' ? 'Past Question' : 'Document'),
          isDownloadable: true,
          category: cr.course_code
        });
      }
    }
  } catch (err) {
    console.error('Error searching course_resources:', err);
  }

  // (D) SIWES Resources from Database
  try {
    const siwesDocs = db.prepare(`
      SELECT id, title, description, category, file_path, file_name, file_size
      FROM siwes_resources
    `).all();

    for (const sd of siwesDocs) {
      if (sd.file_path && !addedFilePaths.has(sd.file_path)) {
        const searchableBlob = `${sd.title} ${sd.description} ${sd.category} ${sd.file_name} ${sd.file_path}`;
        if (matchesQuery(searchableBlob)) {
          addedFilePaths.add(sd.file_path);
          matchedFiles.push({
            id: `siwes-${sd.id}`,
            title: sd.title,
            file_name: sd.file_name || path.basename(sd.file_path),
            file_size: sd.file_size || 0,
            subtitle: `SIWES Official Document · ${sd.category} · ${formatFileSize(sd.file_size)}`,
            description: sd.description,
            url: `/siwes.html`,
            downloadUrl: sd.file_path,
            type: 'SIWES Document',
            isDownloadable: true,
            category: 'SIWES'
          });
        }
      }
    }
  } catch (err) {
    console.error('Error searching siwes_resources:', err);
  }

  // (E) Project Resources from Database
  try {
    const projectDocs = db.prepare(`
      SELECT id, title, description, category, file_path, file_name, file_size
      FROM project_resources
    `).all();

    for (const pd of projectDocs) {
      if (pd.file_path && !addedFilePaths.has(pd.file_path)) {
        const searchableBlob = `${pd.title} ${pd.description} ${pd.category} ${pd.file_name} ${pd.file_path}`;
        if (matchesQuery(searchableBlob)) {
          addedFilePaths.add(pd.file_path);
          matchedFiles.push({
            id: `proj-${pd.id}`,
            title: pd.title,
            file_name: pd.file_name || path.basename(pd.file_path),
            file_size: pd.file_size || 0,
            subtitle: `Final Year Project Resource · ${pd.category} · ${formatFileSize(pd.file_size)}`,
            description: pd.description,
            url: `/projects.html`,
            downloadUrl: pd.file_path,
            type: 'Project Template',
            isDownloadable: true,
            category: 'Projects'
          });
        }
      }
    }
  } catch (err) {
    console.error('Error searching project_resources:', err);
  }

  // (F) Direct Filesystem Scan Across All Directories
  try {
    const searchDirs = [
      path.join(ROOT_DIR, 'resources/documents'),
      path.join(ROOT_DIR, 'resources/materials'),
      path.join(ROOT_DIR, 'public/downloads'),
      path.join(ROOT_DIR, 'resources/images/gallery'),
      path.join(ROOT_DIR, 'resources/images/executives'),
      path.join(ROOT_DIR, 'uploads')
    ];

    for (const sDir of searchDirs) {
      if (!fs.existsSync(sDir)) continue;
      const fList = fs.readdirSync(sDir, { recursive: true });

      for (const fItem of fList) {
        if (typeof fItem !== 'string') continue;
        const fullItemPath = path.join(sDir, fItem);
        if (fs.statSync(fullItemPath).isDirectory()) continue;

        const baseName = path.basename(fItem);
        const lowerName = baseName.toLowerCase();
        let relPath = '/' + path.relative(ROOT_DIR, fullItemPath).replace(/\\/g, '/');

        // Normalize public/downloads to /downloads
        if (relPath.startsWith('/public/downloads/')) {
          relPath = relPath.replace('/public/downloads/', '/downloads/');
        }

        if (addedFilePaths.has(relPath)) continue;

        if (matchesQuery(baseName)) {
          const stat = fs.statSync(fullItemPath);
          addedFilePaths.add(relPath);

          let prettyTitle = baseName.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
          let fileCategory = 'Departmental Document';
          let targetUrl = '/academia.html';

          if (relPath.includes('siwes')) {
            fileCategory = 'SIWES Document';
            targetUrl = '/siwes.html';
          } else if (relPath.includes('gallery')) {
            fileCategory = 'NASS Gallery Photo';
            targetUrl = '/archive.html';
          } else if (relPath.includes('executives')) {
            fileCategory = 'Executive Profile Photo';
            targetUrl = '/nass.html';
          } else if (baseName.endsWith('.apk')) {
            fileCategory = 'Android App (APK)';
            targetUrl = '/index.html';
          } else if (baseName.endsWith('.mobileconfig')) {
            fileCategory = 'Apple iOS Profile';
            targetUrl = '/index.html';
          }

          let fileType = 'Document';
          if (lowerName.endsWith('.pdf')) fileType = 'PDF Document';
          else if (lowerName.endsWith('.apk')) fileType = 'Android App (APK)';
          else if (lowerName.endsWith('.mobileconfig')) fileType = 'Apple iOS WebClip Profile';
          else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.png') || lowerName.endsWith('.jpeg')) fileType = 'Image File';
          else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) fileType = 'Word Document (DOCX)';

          matchedFiles.push({
            id: `fs-${baseName}`,
            title: prettyTitle,
            file_name: baseName,
            file_size: stat.size,
            subtitle: `${fileCategory} · ${formatFileSize(stat.size)}`,
            description: `Official departmental file: ${baseName}`,
            url: targetUrl,
            downloadUrl: relPath,
            type: fileType,
            isDownloadable: true,
            category: fileCategory
          });
        }
      }
    }
  } catch (err) {
    console.error('Direct filesystem search error:', err);
  }

  if (matchedFiles.length > 0) {
    categories.course_resources = matchedFiles;
    totalCount += matchedFiles.length;
  }

  // ==========================================
  // 2. COURSES & ACADEMIC CURRICULUM
  // ==========================================
  try {
    const courses = db.prepare(`
      SELECT id, code, title, level, semester, credit_units, description, outline, status
      FROM courses
      ORDER BY level ASC, code ASC
    `).all();

    const matchedCourses = courses.filter(c => 
      matchesQuery(`${c.code} ${c.title} ${c.description} ${c.outline}`)
    );

    if (matchedCourses.length > 0) {
      categories.courses = matchedCourses.slice(0, 15).map(c => ({
        id: c.id,
        title: `${c.code}: ${c.title}`,
        subtitle: `${c.level} Level · Semester ${c.semester} · ${c.credit_units} Credit Units · ${c.status || 'Compulsory'}`,
        description: c.description ? (c.description.length > 140 ? c.description.substring(0, 140) + '...' : c.description) : 'Official undergraduate curriculum module.',
        url: `/academia.html?course=${c.id}#course-${c.id}`,
        type: 'Course'
      }));
      totalCount += categories.courses.length;
    }
  } catch (err) {
    console.error('Error searching courses:', err);
  }

  // ==========================================
  // 3. STAFF & ACADEMIC FACULTY
  // ==========================================
  try {
    const staff = db.prepare(`
      SELECT id, name, title, role_category, qualifications, specialization, office, email, phone
      FROM staff
      ORDER BY display_order ASC
    `).all();

    const matchedStaff = staff.filter(s => 
      matchesQuery(`${s.name} ${s.title} ${s.role_category} ${s.qualifications} ${s.specialization} ${s.office}`)
    );

    if (matchedStaff.length > 0) {
      categories.staff = matchedStaff.slice(0, 10).map(s => ({
        id: s.id,
        title: s.name,
        subtitle: `${s.title} · ${s.role_category}`,
        description: s.specialization ? `Specialization: ${s.specialization} · Office: ${s.office}` : `Office: ${s.office}`,
        url: `/administration.html#staff-${s.id}`,
        type: 'Academic Staff'
      }));
      totalCount += categories.staff.length;
    }
  } catch (err) {
    console.error('Error searching staff:', err);
  }

  // ==========================================
  // 4. EXECUTIVES & LEADERSHIP
  // ==========================================
  try {
    const executives = db.prepare(`
      SELECT id, name, office, level, phone, email, bio
      FROM executives
      ORDER BY display_order ASC
    `).all();

    const matchedExec = executives.filter(e => 
      matchesQuery(`${e.name} ${e.office} ${e.phone} ${e.email} ${e.bio}`)
    );

    if (matchedExec.length > 0) {
      categories.executives = matchedExec.slice(0, 8).map(e => ({
        id: e.id,
        title: `${e.name} (${e.office})`,
        subtitle: `NASS Executive · ${e.level} Level · 2026/2027 Tenure`,
        description: e.bio ? (e.bio.length > 130 ? e.bio.substring(0, 130) + '...' : e.bio) : 'Official Executive Council Leader',
        url: `/nass.html#exec-${e.id}`,
        type: 'NASS Executive'
      }));
      totalCount += categories.executives.length;
    }
  } catch (err) {
    console.error('Error searching executives:', err);
  }

  // ==========================================
  // 5. GALLERY & PHOTOGRAPHIC ARCHIVES
  // ==========================================
  try {
    const galleryItems = db.prepare(`
      SELECT id, title, year, event_name, image_url, description
      FROM gallery
    `).all();

    const matchedGallery = galleryItems.filter(g => 
      matchesQuery(`${g.title} ${g.event_name} ${g.description} ${g.image_url}`)
    );

    if (matchedGallery.length > 0) {
      categories.gallery = matchedGallery.slice(0, 8).map(g => ({
        id: g.id,
        title: g.title,
        subtitle: `Gallery Archive · ${g.event_name} (${g.year})`,
        description: g.description,
        url: `/archive.html`,
        downloadUrl: g.image_url,
        type: 'Gallery Photo'
      }));
      totalCount += categories.gallery.length;
    }
  } catch (err) {
    console.error('Error searching gallery:', err);
  }

  // ==========================================
  // 6. LECTURE TIMETABLE
  // ==========================================
  try {
    const timetableSlots = db.prepare(`
      SELECT id, level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue
      FROM timetable
    `).all();

    const matchedTT = timetableSlots.filter(t => 
      matchesQuery(`${t.course_code} ${t.course_title} ${t.venue} ${t.lecturer} ${t.day}`)
    );

    if (matchedTT.length > 0) {
      categories.timetable = matchedTT.slice(0, 8).map(t => ({
        id: t.id,
        title: `${t.course_code}: ${t.course_title} (${t.day})`,
        subtitle: `${t.start_time} - ${t.end_time} · ${t.venue} · ${t.level}L`,
        description: `Lecturer: ${t.lecturer || 'Departmental Staff'} · Venue: ${t.venue}`,
        url: `/timetable.html?level=${t.level}&day=${t.day}`,
        type: 'Lecture Timetable'
      }));
      totalCount += categories.timetable.length;
    }
  } catch (err) {
    console.error('Error searching timetable:', err);
  }

  // ==========================================
  // 7. SIWES INFORMATION & PORTAL
  // ==========================================
  const isSiwesQuery = qClean.includes('siwe') || qClean.includes('itf') || qClean.includes('industr') || qClean.includes('anabike') || qClean.includes('intern');
  if (isSiwesQuery && !categories.siwes) {
    categories.siwes = [
      {
        id: 'siwes-portal-info',
        title: 'SIWES Industrial Training Departmental Hub',
        subtitle: 'Coordinator: Mr. Charles Anabike · Office: Ground floor, New Physical Sciences Building',
        description: 'Complete 300L second-semester industrial attachment portal: logging procedures, technical report guidelines, defense criteria, and downloadable ITF documentation.',
        url: '/siwes.html',
        type: 'SIWES Information'
      }
    ];
    totalCount += 1;
  }

  // ==========================================
  // 8. FINAL YEAR RESEARCH PROJECTS
  // ==========================================
  const isProjectQuery = qClean.includes('proj') || qClean.includes('thes') || qClean.includes('research') || qClean.includes('propos') || qClean.includes('defense');
  if (isProjectQuery && !categories.projects) {
    categories.projects = [
      {
        id: 'project-portal-info',
        title: 'Final Year Research Project Hub & Repository',
        subtitle: '400L Academic Requirement · STA 499 (6 Credit Units)',
        description: 'Approved research topics, methodology formatting in R/Python, thesis compilation templates, and defense schedules.',
        url: '/projects.html',
        type: 'Projects Information'
      }
    ];
    totalCount += 1;
  }

  // ==========================================
  // 9. DEPARTMENTAL NEWS & ANNOUNCEMENTS
  // ==========================================
  try {
    const news = db.prepare(`
      SELECT id, title, slug, summary, content, category, published_at
      FROM news
    `).all();

    const matchedNews = news.filter(n => 
      matchesQuery(`${n.title} ${n.summary} ${n.content} ${n.category}`)
    );

    if (matchedNews.length > 0) {
      categories.news = matchedNews.slice(0, 6).map(n => ({
        id: n.id,
        title: n.title,
        subtitle: `News · ${n.category} (${n.published_at.slice(0, 10)})`,
        description: n.summary,
        url: `/news.html?id=${n.id}`,
        type: 'News'
      }));
      totalCount += categories.news.length;
    }
  } catch (err) {
    console.error('Error searching news:', err);
  }

  // ==========================================
  // 10. EVENTS & WORKSHOPS
  // ==========================================
  try {
    const events = db.prepare(`
      SELECT id, title, event_date, event_time, venue, description, status
      FROM events
    `).all();

    const matchedEvents = events.filter(ev => 
      matchesQuery(`${ev.title} ${ev.description} ${ev.venue}`)
    );

    if (matchedEvents.length > 0) {
      categories.events = matchedEvents.slice(0, 6).map(ev => ({
        id: ev.id,
        title: ev.title,
        subtitle: `Event (${ev.status}) · ${ev.event_date} at ${ev.event_time}`,
        description: `${ev.venue} — ${ev.description.substring(0, 90)}...`,
        url: `/events.html#event-${ev.id}`,
        type: 'Event'
      }));
      totalCount += categories.events.length;
    }
  } catch (err) {
    console.error('Error searching events:', err);
  }

  // ==========================================
  // 11. FAQS & HELPDESK
  // ==========================================
  try {
    const faqs = db.prepare(`
      SELECT id, question, answer, category
      FROM faqs
    `).all();

    const matchedFaqs = faqs.filter(f => 
      matchesQuery(`${f.question} ${f.answer} ${f.category}`)
    );

    if (matchedFaqs.length > 0) {
      categories.faqs = matchedFaqs.slice(0, 6).map(f => ({
        id: f.id,
        title: f.question,
        subtitle: `FAQ · ${f.category}`,
        description: f.answer.length > 140 ? f.answer.substring(0, 140) + '...' : f.answer,
        url: `/contacts.html`,
        type: 'FAQ'
      }));
      totalCount += categories.faqs.length;
    }
  } catch (err) {
    console.error('Error searching faqs:', err);
  }

  // ==========================================
  // 12. CONTACTS & ADMINISTRATION
  // ==========================================
  try {
    const contacts = db.prepare(`
      SELECT id, name, role_or_title, department_or_level, email, phone, office_location
      FROM contacts
    `).all();

    const matchedContacts = contacts.filter(c => 
      matchesQuery(`${c.name} ${c.role_or_title} ${c.department_or_level} ${c.email} ${c.phone} ${c.office_location}`)
    );

    if (matchedContacts.length > 0) {
      categories.contacts = matchedContacts.slice(0, 6).map(c => ({
        id: c.id,
        title: `${c.name} — ${c.role_or_title}`,
        subtitle: `${c.department_or_level} · ${c.phone || c.email}`,
        description: `Office: ${c.office_location || 'Statistics Administrative Office, Ground floor, New Physical Sciences Building'}`,
        url: `/contacts.html`,
        type: 'Contact'
      }));
      totalCount += categories.contacts.length;
    }
  } catch (err) {
    console.error('Error searching contacts:', err);
  }

  res.json({
    query: rawQ,
    total: totalCount,
    categories
  });
});

export default router;
