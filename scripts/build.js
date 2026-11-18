import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('Starting mobile app & portal build for production deployment...');

// Build native app packages (Signed APK and iOS MobileConfig Profile)
try {
  console.log('Building authentic signed Android APK package...');
  execSync('node scripts/build_full_apk.js', { stdio: 'inherit' });
  console.log('Building Apple iOS configuration profile...');
  execSync('node scripts/build_packages.js', { stdio: 'inherit' });
  console.log('Building 14MB+ standalone software package...');
  execSync('node scripts/package_standalone_software.js', { stdio: 'inherit' });
} catch (err) {
  console.error('Error generating native app packages:', err);
}

// Clean previous dist directory to prevent stale duplicate artifacts
fs.rmSync(distDir, { recursive: true, force: true });

// Run vite build first to compile React mobile app and copy public/* into dist/
try {
  console.log('Building React mobile application with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
} catch (err) {
  console.error('Vite build error:', err);
}

// Copy all root HTML files (preserving Vite-compiled app.html)
const SKIP_ROOT_HTML = new Set(['app.html', 'sample_profile_nau2436.html', 'unizik_statistics_page.html']);
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  if ((file.endsWith('.html') && !SKIP_ROOT_HTML.has(file)) || file === 'manifest.json' || file === 'sw.js' || file === 'favicon.ico' || file === 'metadata.json') {
    const src = path.join(rootDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file} -> dist/${file}`);
  }
}

// Helper to copy directories recursively (skips nested APK/temp files inside resources)
function copyDirSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.gitkeep' || entry.name.endsWith('.apk')) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy static asset directories once (Vite already copies public/* to dist root)
const assetDirs = ['css', 'js', 'resources', 'uploads', 'data'];
for (const dir of assetDirs) {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    copyDirSync(src, dest);
    console.log(`Copied directory: ${dir}/ -> dist/${dir}/`);
  }
}

// Sanitize static portal_state_backup.json copy in dist/ so no private user hashes or server-only schedules are exposed publicly
const distBackupPath = path.join(distDir, 'data', 'portal_state_backup.json');
if (fs.existsSync(distBackupPath)) {
  try {
    const backupJson = JSON.parse(fs.readFileSync(distBackupPath, 'utf-8'));
    delete backupJson.users;
    delete backupJson.scheduled_notifications;
    fs.writeFileSync(distBackupPath, JSON.stringify(backupJson));
    console.log('Sanitized dist/data/portal_state_backup.json for public static hosting.');
  } catch (err) {
    console.warn('Warning sanitizing dist backup JSON:', err.message);
  }
}

// Verify Cloudflare Pages per-file limit (25 MiB = 26,214,400 bytes) & required routing files
const CF_MAX_FILE_BYTES = 25 * 1024 * 1024;
const oversizedFiles = [];
function auditDistSizes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      auditDistSizes(fullPath);
    } else {
      const size = fs.statSync(fullPath).size;
      if (size > CF_MAX_FILE_BYTES) {
        oversizedFiles.push({ path: path.relative(distDir, fullPath), mb: (size / (1024 * 1024)).toFixed(2) });
      }
    }
  }
}
auditDistSizes(distDir);

if (!fs.existsSync(path.join(distDir, '_redirects')) || !fs.existsSync(path.join(distDir, '_headers'))) {
  throw new Error('Cloudflare Pages configuration missing: dist/_redirects or dist/_headers not found.');
}

if (oversizedFiles.length > 0) {
  throw new Error(
    `Cloudflare Pages 25 MiB per-file limit exceeded by: ${oversizedFiles.map(f => `${f.path} (${f.mb} MB)`).join(', ')}`
  );
}

console.log('Cloudflare Pages audit passed: all dist/ files are under 25 MiB and _redirects/_headers are present.');
console.log('Build completed successfully! Output directory "dist" is ready.');
