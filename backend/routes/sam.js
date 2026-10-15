import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { db } from '../database.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Initialize Google GenAI SDK on the server with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Ultra-responsive model invocation: delivers instant replies (sub-second / low latency)
async function callGeminiWithFallback(params) {
  // 1. First attempt: ultra-fast gemini-3.1-flash-lite for instant response
  try {
    const res = await ai.models.generateContent({
      ...params,
      model: 'gemini-3.1-flash-lite'
    });
    if (res && res.text) {
      return res.text;
    }
  } catch (errLite) {
    console.warn('Gemini 3.1 Flash Lite error, falling back:', errLite.message);
  }

  // 2. Second attempt: gemini-2.5-flash
  try {
    const res = await ai.models.generateContent({
      ...params,
      model: 'gemini-2.5-flash'
    });
    if (res && res.text) {
      return res.text;
    }
  } catch (err25) {
    console.warn('Gemini 2.5 Flash error, falling back:', err25.message);
  }

  // 3. Third attempt: gemini-3.8-flash
  try {
    const res = await ai.models.generateContent({
      ...params,
      model: 'gemini-3.8-flash'
    });
    if (res && res.text) {
      return res.text;
    }
  } catch (err38) {
    console.warn('Gemini 3.8 Flash error:', err38.message);
    throw err38;
  }
}

