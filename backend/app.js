import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './database.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import timetableRoutes from './routes/timetable.js';
import staffRoutes from './routes/staff.js';
import executiveRoutes from './routes/executives.js';
import newsRoutes from './routes/news.js';
import eventRoutes from './routes/events.js';
import siwesRoutes from './routes/siwes.js';
import projectRoutes from './routes/projects.js';
import galleryRoutes from './routes/gallery.js';
import contactRoutes from './routes/contacts.js';
import announcementRoutes from './routes/announcements.js';
import searchRoutes from './routes/search.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';
import faqRoutes from './routes/faqs.js';
import materialRoutes from './routes/materials.js';
import settingsRoutes from './routes/settings.js';
import careersRoutes from './routes/careers.js';
import scheduledNotificationRoutes from './routes/scheduled_notifications.js';
import samRoutes from './routes/sam.js';
import { startNotificationScheduler } from './scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Initialize database schema and data
initDatabase();

// Start background notification scheduler
startNotificationScheduler();

const app = express();

// Body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Universal CORS & iframe headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Force no-store / no-cache on all API endpoints so updates reflect universally
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Direct Package Download Routes (Explicitly placed before static middleware for correct MIME & Content-Disposition)
app.get(['/downloads/NASS_UNIZIK.apk', '/downloads/nass-unizik.apk', '/NASS_UNIZIK.apk', '/nass-unizik.apk'], (req, res) => {
  const apkPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK.apk');
  const fallbackPath = path.join(ROOT_DIR, 'NASS_UNIZIK.apk');
  const targetPath = fs.existsSync(apkPath) ? apkPath : fallbackPath;

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="NASS_UNIZIK.apk"');
  res.sendFile(targetPath);
});

app.get(['/downloads/NASS_UNIZIK.mobileconfig', '/downloads/nass-unizik.mobileconfig', '/NASS_UNIZIK.mobileconfig', '/nass-unizik.mobileconfig'], (req, res) => {
  const configPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK.mobileconfig');
  const fallbackPath = path.join(ROOT_DIR, 'NASS_UNIZIK.mobileconfig');
  const targetPath = fs.existsSync(configPath) ? configPath : fallbackPath;

  res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="NASS_UNIZIK.mobileconfig"');
  res.sendFile(targetPath);
});

app.get(['/downloads/Statistical_Tables.pdf', '/Statistical_Tables.pdf', '/downloads/statistical-tables.pdf', '/statistical-tables.pdf'], (req, res) => {
  const filePath = path.join(ROOT_DIR, 'resources/documents/Statistical_Tables.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Statistical_Tables_UNIZIK.pdf"');
  res.sendFile(filePath);
});

// Static asset folders
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
app.use('/resources', express.static(path.join(ROOT_DIR, 'resources')));
app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));
app.use(express.static(path.join(ROOT_DIR, 'public')));

// PWA Service Worker & Manifest headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(ROOT_DIR, 'public/sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(ROOT_DIR, 'public/manifest.json'));
});

// If on Vercel or cloud environments, also serve /tmp/uploads
if (process.env.VERCEL && fs.existsSync('/tmp/uploads')) {
  app.use('/uploads', express.static('/tmp/uploads'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/executives', executiveRoutes);
app.use('/api/excos', executiveRoutes); // Alias for executives
app.use('/api/materials', materialRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/siwes', siwesRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/scheduled-notifications', scheduledNotificationRoutes);
app.use('/api/sam', samRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'NASS Departmental Portal',
    department: 'Department of Statistics, UNIZIK',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
    timestamp: new Date().toISOString()
  });
});

// PWA Manifest and Service Worker routes
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.sendFile(path.join(ROOT_DIR, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(ROOT_DIR, 'sw.js'));
});

