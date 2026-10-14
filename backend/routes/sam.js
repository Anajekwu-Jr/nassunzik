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
  const tryLite = async () => {
    const res = await ai.models.generateContent({
      ...params,
      model: 'gemini-3.1-flash-lite'
    });
    return res.text;
  };

  const tryFlash = async () => {
    const res = await ai.models.generateContent({
      ...params,
      model: 'gemini-3.8-flash'
    });
    return res.text;
  };

  try {
    // Race flash with a 2000ms timeout for instant user feedback
    const flashPromise = tryFlash();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('FAST_TIMEOUT')), 2000)
    );
    return await Promise.race([flashPromise, timeoutPromise]);
  } catch (err) {
    // If flash timed out or encountered 503/error, instantly reply with high-speed lite model
    try {
      return await tryLite();
    } catch (fallbackErr) {
      console.error('All Gemini model calls failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}

// Build live comprehensive departmental context from SQLite
function getDepartmentalContext(selectedCourseCode = null) {
  try {
    // 1. Courses
    const courses = db.prepare('SELECT id, code, title, level, semester, credit_units, status, description FROM courses ORDER BY level, code').all();
    
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

    // 3. Timetable
    const timetable = db.prepare('SELECT level, day as day_of_week, start_time, end_time, course_code, course_title, venue, lecturer FROM timetable ORDER BY level, day, start_time').all();

    // 4. Staff
    const staff = db.prepare('SELECT name, role, title, email, phone, office, area_of_specialization FROM staff ORDER BY id ASC').all();

    // 5. Executives
    const executives = db.prepare('SELECT name, office, level, phone, email FROM executives ORDER BY id ASC').all();

    // 6. Settings
    const settings = db.prepare('SELECT key, value FROM site_settings').all().reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // 7. SIWES & Projects summary
    const siwes = db.prepare('SELECT title, category, description FROM siwes_resources LIMIT 10').all();
    const projects = db.prepare('SELECT title, category, description FROM project_resources LIMIT 10').all();

    return {
      institution: 'Nnamdi Azikiwe University (UNIZIK), Awka, Anambra State, Nigeria',
      faculty: 'Faculty of Physical Sciences',
      department: 'Department of Statistics',
      association: 'National Association Of Statistics Students (NASS)',
      motto: 'Facts from Figures',
      academicSession: settings.academic_session || '2026/2027',
      currentSemester: settings.current_semester || 'First Semester',
      coursesCount: courses.length,
      courses: courses.map(c => `${c.code} (${c.level}L Sem ${c.semester}): ${c.title} [${c.credit_units}CU, ${c.status || 'Compulsory'}]`),
      availableResources: resources.map(r => `[${r.course_code}] ${r.title} (${r.resource_type})`),
      timetableSummary: timetable.slice(0, 40).map(t => `${t.level}L ${t.day_of_week} ${t.start_time}-${t.end_time}: ${t.course_code} (${t.course_title}) at ${t.venue || 'Lecture Hall'} by ${t.lecturer || 'Department Staff'}`),
      staffList: staff.map(s => `${s.title || ''} ${s.name} - ${s.role || 'Lecturer'} (Spec: ${s.area_of_specialization || 'Statistics'})`),
      executivesList: executives.map(e => `${e.name} - ${e.office} (${e.level}L)`),
      siwesGuidelines: siwes.map(s => s.title),
      projectGuidelines: projects.map(p => p.title),
      gradingSystem: {
        scale: '5.0 CGPA Nigerian University Commission (NUC) & UNIZIK Standard',
        grades: [
          'A: 70 - 100% (5.0 Grade Points)',
          'B: 60 - 69% (4.0 Grade Points)',
          'C: 50 - 59% (3.0 Grade Points)',
          'D: 45 - 49% (2.0 Grade Points)',
          'E: 40 - 44% (1.0 Grade Point)',
          'F: 0 - 39% (0.0 Grade Points)'
        ],
        classes: [
          'First Class Honours: 4.50 - 5.00 CGPA',
          'Second Class Honours (Upper Division): 3.50 - 4.49 CGPA',
          'Second Class Honours (Lower Division): 2.40 - 3.49 CGPA',
          'Third Class Honours: 1.50 - 2.39 CGPA',
          'Pass: 1.00 - 1.49 CGPA'
        ]
      }
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

    // Retrieve live context from database
    const context = getDepartmentalContext(courseCode);

    // Build specific course details if courseCode is provided
    let specificCourseDetails = '';
    if (courseCode) {
      const courseRow = db.prepare('SELECT * FROM courses WHERE code LIKE ? LIMIT 1').get(`%${courseCode.trim()}%`);
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
- Description & Topics: ${courseRow.description || 'Comprehensive university curriculum'}
- Course Outline: ${courseRow.outline || 'Standard NUC & UNIZIK Statistics Outline'}
- Official Portal Materials Available for this course (${courseRes.length} items):
${courseRes.map(r => `  * [${r.resource_type.toUpperCase()}] ${r.title} (Year: ${r.academic_year || 'Latest'})`).join('\n') || '  (Materials available in department archive)'}
- Lecture Schedule:
${courseTimetable.map(t => `  * ${t.day_of_week} from ${t.start_time} to ${t.end_time} at ${t.venue} (${t.lecturer})`).join('\n') || '  (Check general departmental timetable)'}
`;
      }
    }

    const systemInstruction = `
You are "Sam", the official, brilliant, approachable, and encouraging AI Study Companion & Academic Mentor for the National Association Of Statistics Students (NASS), Department of Statistics, Nnamdi Azikiwe University (UNIZIK), Awka, Nigeria.

CORE MISSION & PERSONALITY:
- Name: Sam (Sam AI)
- Identity: NASS UNIZIK Academic AI Study Companion
- Demeanour: Warm, brilliant, articulate, encouraging, culturally attuned to UNIZIK students ("NASSITES", "Great Zikites"), intellectually rigorous, and structured.
- Motto: "Facts from Figures".
- Specializations: Probability theory, mathematical statistics, regression analysis, sampling techniques, experimental design, operational research, time series, biostatistics, demographic analysis, computational statistics (R, Python, SPSS, C++, Excel), UNIZIK departmental handbook, course curriculum, timetable schedules, past exam question breakdown, and CGPA calculation.

YOUR CAPABILITIES & RULES:
1. COURSE DISCUSSIONS & LECTURE NOTES:
   - When a student asks about any course (e.g., STA 111, STA 121, STA 211, STA 214, STA 231, STA 331, STA 411, COS 102, COS 201, MTH 204, PHY 102, etc.), provide deep, pedagogical explanations.
   - Break down complex statistical formulas step-by-step. Use clear mathematical notation ($$...$$ for display math, $$...$$ or readable text for inline math).
   - If asked for exam preparation or past question solutions, provide comprehensive, worked solutions with clear steps: given data, hypothesis/formula, substitution, computation, conclusion/interpretation.
   - Refer to the actual lecture notes, textbooks, and past examination papers available on the NASS UNIZIK portal.

2. DOCUMENT & NOTE ANALYSIS:
   - If the student provides or uploads an external document, image, homework problem, or notes, analyze it meticulously. Break down the contents, solve questions, highlight core definitions, and explain every nuance clearly.

3. STUDY MODES:
   - Study Mode: "${studyMode}"
   * "general": Answer questions about the department, staff, executives, courses, timetable, and campus life.
   * "explain": Teach concepts thoroughly using intuitive analogies, formal definitions, and applied examples.
   * "quiz": Act as an interactive quiz master. Present questions, wait for answers, grade them, and explain.
   * "exam_prep": Focus on past examination questions, frequently asked UNIZIK exam concepts, and high-yield scoring tips.
   * "code_help": Provide clean, annotated statistical code in R, Python, SPSS syntax, or C++.

4. DEPARTMENTAL KNOWLEDGE BASE:
${JSON.stringify(context, null, 2)}
${specificCourseDetails}

5. TONE & FORMATTING:
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

    const aiResponseText = await callGeminiWithFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    res.json({
      success: true,
      reply: aiResponseText,
      courseCode: courseCode || null,
      studyMode: studyMode || 'general',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in /api/sam/chat:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate response from Sam AI'
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