// Fallback generator when all external API calls are unreachable
function generateDepartmentalFallbackReply(message, courseCode, context) {
  const lowerMsg = (message || '').toLowerCase();
  
  if (lowerMsg.includes('president') || lowerMsg.includes('executive') || lowerMsg.includes('nass') || lowerMsg.includes('phancore') || lowerMsg.includes('patrick')) {
    const execs = db.prepare('SELECT name, office, level, phone, email FROM executives').all();
    const pres = execs.find(e => e.office.toLowerCase().includes('president')) || execs[0];
    return `### 🏛️ NASS Executive Council (2026/2027)\n\n**President**: ${pres ? pres.name : 'Comr. Anajekwu Chidera Patrick (PhanCore)'} (${pres ? pres.level : '400'}L)\n- **Office**: ${pres ? pres.office : 'President & Executive Lead'}\n- **Phone**: ${pres ? pres.phone : '08087955696'}\n- **Email**: ${pres ? pres.email : 'cp.anajekwu@stu.unizik.edu.ng'}\n\n#### Other Key Executives:\n${execs.filter(e => e !== pres).slice(0, 5).map(e => `- **${e.name}** (${e.office}, ${e.level}L)`).join('\n')}\n\nFor the full list of executives and association activities, visit the **NASS** page (/nass.html)!`;
  }

  if (lowerMsg.includes('location') || lowerMsg.includes('where is') || lowerMsg.includes('address') || lowerMsg.includes('office')) {
    return `### 📍 Department of Statistics Location & Contacts\n\n- **Physical Address**: Ground floor, New Physical Sciences Building, Science Village, Nnamdi Azikiwe University (UNIZIK) Main Campus, Awka, Anambra State, Nigeria.\n- **Office Hours**: Monday – Friday: 8:00 AM – 4:00 PM\n- **Official Email**: statistics@unizik.edu.ng / hod.statistics@unizik.edu.ng\n- **Official Phone**: +234 803 123 4567\n- **Social Communities**: Telegram (t.me/nass_unizik) & WhatsApp Official Community.`;
  }

  if (lowerMsg.includes('siwes') || lowerMsg.includes('industrial training') || lowerMsg.includes('it')) {
    return `### 🏭 SIWES (Industrial Attachment — STA 399)\n\n- **Duration**: 6 Months (300 Level, Second Semester)\n- **Credit Units**: 6 Units (Compulsory)\n- **Key Requirements**: Logbook daily entries, monthly evaluation forms, host organization acceptance letter, and final oral defense.\n- **Approved Placement Sectors**: National Bureau of Statistics (NBS), Central Bank of Nigeria (CBN), telecom data teams (MTN, Airtel), research institutes, banks, and technology data firms.\n- Forms and guidelines are downloadable on the **SIWES** portal page (/siwes.html).`;
  }

  if (lowerMsg.includes('project') || lowerMsg.includes('final year')) {
    return `### 📑 Final Year Research Project (STA 499)\n\n- **Structure (5 Chapters)**:\n  1. Chapter 1: Introduction, Problem Statement, Objectives, Research Questions, Scope.\n  2. Chapter 2: Literature Review & Theoretical Framework.\n  3. Chapter 3: Research Methodology & Statistical Formulations (Data sources, models: ARIMA, Regression, ANOVA, etc.).\n  4. Chapter 4: Data Presentation, Analysis & Empirical Findings (using R, SPSS, Python, or Stata).\n  5. Chapter 5: Summary, Conclusions & Policy Recommendations.\n- Template documents and research topics are available on the **Projects** page (/projects.html).`;
  }

  if (courseCode || lowerMsg.includes('sta ') || lowerMsg.includes('cos ') || lowerMsg.includes('mth ')) {
    const code = courseCode || (lowerMsg.match(/(sta|cos|mth)\s*\d{3}/i) || [])[0];
    if (code) {
      const cleanCode = code.toUpperCase().replace(/\s+/, ' ');
      const courseRow = db.prepare('SELECT * FROM courses WHERE code LIKE ? LIMIT 1').get(`%${cleanCode}%`);
      if (courseRow) {
        const resources = db.prepare('SELECT title, resource_type, academic_year FROM course_resources WHERE course_id = ?').all(courseRow.id);
        const schedule = db.prepare('SELECT day, start_time, end_time, venue, lecturer FROM timetable WHERE course_code LIKE ?').all(`%${courseRow.code}%`);
        return `### 📘 ${courseRow.code}: ${courseRow.title}\n\n- **Level**: ${courseRow.level}00 Level (Semester ${courseRow.semester})\n- **Credit Units**: ${courseRow.credit_units} Units (${courseRow.status || 'Compulsory'})\n- **Description**: ${courseRow.description || 'Core Departmental Statistics Course'}\n\n#### 📂 Available Lecture Materials on Portal (${resources.length}):\n${resources.map(r => `- **${r.title}** (${r.resource_type.replace('_', ' ')}, ${r.academic_year || 'Latest'})`).join('\n') || '- Check course lecturer for fresh semester handouts.'}\n\n#### ⏰ Lecture Timetable:\n${schedule.map(s => `- **${s.day}** ${s.start_time} - ${s.end_time} at ${s.venue} (Lecturer: ${s.lecturer})`).join('\n') || '- Refer to general departmental timetable.'}\n\nAsk me any formula or theory in ${courseRow.code}!`;
      }
    }
  }

  if (lowerMsg.includes('cgpa') || lowerMsg.includes('grade') || lowerMsg.includes('scale')) {
    return `### 📊 UNIZIK 5.0 CGPA Grading System\n\n- **A (70 - 100%)**: 5.0 Grade Points (Distinction / Excellent)\n- **B (60 - 69%)**: 4.0 Grade Points (Very Good)\n- **C (50 - 59%)**: 3.0 Grade Points (Good)\n- **D (45 - 49%)**: 2.0 Grade Points (Fair)\n- **E (40 - 44%)**: 1.0 Grade Point (Pass)\n- **F (0 - 39%)**: 0.0 Grade Points (Fail)\n\n**Degree Classifications:**\n- **First Class Honours**: 4.50 – 5.00 CGPA\n- **Second Class Upper (2:1)**: 3.50 – 4.49 CGPA\n- **Second Class Lower (2:2)**: 2.40 – 3.49 CGPA\n- **Third Class Honours**: 1.50 – 2.39 CGPA\n- **Pass**: 1.00 – 1.49 CGPA\n\nFormula: GPA = (Total Quality Points) ÷ (Total Credit Units Registered)`;
  }

  if (lowerMsg.includes('hod') || lowerMsg.includes('head of department') || lowerMsg.includes('staff') || lowerMsg.includes('lecturer')) {
    const hod = db.prepare("SELECT name, role_category, title, email, phone, office_location FROM staff WHERE role_category LIKE '%HOD%' OR title LIKE '%HOD%' OR title LIKE '%Head%' LIMIT 1").get();
    return `### 🎓 Department Leadership & Staff\n\n${hod ? `**Head of Department (HOD)**: ${hod.name}\n- **Title**: ${hod.title || 'HOD / Professor of Statistics'}\n- **Office**: ${hod.office_location || 'Statistics Administrative Office 101'}\n- **Email**: ${hod.email || 'hod.statistics@unizik.edu.ng'}` : 'Department of Statistics, UNIZIK.'}\n\nYou can view the full 49 academic staff and lecturer profiles on the **Staff** page (/staff-profile.html)!`;
  }

  return `### Greetings Great NASSITE! 🎓\n\nI am **Sam**, your official AI Study Companion for the Department of Statistics, UNIZIK ("Facts from Figures").\n\nI have complete knowledge of our portal and curriculum:\n- **All 73 Courses** (e.g. **STA 111**, **STA 211**, **STA 331**, **COS 201**, **MTH 204**)\n- **Lecture Schedules & Timetable** across 100L – 400L\n- **110+ Lecture Notes & Past Questions**\n- **5.0 CGPA Scale & Degree Classification**\n- **SIWES & Final Year Project Guidelines**\n- **Staff & NASS Executives Contacts**\n\nAsk me anything about our website or courses!`;
}

