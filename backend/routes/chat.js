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

    // 3. Format context string cleanly without exposing file names or source paths
    let contextText = '';
    if (relevantChunks.length > 0) {
      contextText = relevantChunks.map((c, i) => {
        return `[TOPIC ${i + 1}: ${c.courseCode}]\n${c.text}\n`;
      }).join('\n---------------------\n');
    } else {
      contextText = 'General departmental knowledge from NASS portal.';
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
    const promptWithContext = `DEPARTMENT AND COURSE KNOWLEDGE:\n\n${contextText}\n\nSTUDENT QUESTION:\n${userQuery}`;

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
            temperature: 0.3,
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
      reply = `${best.text.slice(0, 450)}...\n\nWant me to walk you through a past question on this?`;
    } else if (!reply) {
      reply = "I don't have that specific information right now. Could you check with the department or an executive officer? What are we studying today?";
    }

    return res.json({
      reply,
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