// Website reference routes (The original multi-page departmental website)
const pageRoutes = [
  { path: '/', file: 'website.html' },
  { path: '/index.html', file: 'website.html' },
  { path: '/home', file: 'website.html' },
  { path: '/website', file: 'website.html' },
  { path: '/website.html', file: 'website.html' },
  { path: '/portal', file: 'website.html' },
  { path: '/app', file: 'app.html' },
  { path: '/app.html', file: 'app.html' },
  { path: '/academia', file: 'academia.html' },
  { path: '/academia.html', file: 'academia.html' },
  { path: '/timetable', file: 'timetable.html' },
  { path: '/timetable.html', file: 'timetable.html' },
  { path: '/administration', file: 'administration.html' },
  { path: '/administration.html', file: 'administration.html' },
  { path: '/staff', file: 'administration.html' },
  { path: '/staff-profile.html', file: 'staff-profile.html' },
  { path: '/nass', file: 'nass.html' },
  { path: '/nass.html', file: 'nass.html' },
  { path: '/executives', file: 'nass.html' },
  { path: '/excos', file: 'nass.html' },
  { path: '/events', file: 'events.html' },
  { path: '/events.html', file: 'events.html' },
  { path: '/news', file: 'news.html' },
  { path: '/news.html', file: 'news.html' },
  { path: '/archive', file: 'archive.html' },
  { path: '/archive.html', file: 'archive.html' },
  { path: '/gallery', file: 'archive.html' },
  { path: '/past-questions', file: 'past-questions.html' },
  { path: '/past-questions.html', file: 'past-questions.html' },
  { path: '/siwes', file: 'siwes.html' },
  { path: '/siwes.html', file: 'siwes.html' },
  { path: '/projects', file: 'projects.html' },
  { path: '/projects.html', file: 'projects.html' },
  { path: '/contacts', file: 'contacts.html' },
  { path: '/contacts.html', file: 'contacts.html' },
  { path: '/contact', file: 'contacts.html' },
  { path: '/about', file: 'about.html' },
  { path: '/about.html', file: 'about.html' },
  { path: '/sam', file: 'sam.html' },
  { path: '/sam.html', file: 'sam.html' },
  { path: '/ai', file: 'sam.html' },
  { path: '/admin', file: 'admin.html' },
  { path: '/admin.html', file: 'admin.html' }
];

// 14MB+ Full Departmental Software Package (Universal cross-platform offline bundle)
app.get(['/downloads/NASS_UNIZIK_Software_Package.zip', '/downloads/NASS_UNIZIK_App.zip', '/NASS_UNIZIK_Software_Package.zip', '/NASS_UNIZIK_App.zip'], (req, res) => {
  const zipPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK_Software_Package.zip');
  const fallbackPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK_App.zip');
  const targetPath = fs.existsSync(zipPath) ? zipPath : fallbackPath;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="NASS_UNIZIK_Software_Package.zip"');
  res.sendFile(targetPath);
});

// Direct Android APK Native App download route
app.get(['/downloads/NASS_UNIZIK.apk', '/downloads/nass-unizik.apk', '/NASS_UNIZIK.apk', '/nass-unizik.apk'], (req, res) => {
  const apkPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK.apk');
  const fallbackPath = path.join(ROOT_DIR, 'NASS_UNIZIK.apk');
  const targetPath = fs.existsSync(apkPath) ? apkPath : fallbackPath;

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="NASS_UNIZIK.apk"');
  res.sendFile(targetPath);
});

// Apple iOS Native WebClip configuration profile download route
app.get(['/downloads/NASS_UNIZIK.mobileconfig', '/downloads/nass-unizik.mobileconfig', '/NASS_UNIZIK.mobileconfig', '/nass-unizik.mobileconfig'], (req, res) => {
  const configPath = path.join(ROOT_DIR, 'public/downloads/NASS_UNIZIK.mobileconfig');
  const fallbackPath = path.join(ROOT_DIR, 'NASS_UNIZIK.mobileconfig');
  const targetPath = fs.existsSync(configPath) ? configPath : fallbackPath;

  res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="NASS_UNIZIK.mobileconfig"');
  res.sendFile(targetPath);
});

// Statistical Tables PDF download route
app.get(['/downloads/Statistical_Tables.pdf', '/Statistical_Tables.pdf', '/downloads/statistical-tables.pdf', '/statistical-tables.pdf'], (req, res) => {
  const filePath = path.join(ROOT_DIR, 'resources/documents/Statistical_Tables.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Statistical_Tables_UNIZIK.pdf"');
  res.sendFile(filePath);
});

// Career legacy URLs redirect to the expanded section in About Department
app.get(['/careers', '/careers.html', '/where-statistics-can-take-you', '/where-can-statistics-take-you'], (req, res) => {
  res.redirect(301, '/about.html#where-statistics-can-take-you');
});

pageRoutes.forEach(r => {
  app.get(r.path, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(ROOT_DIR, r.file));
  });
});

// Initialize Vite middleware in development or serve dist in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(ROOT_DIR, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/resources') || req.path.startsWith('/downloads')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
} else {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.warn('Vite middleware could not be initialized:', err);
  }
}

// Fallback static files from root
app.use(express.static(ROOT_DIR));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