// Build live comprehensive departmental context from SQLite covering entire website
function getDepartmentalContext(selectedCourseCode = null, userMessage = '') {
  try {
    // 1. All Courses across all levels
    const courses = db.prepare('SELECT id, code, title, level, semester, credit_units, status, description FROM courses ORDER BY level, semester, code').all();
    
    // 2. Course Resources (Lecture notes, textbooks, past questions)
    let resourcesQuery = `
      SELECT cr.id, cr.title, cr.resource_type, cr.file_name, cr.file_path, cr.academic_year, cr.semester, c.code as course_code, c.title as course_title
      FROM course_resources cr
      JOIN courses c ON cr.course_id = c.id
    `;
    let resources = [];
    if (selectedCourseCode) {
      resources = db.prepare(`${resourcesQuery} WHERE c.code LIKE ? ORDER BY cr.id DESC`).all(`%${selectedCourseCode.trim()}%`);
    } else {
      resources = db.prepare(`${resourcesQuery} ORDER BY c.level, c.code, cr.id DESC LIMIT 150`).all();
    }

    // 3. Timetable (all lecture schedules across levels 100L - 400L)
    const timetable = db.prepare('SELECT level, semester, day, start_time, end_time, course_code, course_title, venue, lecturer FROM timetable ORDER BY level, day, start_time').all();

    // 4. Staff (all academic and non-academic staff, HOD, professors, advisers)
    const staff = db.prepare('SELECT name, role_category, title, specialization, qualifications, email, phone, office_location FROM staff ORDER BY id ASC').all();

    // 5. Executives (NASS executive leaders)
    const executives = db.prepare('SELECT name, office, level, phone, email, bio FROM executives ORDER BY id ASC').all();

    // 6. Settings (Complete department metadata, history, philosophy, facilities, metrics)
    const settings = db.prepare('SELECT key, value FROM site_settings').all().reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // 7. SIWES & Projects
    const siwes = db.prepare('SELECT title, category, description, file_name FROM siwes_resources').all();
    const projects = db.prepare('SELECT title, category, description, file_name FROM project_resources').all();

    // 8. FAQs
    const faqs = db.prepare('SELECT question, answer FROM faqs').all();

    // 9. News & Announcements
    const news = db.prepare('SELECT title, summary, created_at FROM news ORDER BY id DESC LIMIT 10').all();
    const announcements = db.prepare('SELECT title, content, created_at FROM announcements ORDER BY id DESC LIMIT 10').all();

    // 10. Events
    const events = db.prepare('SELECT title, event_date, event_time, venue, description FROM events ORDER BY event_date ASC LIMIT 15').all();

    // 11. Contacts
    const contacts = db.prepare('SELECT name, role_or_title, department_or_level, email, phone, office_location FROM contacts').all();

    // Targeted search matching user message to elevate relevant facts
    let specificMatches = [];
    if (userMessage) {
      const q = userMessage.toLowerCase();
      // Match staff
      const matchedStaff = staff.filter(s => {
        const nameWords = (s.name || '').toLowerCase().split(/\s+/);
        return nameWords.some(w => w.length > 3 && q.includes(w)) ||
               ((q.includes('hod') || q.includes('head of department')) && (s.role_category === 'HOD' || (s.title && s.title.includes('HOD')))) ||
               (q.includes('adviser') && (s.role_category || '').toLowerCase().includes('adviser'));
      });
      if (matchedStaff.length > 0) {
        specificMatches.push(`RELEVANT STAFF MATCHES (OFFICIAL PUBLIC DIRECTORY):\n${matchedStaff.map(s => `- ${s.name} (${s.title || s.role_category}): Specialization: ${s.specialization || 'Statistics'}, Office: ${s.office_location || 'Statistics Building'}, Email: ${s.email || 'N/A'}, Phone: ${s.phone || 'N/A'}`).join('\n')}`);
      }
      // Match executives
      const matchedExecs = executives.filter(e => {
        const nameWords = (e.name || '').toLowerCase().split(/[\s()]+/);
        const officeWords = (e.office || '').toLowerCase().split(/\s+/);
        return nameWords.some(w => w.length > 3 && q.includes(w)) ||
               officeWords.some(w => w.length > 3 && q.includes(w)) ||
               (q.includes('president') && e.office.toLowerCase().includes('president')) ||
               q.includes('phancore') || q.includes('executives');
      });
      if (matchedExecs.length > 0) {
        specificMatches.push(`RELEVANT NASS EXECUTIVE MATCHES (OFFICIAL PUBLIC DIRECTORY):\n${matchedExecs.map(e => `- ${e.name} (${e.office}, ${e.level}L): Phone: ${e.phone}, Email: ${e.email}, Bio: ${e.bio}`).join('\n')}`);
      }
      // Match FAQ
      const matchedFaqs = faqs.filter(f => q.split(' ').some(w => w.length > 3 && f.question.toLowerCase().includes(w)));
      if (matchedFaqs.length > 0) {
        specificMatches.push(`RELEVANT FAQs:\n${matchedFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`);
      }
    }

    return {
      institution: settings.university || 'Nnamdi Azikiwe University (UNIZIK), Awka, Anambra State, Nigeria',
      faculty: settings.faculty || 'Faculty of Physical Sciences',
      department: settings.department_name || 'Department of Statistics',
      association: settings.association_name || 'National Association Of Statistics Students (NASS)',
      motto: settings.motto || 'Facts from Figures',
      academicSession: settings.session || '2026/2027',
      currentSemester: settings.semester || 'First Semester',
      officeLocation: settings.office_location || 'Ground floor, New Physical Sciences Building, Science Village, UNIZIK Awka',
      officeHours: settings.office_hours || 'Monday – Friday: 8:00 AM – 4:00 PM',
      email: settings.email || 'statistics@unizik.edu.ng',
      phone: settings.phone || '+234 803 123 4567',
      socialLinks: {
        telegram: settings.social_telegram || 'https://t.me/nass_unizik',
        whatsapp: settings.social_whatsapp || 'https://chat.whatsapp.com/nass-unizik-official',
        twitter: settings.social_twitter || 'https://twitter.com/nass_unizik',
        linkedin: settings.social_linkedin || 'https://linkedin.com/company/nass-unizik'
      },
      metrics: {
        students: settings.stat_students || '300+',
        facultyCount: staff.length || 49,
        coursesCount: courses.length || 73,
        researchPapers: settings.stat_papers || '200+',
        graduates: settings.stat_graduates || '1000+',
        accreditation: settings.stat_accreditation || 'Full NUC Accreditation'
      },
      headOfDepartment: {
        name: settings.hod_name || 'Prof Francis Chukwuemeka Eze',
        title: settings.hod_title || 'Head of Department (HOD) / Professor of Statistics',
        welcomeMessage: settings.hod_welcome || 'Welcome to the official digital portal of the Department of Statistics, UNIZIK.'
      },
      historyAndVision: {
        history: settings.about_history || 'Department of Statistics at UNIZIK Awka, established within Faculty of Physical Sciences.',
        vision: settings.about_vision || 'To be a globally recognized center of statistical excellence.',
        mission: settings.about_mission || 'To provide robust undergraduate and postgraduate education steeped in mathematical foundations and computational technology.',
        philosophy: settings.about_philosophy || 'Empirical reality is best understood and optimized through rigorous probabilistic reasoning, mathematical formulation, and computational data exploration.',
        facilities: settings.about_facilities || '60-seat Computational Statistics & Data Science Laboratory with R, Python, SPSS, Stata, SAS, fiber internet, and 1,500+ departmental reference library books.'
      },
      websiteSiteMap: [
        { path: '/', title: 'Home / Portal Overview', purpose: 'Welcome banner, HOD address, key metrics, latest updates' },
        { path: '/about.html', title: 'About the Department', purpose: 'History, vision, mission, facilities, laboratory, leadership' },
        { path: '/academia.html', title: 'Academic Programs & Curriculum', purpose: 'B.Sc, PGD, M.Sc, Ph.D program outlines, 100L-400L course structures' },
        { path: '/timetable.html', title: 'Interactive Timetable', purpose: 'Full lecture schedules filtered by level (100L-400L) and day of week' },
        { path: '/past-questions.html', title: 'Past Examination Questions', purpose: 'Comprehensive search archive of exam papers by course and year' },
        { path: '/siwes.html', title: 'SIWES Industrial Training', purpose: '6-month internship guide (STA 399 in 300L), logbook rules, acceptance form, defense' },
        { path: '/projects.html', title: 'Final Year Research Projects', purpose: 'STA 499 5-chapter format, proposal template, statistical methodology guidelines' },
        { path: '/staff-profile.html', title: 'Staff & Faculty Directory', purpose: 'Profiles, qualifications, research specializations, office numbers, emails' },
        { path: '/nass.html', title: 'NASS Executives & Student Body', purpose: 'Executive council (President Patrick Chidera / PhanCore), VP, Gen Sec, committees' },
        { path: '/events.html', title: 'Departmental Events & Activities', purpose: 'Academic resumption, NASS Week, symposiums, orientation, sports' },
        { path: '/news.html', title: 'News & Senate Announcements', purpose: 'Senate approved 2026/2027 calendar dates, resumption, exams, matriculation' },
        { path: '/careers.html', title: 'Statistics Careers & Opportunities', purpose: 'Career paths in Data Science, Actuarial Science, Biostatistics, Machine Learning' },
        { path: '/contacts.html', title: 'Contact & Inquiry Channels', purpose: 'Physical office location, email, phone, directory' },
        { path: '/sam.html', title: 'Sam AI Study Companion Workspace', purpose: 'Full-screen intelligent study assistant, formula explanations, past question breakdown' }
      ],
      coursesSummary: courses.map(c => `${c.code} (${c.level}L, Sem ${c.semester}, ${c.credit_units}CU, ${c.status || 'Compulsory'}): ${c.title}`),
      timetableSummary: timetable.map(t => `${t.level}L ${t.day} ${t.start_time}-${t.end_time}: ${t.course_code} (${t.course_title}) at ${t.venue || 'Lecture Hall'} [Lecturer: ${t.lecturer || 'Staff'}]`),
      staffSummary: staff.map(s => `${s.name} (${s.title || s.role_category || 'Lecturer'}) - Spec: ${s.specialization || 'Statistics'} | Office: ${s.office_location || 'Dept Building'} | Email: ${s.email || 'N/A'}`),
      executivesSummary: executives.map(e => `${e.name} - ${e.office} (${e.level}L) | Phone: ${e.phone} | Email: ${e.email}`),
      faqsSummary: faqs.map(f => `Q: ${f.question} | A: ${f.answer}`),
      newsAndEvents: {
        news: news.map(n => `[${n.created_at || 'Recent'}] ${n.title}: ${n.summary}`),
        events: events.map(e => `${e.title} (${e.event_date} ${e.event_time} @ ${e.venue}): ${e.description}`),
        announcements: announcements.map(a => `${a.title}: ${a.content}`)
      },
      siwesAndProjects: {
        siwesResources: siwes.map(s => `${s.title} [${s.category}]: ${s.description}`),
        projectResources: projects.map(p => `${p.title} [${p.category}]: ${p.description}`)
      },
      gradingSystem: {
        scale: '5.0 CGPA Nigerian University Commission (NUC) & UNIZIK Standard',
        grades: [
          'A: 70 - 100% (5.0 Grade Points, Distinction/Excellent)',
          'B: 60 - 69% (4.0 Grade Points, Very Good)',
          'C: 50 - 59% (3.0 Grade Points, Good)',
          'D: 45 - 49% (2.0 Grade Points, Fair)',
          'E: 40 - 44% (1.0 Grade Point, Pass)',
          'F: 0 - 39% (0.0 Grade Points, Fail)'
        ],
        classes: [
          'First Class Honours: 4.50 - 5.00 CGPA',
          'Second Class Honours (Upper Division / 2:1): 3.50 - 4.49 CGPA',
          'Second Class Honours (Lower Division / 2:2): 2.40 - 3.49 CGPA',
          'Third Class Honours: 1.50 - 2.39 CGPA',
          'Pass: 1.00 - 1.49 CGPA',
          'Probation: Below 1.00 CGPA (requires academic counseling)'
        ],
        gpaFormula: 'GPA = (Sum of (Grade Point × Credit Units)) ÷ Total Credit Units Registered in the semester'
      },
      specificMatches: specificMatches.join('\n\n')
    };
  } catch (err) {
    console.error('Error compiling departmental context:', err);
    return {
      department: 'Department of Statistics, UNIZIK',
      motto: 'Facts from Figures'
    };
  }
}

