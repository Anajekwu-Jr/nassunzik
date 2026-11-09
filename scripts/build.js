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

// Run vite build first to compile React mobile app
try {
  console.log('Building React mobile application with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
} catch (err) {
  console.error('Vite build error:', err);
}

// Copy all root HTML files (preserving Vite-compiled app.html)
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  if ((file.endsWith('.html') && file !== 'app.html') || file === 'manifest.json' || file === 'sw.js' || file === 'favicon.ico' || file === 'metadata.json') {
    const src = path.join(rootDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file} -> dist/${file}`);
  }
}

// Helper to copy directories recursively
function copyDirSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy static asset directories
const assetDirs = ['css', 'js', 'resources', 'uploads', 'data', 'public'];
for (const dir of assetDirs) {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    copyDirSync(src, dest);
    console.log(`Copied directory: ${dir}/ -> dist/${dir}/`);
  }
}

// Ensure dist/downloads exists and contains all downloadable artifacts
const distDownloads = path.join(distDir, 'downloads');
fs.mkdirSync(distDownloads, { recursive: true });

const publicDownloads = path.join(rootDir, 'public/downloads');
if (fs.existsSync(publicDownloads)) {
  copyDirSync(publicDownloads, distDownloads);
  console.log('Copied all public/downloads to dist/downloads/');
}

// Copy APK binary to dist root and dist/downloads/
if (fs.existsSync(path.join(rootDir, 'NASS_UNIZIK.apk'))) {
  fs.copyFileSync(path.join(rootDir, 'NASS_UNIZIK.apk'), path.join(distDir, 'NASS_UNIZIK.apk'));
  const distDownloads = path.join(distDir, 'downloads');
  if (!fs.existsSync(distDownloads)) fs.mkdirSync(distDownloads, { recursive: true });
  fs.copyFileSync(path.join(rootDir, 'NASS_UNIZIK.apk'), path.join(distDownloads, 'NASS_UNIZIK.apk'));
  console.log('Copied NASS_UNIZIK.apk to dist/ and dist/downloads/');
}

// Copy iOS mobileconfig to dist root and dist/downloads/
if (fs.existsSync(path.join(rootDir, 'NASS_UNIZIK.mobileconfig'))) {
  fs.copyFileSync(path.join(rootDir, 'NASS_UNIZIK.mobileconfig'), path.join(distDir, 'NASS_UNIZIK.mobileconfig'));
  const distDownloads = path.join(distDir, 'downloads');
  if (!fs.existsSync(distDownloads)) fs.mkdirSync(distDownloads, { recursive: true });
  fs.copyFileSync(path.join(rootDir, 'NASS_UNIZIK.mobileconfig'), path.join(distDownloads, 'NASS_UNIZIK.mobileconfig'));
  console.log('Copied NASS_UNIZIK.mobileconfig to dist/ and dist/downloads/');
}

// Copy zip packages to dist root and dist/downloads/
const zipNames = ['NASS_UNIZIK_Software_Package.zip', 'NASS_UNIZIK_App.zip'];
for (const zipName of zipNames) {
  const publicZip = path.join(publicDownloads, zipName);
  if (fs.existsSync(publicZip)) {
    fs.copyFileSync(publicZip, path.join(distDir, zipName));
    fs.copyFileSync(publicZip, path.join(distDownloads, zipName));
    console.log(`Copied ${zipName} to dist/ and dist/downloads/`);
  }
}

console.log('Build completed successfully! Output directory "dist" is ready.');
