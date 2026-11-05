import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  buildKnowledgeBase,
  findRelevantChunks,
  getKnowledgeBaseStatus
} from '../sam_ai_knowledge.js';

const router = express.Router();

const SYSTEM_INSTRUCTION = `You are Sam AI, the friendly study companion for statistics students at the NASS portal. You know the statistics department and its courses well, and you help students study, understand their courses, and find their way around department life.

Your knowledge comes from the NASS website and the course materials provided to you. Treat it as what you simply know. Never mention sources, file names, documents or where an answer came from.

What you help with:
- All statistics courses: what they cover, course codes, lecture notes, past questions, and step-by-step explanations.
- Department information: executives, staff, lecturers, events and student activities.

How you talk:
- Warm, upbeat and encouraging, like a helpful senior student. Use simple English.
- Keep answers short and engaging. Offer a quick follow-up like "Want me to walk you through a past question on this?"
- Stay on statistics and department matters. If someone asks about something unrelated, politely steer them back.

Honesty:
- Never invent names, titles, contacts, dates or course details. If you don't have the information, say so in a friendly way and suggest they check with the department or an executive.`;

const GREETING = "Hey! I'm Sam AI, your statistics companion. Ask me about your courses, past questions, or anything about the department. What are we studying today?";

// Lazy-initialized GoogleGenAI client
let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