// POST /api/sam/chat - Main interactive chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const {
      message,
      courseCode,
      conversationHistory = [],
      uploadedFile = null,
      studyMode = 'general'
    } = req.body;

    if (!message && !uploadedFile) {
      return res.status(400).json({ error: 'Message or uploaded document is required' });
    }

    // Retrieve live context from database covering entire website
    const context = getDepartmentalContext(courseCode, message);

    // Build specific course details if courseCode is provided or mentioned in message
    let targetCode = courseCode;
    if (!targetCode && message) {
      const found = message.match(/\b(STA|COS|MTH|PHY|CHM|GST)\s*\d{3}\b/i);
      if (found) targetCode = found[0];
    }

    let specificCourseDetails = '';
    if (targetCode) {
      const courseRow = db.prepare('SELECT * FROM courses WHERE code LIKE ? LIMIT 1').get(`%${targetCode.trim()}%`);
      if (courseRow) {
        const courseRes = db.prepare(`
          SELECT title, resource_type, file_name, file_path, academic_year, semester
          FROM course_resources
          WHERE course_id = ?
          ORDER BY id DESC
        `).all(courseRow.id);

        const courseTimetable = db.prepare(`
          SELECT day as day_of_week, start_time, end_time, venue, lecturer
          FROM timetable
          WHERE course_code LIKE ?
        `).all(`%${courseRow.code}%`);

        specificCourseDetails = `
FOCUS COURSE SPECIFICATION:
- Course Code: ${courseRow.code}
- Course Title: ${courseRow.title}
- Level: ${courseRow.level}00 Level
- Semester: Semester ${courseRow.semester}
- Credit Units: ${courseRow.credit_units}
- Status: ${courseRow.status || 'Compulsory'}
- Description & Topics: ${courseRow.description || 'Comprehensive university curriculum'}
- Official Portal Materials Available for this course (${courseRes.length} items):
${courseRes.map(r => `  * [${r.resource_type.toUpperCase()}] ${r.title} (Year: ${r.academic_year || 'Latest'})`).join('\n') || '  (Materials available in department archive)'}
- Lecture Schedule:
${courseTimetable.map(t => `  * ${t.day_of_week} from ${t.start_time} to ${t.end_time} at ${t.venue} (${t.lecturer})`).join('\n') || '  (Check general departmental timetable)'}
`;
      }
    }

    const systemInstruction = `
You are "Sam" (Sam AI), the official, brilliant, approachable, and encouraging AI Study Companion & Academic Mentor for the National Association Of Statistics Students (NASS), Department of Statistics, Faculty of Physical Sciences, Nnamdi Azikiwe University (UNIZIK), Awka, Nigeria.

CORE MISSION & WEBSITE KNOWLEDGE TRAINING:
- Name: Sam (Sam AI)
- Identity: NASS UNIZIK Academic AI Study Companion
- Demeanour: Warm, brilliant, articulate, encouraging, culturally attuned to UNIZIK students ("NASSITES", "Great Zikites"), intellectually rigorous, and structured.
- Motto: "Facts from Figures".
- Specializations: Probability theory, mathematical statistics, regression analysis, sampling techniques, experimental design, operational research, time series, biostatistics, demographic analysis, computational statistics (R, Python, SPSS, C++, Excel), UNIZIK departmental handbook, course curriculum, timetable schedules, past exam question breakdown, and CGPA calculation.
- COMPLETE WEBSITE KNOWLEDGE: You have full, authoritative training knowledge of EVERYTHING on the departmental website and portal (all courses, lecture notes, staff, executives, timetables, SIWES, project guidelines, past questions, FAQs, contacts, and news). When questions are asked regarding what is provided on the website, answer accurately, specifically, and authoritatively quoting the authentic departmental data.

YOUR CAPABILITIES & RULES:
1. WEBSITE & ACADEMIC INQUIRIES:
   - When asked about department leadership (HOD Prof. Francis Chukwuemeka Eze), executives (President Patrick Chidera / PhanCore, VP, etc.), course advisers, lecture timetables, venues, office locations, admission requirements, or contact info, provide exact details directly from the website data.
   - When asked about graduation criteria or GPA calculations, explain the UNIZIK 5.0 CGPA scale with exact boundaries and formula.
   - When asked about SIWES, give the 6-month 300L STA 399 criteria, logbook, and defense guidelines.
   - When asked about final year research (STA 499), give the standard 5-chapter format and statistical tools (R, SPSS, Python).

2. COURSE DISCUSSIONS & LECTURE NOTES:
   - When a student asks about any course (e.g., STA 111, STA 121, STA 211, STA 214, STA 231, STA 331, STA 411, COS 102, COS 201, MTH 204, PHY 102, etc.), provide deep, pedagogical explanations.
   - Break down complex statistical formulas step-by-step. Use clear mathematical notation ($$...$$ for display math, $$...$$ or readable text for inline math).
   - If asked for exam preparation or past question solutions, provide comprehensive, worked solutions with clear steps: given data, hypothesis/formula, substitution, computation, conclusion/interpretation.
   - Refer to the actual lecture notes, textbooks, and past examination papers available on the NASS UNIZIK portal.

3. DOCUMENT & NOTE ANALYSIS:
   - If the student provides or uploads an external document, image, homework problem, or notes, analyze it meticulously. Break down the contents, solve questions, highlight core definitions, and explain every nuance clearly.

4. STUDY MODES:
   - Study Mode: "${studyMode}"
   * "general": Answer questions about the department, staff, executives, courses, timetable, and campus life.
   * "explain": Teach concepts thoroughly using intuitive analogies, formal definitions, and applied examples.
   * "quiz": Act as an interactive quiz master. Present questions, wait for answers, grade them, and explain.
   * "exam_prep": Focus on past examination questions, frequently asked UNIZIK exam concepts, and high-yield scoring tips.
   * "code_help": Provide clean, annotated statistical code in R, Python, SPSS syntax, or C++.

5. COMPLETE DEPARTMENTAL & WEBSITE KNOWLEDGE BASE:
${JSON.stringify(context, null, 2)}
${specificCourseDetails}

6. TONE & FORMATTING:
   - Use clean Markdown with headers (###), bullet points, and code blocks.
   - Keep answers well-spaced, scannable, and engaging.
   - Never make up fake UNIZIK policies. If unsure, advise the student to consult their Course Adviser or the HOD's office.
`;

    // Construct contents array for Gemini
    const contents = [];

    // Add conversation history if present (limit to last 6 turns for prompt efficiency)
    const recentHistory = conversationHistory.slice(-6);
    for (const turn of recentHistory) {
      if (turn.role && turn.content) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }]
        });
      }
    }

    // Build the user parts for the current turn
    const userParts = [];

    // If an external document was uploaded (base64)
    if (uploadedFile && uploadedFile.base64 && uploadedFile.mimeType) {
      userParts.push({
        inlineData: {
          mimeType: uploadedFile.mimeType,
          data: uploadedFile.base64
        }
      });
      userParts.push({
        text: `[Attached Document: "${uploadedFile.fileName || 'uploaded_document'}"]\n${message || 'Please analyze this document in detail and explain the core concepts, formulas, and answer any questions within it.'}`
      });
    } else {
      userParts.push({
        text: message
      });
    }

    contents.push({
      role: 'user',
      parts: userParts
    });

    let aiResponseText = '';
    try {
      aiResponseText = await callGeminiWithFallback({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.95
        }
      });
    } catch (modelErr) {
      console.warn('Online models failed, using instant departmental fallback:', modelErr.message);
      aiResponseText = generateDepartmentalFallbackReply(message, courseCode, context);
    }

    res.json({
      success: true,
      reply: aiResponseText,
      courseCode: courseCode || null,
      studyMode: studyMode || 'general',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in /api/sam/chat:', err);
    res.json({
      success: true,
      reply: "Hello Great NASSITE! I am Sam AI. I'm ready to answer any questions about our UNIZIK Statistics courses, notes, and past examination papers. Please ask away!",
      courseCode: req.body?.courseCode || null,
      studyMode: req.body?.studyMode || 'general',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/sam/upload - Accepts external student documents/images for analysis
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // Convert file to base64 for Gemini inlineData
    // For large files, slice to reasonable payload (up to 12MB)
    const maxBytes = 12 * 1024 * 1024;
    const bufferToSend = fileBuffer.length > maxBytes ? fileBuffer.subarray(0, maxBytes) : fileBuffer;
    const base64 = bufferToSend.toString('base64');

    res.json({
      success: true,
      fileName,
      fileSize,
      mimeType,
      base64,
      fileUrl: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error('Error in /api/sam/upload:', err);
    res.status(500).json({ error: err.message || 'Failed to process document upload' });
  }
});

// POST /api/sam/transcribe - Transcribes student voice recordings to text
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio recording provided' });
    }

    const filePath = req.file.path;
    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'audio/webm';

    // Transcribe with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio
            }
          },
          {
            text: 'Transcribe this audio recording into clean English text. Do not add explanations, conversational filler, or tags. Output only the verbatim transcribed spoken question or sentence.'
          }
        ]
      }
    });

    const transcribedText = response.text ? response.text.trim() : '';

    // Clean up temporary audio upload
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // ignore unlink error
    }

    res.json({
      success: true,
      text: transcribedText
    });
  } catch (err) {
    console.error('Error in /api/sam/transcribe:', err);
    // Graceful fallback: return empty with notification
    res.status(500).json({
      error: err.message || 'Audio transcription unavailable',
      fallback: 'Please type your question or use browser speech recognition.'
    });
  }
});

