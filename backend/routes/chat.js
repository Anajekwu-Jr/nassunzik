import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  buildKnowledgeBase,
  findRelevantChunks,
  getKnowledgeBaseStatus
} from '../sam_ai_knowledge.js';

const router = express.Router();

const SYSTEM_INSTRUCTION = `You are Sam AI, the companion for statistics students at the NAS portal. You help students study and learn about their department.
Use only the course materials and department information provided to you in the context below. Do not guess.
You can: find and explain lecture notes, solve past questions step by step, summarise materials, and answer questions about the department, its executives, staff and activities.
Rules:
Always say which course code and file your answer came from.
If the answer isn't in the provided material, say so clearly. Never invent names, titles, contacts or facts about people.
Keep answers short, friendly and in simple English.
Stay on academics and department matters. Politely decline anything unrelated.`;

const GREETING = "Hi, I'm Sam AI, your companion for statistics. Ask me about your courses, past questions, or the department, its executives and staff. I'm here for you.";

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

// POST /api/chat - Main chat completion endpoint
router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const userQuery = message.trim();

  try {
    // 1. Ensure knowledge base is loaded
    const chunks = await buildKnowledgeBase(false);

    // 2. Find most relevant chunks based on user query
    const relevantChunks = findRelevantChunks(userQuery, chunks, 7);

    // 3. Format context string with course code and file name
    let contextText = '';
    if (relevantChunks.length > 0) {
      contextText = relevantChunks.map((c, i) => {
        return `[SOURCE ${i + 1}]\nCourse Code: ${c.courseCode}\nFile: ${c.fileName}\nContent:\n${c.text}\n`;
      }).join('\n---------------------\n');
    } else {
      contextText = 'No specific course document found matching the query tokens directly. Rely on departmental guidelines.';
    }

    // 4. Verify Gemini API key
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.',
        greeting: GREETING
      });
    }

    // 5. Build prompt payload
    const promptWithContext = `CONTEXT FROM DEPARTMENT MATERIALS & COURSE DOCUMENTS:\n\n${contextText}\n\nSTUDENT QUESTION:\n${userQuery}`;

    // 6. Build conversation contents (including short history if provided)
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

    // 7. Call Gemini model with candidate fallback models and timeout
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    let reply = '';
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2, // Lower temperature to prioritize strict factuality
            maxOutputTokens: 1000
          }
        });

        const response = await Promise.race([
          generatePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 8000))
        ]);

        if (response && response.text) {
          reply = response.text.trim();
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Sam AI] ${modelName} call notice:`, err.message || err.status);
      }
    }

    // Direct grounded synthesis fallback if remote API is experiencing downtime/503
    if (!reply && relevantChunks.length > 0) {
      const best = relevantChunks[0];
      reply = `Based on ${best.courseCode} (${best.fileName}):\n\n${best.text.slice(0, 450)}...\n\n(Course Code: ${best.courseCode}, File: ${best.fileName})`;
    } else if (!reply) {
      reply = "I'm sorry, I couldn't locate specific information about that in the provided departmental materials. Please ask about your statistics courses, lecture notes, past questions, or executives.";
    }

    // 8. Extract sources cited
    const sources = relevantChunks.map(c => ({
      courseCode: c.courseCode,
      fileName: c.fileName
    })).filter((v, i, a) => a.findIndex(t => t.courseCode === v.courseCode && t.fileName === v.fileName) === i);

    return res.json({
      reply,
      sources,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Sam AI] Error processing chat:', err);
    return res.status(500).json({
      error: 'Failed to generate answer. ' + (err.message || 'Please try again later.'),
      details: err.message
    });
  }
});

// GET /api/chat/status - Returns knowledge base status & greeting
router.get('/status', async (req, res) => {
  const status = getKnowledgeBaseStatus();
  res.json({
    name: 'Sam AI',
    title: 'Sam AI',
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
