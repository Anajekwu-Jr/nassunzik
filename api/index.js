import app from '../backend/app.js';

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Function Error]:', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        error: err.message || 'Internal serverless error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