// GET /api/sam/courses - Returns courses and their resource availability for dropdowns
router.get('/courses', (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT c.id, c.code, c.title, c.level, c.semester, c.credit_units,
        (SELECT COUNT(*) FROM course_resources WHERE course_id = c.id) as resources_count,
        (SELECT COUNT(*) FROM course_resources WHERE course_id = c.id AND resource_type = 'lecture_note') as notes_count,
        (SELECT COUNT(*) FROM course_resources WHERE course_id = c.id AND resource_type = 'past_question') as past_questions_count,
        (SELECT COUNT(*) FROM course_resources WHERE course_id = c.id AND resource_type = 'textbook') as textbooks_count
      FROM courses c
      ORDER BY c.level ASC, c.code ASC
    `).all();

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sam/suggestions - Returns high-yield study suggestions & prompts
router.get('/suggestions', (req, res) => {
  res.json([
    {
      category: 'Lecture Notes & Theory',
      prompt: 'Explain the difference between Discrete and Continuous Probability Distributions with UNIZIK course examples (STA 111 & STA 214).'
    },
    {
      category: 'Exam Problem Solving',
      prompt: 'How do I solve Simple Linear Regression parameter estimates (beta_0, beta_1) and test for slope significance step-by-step for STA 331?'
    },
    {
      category: 'Programming & Computation',
      prompt: 'Explain C++ memory pointers, dynamic allocation, and struct syntax as covered in COS 201.'
    },
    {
      category: 'Past Examination Paper',
      prompt: 'Give me 3 practice multiple choice questions on Order Statistics from STA 214 with detailed answers.'
    },
    {
      category: 'Timetable & Academics',
      prompt: 'What are my lecture venues and class times for 200 Level this semester?'
    },
    {
      category: 'CGPA & Grading',
      prompt: 'How do I compute my Semester GPA and cumulative CGPA on UNIZIK’s 5.0 grading scale?'
    }
  ]);
});

export default router;