function synthesizeGroundedResponse(userQuery, relevantChunks) {
  const qLower = userQuery.toLowerCase().trim();

  // 1. Polite greetings handling
  if (/^(hi|hello|hey|good\s*(?:morning|afternoon|evening)|yo|greetings|howdy|what'?s\s*up|how\s*are\s*you)\b/i.test(qLower) && qLower.length < 35) {
    return GREETING;
  }

  // 2. Who are you / Identity
  if (/who\s+are\s+you|what\s+is\s+your\s+name|tell\s+me\s+about\s+yourself|what\s+do\s+you\s+do/i.test(qLower)) {
    return "Hey! I'm Sam AI, the friendly study companion for statistics students at the NASS portal. I know our statistics department and courses well, and I'm here to help you study, understand your courses, and find your way around department life. Ask me about course codes, past questions, timetables, or executives. What are we studying today?";
  }

  // 3. Statistical Concept Explanations (Short, clear, step-by-step like a senior student)
  if (/\b(?:mean|average)\b/i.test(qLower) && !qLower.includes('level')) {
    return "Hey! In statistics, the mean (arithmetic average) is the sum of all observations divided by the total number of observations. For sample data: x̄ = (∑x) / n. For grouped frequency data: x̄ = (∑fx) / (∑f). Want me to walk you through a past question on calculating the mean and standard deviation?";
  }
  if (/\b(?:standard\s+deviation|variance)\b/i.test(qLower)) {
    return "Hey! Variance measures the average squared dispersion from the mean, and Standard Deviation (s) is the square root of variance: s = √[∑(x - x̄)² / (n - 1)]. It tells you how spread out values are in the original data units. Want me to walk you through a past question on this?";
  }
  if (/\b(?:regression|linear\s+regression)\b/i.test(qLower)) {
    return "Hey! Simple linear regression models the relationship between an independent variable X and a dependent variable Y using the line equation: Y = β₀ + β₁X + ε. The slope β₁ = Cov(X,Y) / Var(X). Want me to walk you through a past question on fitting regression lines and finding least squares estimators?";
  }
  if (/\b(?:probability|bayes)\b/i.test(qLower) && !qLower.includes('level')) {
    return "Hey! Probability measures the likelihood of an event occurring, bounded between 0 and 1. Key principles include the Addition Rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B), and Conditional Probability: P(A|B) = P(A ∩ B) / P(B). Want me to walk you through a past question on probability laws?";
  }
  if (/\b(?:hypothesis|null\s+hypothesis|p-value|type\s+i\s+error|type\s+ii\s+error)\b/i.test(qLower)) {
    return "Hey! In hypothesis testing, we set the Null Hypothesis (H₀: status quo) against the Alternative Hypothesis (H₁). Type I error (α) is rejecting H₀ when it is actually true, while Type II error (β) is failing to reject H₀ when it is false. Want me to walk you through a past question on Z-tests and t-tests?";
  }

  // 4. Grounded Chunks from Knowledge Base
  if (Array.isArray(relevantChunks) && relevantChunks.length > 0) {
    const top = relevantChunks[0];
    const text = top.text || '';

    if (top.category === 'course_level_summary' || qLower.includes('level') || qLower.includes('courses')) {
      return `Hey! Here is the breakdown for the statistics curriculum:\n\n${text}\n\nWant me to walk you through a past question on any of these?`;
    }

    if (top.category === 'executive' || qLower.includes('exco') || qLower.includes('president') || qLower.includes('executive')) {
      return `Hey! Here is the executive information from the department:\n\n${text}\n\nWant me to help you find contact info for any other executive or adviser?`;
    }

    if (top.category === 'staff' || qLower.includes('hod') || qLower.includes('lecturer') || qLower.includes('adviser')) {
      return `Hey! Here are the staff details for the Department of Statistics:\n\n${text}\n\nFeel free to ask if you need details on office hours or course outlines!`;
    }

    if (top.category === 'siwes' || qLower.includes('siwes') || qLower.includes('internship') || qLower.includes('industrial training')) {
      return `Hey! Here is the official SIWES guide for our statistics students:\n\n${text}\n\nNeed any guidance on logbook entries or technical report preparation?`;
    }

    if (top.category === 'event' || qLower.includes('event') || qLower.includes('calendar') || qLower.includes('exam')) {
      return `Hey! Here is the schedule information from the department:\n\n${text}\n\nWant me to help you prepare past questions ahead of exam dates?`;
    }

    const cleanText = text.length > 550 ? text.slice(0, 520) + '...' : text;
    return `Hey! Here is what we cover on that:\n\n${cleanText}\n\nWant me to walk you through a past question on this?`;
  }

  // 5. Unrelated topic redirection
  if (/\b(?:football|soccer|premier\s+league|cooking|recipe|music|celebrity|movie|fashion)\b/i.test(qLower)) {
    return "I'm dedicated to our statistics courses and department matters here at UNIZIK. Let's get back to your studies! What course, past question, or department detail can we tackle next?";
  }

  // 6. Honest missing info fallback
  return "Hey! I don't have that exact detail right now. I recommend checking with the Departmental Secretariat or asking your course representative or an executive. What are we studying today?";
}

function cleanReplyText(text) {
  if (!text) return '';
  return text
    .replace(/\[(?:SOURCE|FILE|DOC|PAGE|PDF)[^\]]*\]/gi, '')
    .replace(/(?:from|in|source:?)\s+[a-zA-Z0-9_\-]+\.pdf\b/gi, '')
    .replace(/[\u2014\u2013]/g, ' - ') // Strip em dashes and en dashes
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Strip emojis
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// POST /api/chat - Main chat completion endpoint
router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const userQuery = message.trim();

  try {
    // 1. Ensure knowledge base is loaded (instant 0-40ms from memory/cache)
    const chunks = await buildKnowledgeBase(false);

    // 2. Find most relevant chunks based on user query
    const relevantChunks = findRelevantChunks(userQuery, chunks, 6);

    // 3. Format context string cleanly without exposing file names or source paths
    let contextText = '';
    if (relevantChunks.length > 0) {
      contextText = relevantChunks.map((c, i) => {
        return `[TOPIC ${i + 1}: ${c.courseCode}]\n${c.text}\n`;
      }).join('\n---------------------\n');
    } else {
      contextText = 'General departmental knowledge from NASS portal.';
    }

    // 4. Try Gemini API client if configured
    const ai = getAIClient();
    let reply = '';

    if (ai) {
      const promptWithContext = `DEPARTMENT AND COURSE KNOWLEDGE:\n\n${contextText}\n\nSTUDENT QUESTION:\n${userQuery}`;
      const contents = [];

      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6); // last 3 turns
        for (const h of recentHistory) {
          if (h.role === 'user' && h.content) {
            contents.push({ role: 'user', parts: [{ text: h.content }] });
          } else if (h.role === 'assistant' && h.content) {
            contents.push({ role: 'model', parts: [{ text: h.content }] });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: promptWithContext }]
      });

      const candidateModels = [
        { name: 'gemini-3.8-flash', timeoutMs: 4000 },
        { name: 'gemini-3.1-flash-lite', timeoutMs: 3000 }
      ];

      for (const candidate of candidateModels) {
        try {
          const generatePromise = ai.models.generateContent({
            model: candidate.name,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION
            }
          });

          const response = await Promise.race([
            generatePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), candidate.timeoutMs))
          ]);

          if (response && response.text) {
            reply = cleanReplyText(response.text);
            break;
          }
        } catch (err) {
          console.warn(`[Sam AI] ${candidate.name} call notice:`, err.message || err.status);
        }
      }
    }

    // 5. If Gemini API was not configured, unreachable, or timed out, use instant grounded synthesis
    if (!reply) {
      reply = synthesizeGroundedResponse(userQuery, relevantChunks);
    }

    return res.json({
      reply: cleanReplyText(reply),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Sam AI] Error processing chat:', err);
    // Never fail with 500: always give student a helpful answer from Sam AI
    return res.json({
      reply: synthesizeGroundedResponse(userQuery, []),
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/chat/status - Returns knowledge base status & greeting
router.get('/status', async (req, res) => {
  const status = getKnowledgeBaseStatus();
  res.json({
    name: 'SAM AI',
    title: 'SAM AI',
    subtitle: 'Friendly Study Companion · Department of Statistics',
    greeting: GREETING,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    ...status
  });
});

// POST /api/chat/reindex - Re-index all PDFs and department documents
router.post('/reindex', async (req, res) => {
  try {
    const chunks = await buildKnowledgeBase(true);
    res.json({
      success: true,
      message: 'Knowledge base re-indexed successfully.',
      totalChunks: chunks.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
