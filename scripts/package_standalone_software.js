import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

const rootDir = process.cwd();
const publicDownloads = path.join(rootDir, 'public/downloads');
fs.mkdirSync(publicDownloads, { recursive: true });

console.log('Packaging NASS UNIZIK 14MB+ Standalone Departmental Software...');

const zip = new AdmZip();

// 1. Add Offline App Runner (index.html)
const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>NASS UNIZIK Departmental Mobile App (Offline Software)</title>
  <meta name="description" content="National Association of Students of Statistics (NASS), Department of Statistics, Nnamdi Azikiwe University, Awka.">
  <style>
    :root {
      --navy: #0c2340;
      --navy-light: #163864;
      --gold: #f59e0b;
      --bg: #090e17;
      --card-bg: #121c2c;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding-bottom: 70px; }
    .header { background: linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%); padding: 18px 20px; border-bottom: 2px solid var(--gold); }
    .header-title { font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .header-sub { font-size: 0.8rem; color: #cbd5e1; margin-top: 2px; }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.2); color: var(--gold); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; margin-top: 6px; }
    .container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .card { background: var(--card-bg); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .card-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .doc-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); }
    .doc-info { flex: 1; padding-right: 12px; }
    .doc-name { font-weight: 600; font-size: 0.88rem; color: #f8fafc; }
    .doc-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn-gold { background: var(--gold); color: #000; font-weight: 700; }
    .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
    .search-box { width: 100%; padding: 12px 16px; background: var(--card-bg); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #fff; font-size: 0.9rem; margin-bottom: 16px; }
    .search-box:focus { outline: none; border-color: var(--gold); }
    .tabs { position: fixed; bottom: 0; left: 0; right: 0; background: #0c2340; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-around; padding: 10px 0; z-index: 100; }
    .tab-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-muted); text-decoration: none; font-size: 0.72rem; }
    .tab-item.active { color: var(--gold); font-weight: 700; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">NASS UNIZIK Departmental Portal</div>
    <div class="header-sub">Department of Statistics • Faculty of Physical Sciences</div>
    <span class="badge">OFFLINE SOFTWARE • 14MB+ COMPLETE BUNDLE</span>
  </div>

  <div class="container">
    <input type="text" id="searchInput" class="search-box" placeholder="Search courses, past questions, lecture notes..." oninput="filterMaterials()">

    <div class="card">
      <div class="card-title">📚 Departmental Course Notes & Past Questions</div>
      <div id="materialsList">
        <div class="doc-item" data-search="STA 312 Bivariate Distributions Probability">
          <div class="doc-info">
            <div class="doc-name">STA 312: Bivariate Distributions Theory</div>
            <div class="doc-meta">300 Level • Statistics Core • PDF Document</div>
          </div>
          <a href="materials/STA_312_Bivariate_Distributions_Theory.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="STA 312 Order Statistics Part 1">
          <div class="doc-info">
            <div class="doc-name">STA 312: Order Statistics Module</div>
            <div class="doc-meta">300 Level • Mathematical Proofs • PDF Document</div>
          </div>
          <a href="materials/STA_312_Order_Statistics_Part_1.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="STA 322 Course Material Applied Statistics">
          <div class="doc-info">
            <div class="doc-name">STA 322: Complete Course Material</div>
            <div class="doc-meta">300 Level • 1.4 MB • Comprehensive Module</div>
          </div>
          <a href="materials/STA_322_Course_Material.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="STA 331 Regression Analysis Compendium">
          <div class="doc-info">
            <div class="doc-name">STA 331: Regression Analysis Course Compendium</div>
            <div class="doc-meta">300 Level • Linear & Multiple Models • PDF</div>
          </div>
          <a href="materials/STA_331_Regression_Analysis_Course_Compendium.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="STA 371 Operations Research Dr Ikediuwa">
          <div class="doc-info">
            <div class="doc-name">STA 371: Operations Research (Dr. Ikediuwa)</div>
            <div class="doc-meta">300 Level • 3.8 MB • Linear Programming & Duality</div>
          </div>
          <a href="materials/sta371_operations_research_dr_ikediuwa.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="COS 201 C++ Programming Lecture Note">
          <div class="doc-info">
            <div class="doc-name">COS 201: C++ Programming Lecture Note</div>
            <div class="doc-meta">200 Level • Computer Science Foundation • PDF</div>
          </div>
          <a href="materials/COS_201_Lecture_Note_on_C_Plus_Plus.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="CSC 202 Practice Module Past Questions">
          <div class="doc-info">
            <div class="doc-name">CSC 202: Course Material & Practice Module</div>
            <div class="doc-meta">200 Level • Computer Science • PDF</div>
          </div>
          <a href="materials/CSC_202_Course_Material_and_Practice_Module.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="ENT 312 Entrepreneurship Complete Notes">
          <div class="doc-info">
            <div class="doc-name">ENT 312: Complete Chapters 1-15 Master Notes</div>
            <div class="doc-meta">300 Level • General Studies • PDF</div>
          </div>
          <a href="materials/ENT_312_Chapters_1_to_15_Complete_Notes.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="GST 312 Peace and Conflict Resolution CBT">
          <div class="doc-info">
            <div class="doc-name">GST 312: Complete 12 Chapters Master Summary</div>
            <div class="doc-meta">300 Level • CBT Practice & Answers • PDF</div>
          </div>
          <a href="materials/GST_312_Complete_12_Chapters_Master_Summary.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="Statistical Tables Dougherty Normal t F Chi-square">
          <div class="doc-info">
            <div class="doc-name">Official Statistical Tables (Z, t, F, Chi-Square)</div>
            <div class="doc-meta">Standard Departmental Reference • PDF</div>
          </div>
          <a href="materials/Statistical_Tables.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
        <div class="doc-item" data-search="Schaum's Outline Statistics Schaums Probability">
          <div class="doc-info">
            <div class="doc-name">Schaum's Outline: Probability & Statistics</div>
            <div class="doc-meta">4.3 MB • Solved Problems Reference Book</div>
          </div>
          <a href="materials/schaums_outline_statistics.pdf" class="btn btn-gold" download>Read / Save</a>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📲 Installation & Multi-Platform Support</div>
      <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5; margin-bottom:12px;">
        This software runs standalone on any phone or computer without requiring an app store or specialized permissions.
      </p>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <a href="NASS_UNIZIK.mobileconfig" class="btn btn-outline" download>🍏 Install iOS Apple Configuration Profile</a>
        <a href="database/nass_portal.db" class="btn btn-outline" download>🗄️ Departmental SQLite Database (nass_portal.db)</a>
      </div>
    </div>
  </div>

  <div class="tabs">
    <a href="#" class="tab-item active">
      <span>🏠 Home</span>
    </a>
    <a href="#materialsList" class="tab-item">
      <span>📚 Courses</span>
    </a>
    <a href="#materialsList" class="tab-item">
      <span>📝 Past Qs</span>
    </a>
  </div>

  <script>
    function filterMaterials() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('.doc-item').forEach(item => {
        const text = (item.getAttribute('data-search') + ' ' + item.innerText).toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>`;

zip.addFile('index.html', Buffer.from(offlineHtml, 'utf8'));

// 2. Add README
const readme = `NASS UNIZIK DEPARTMENTAL MOBILE APPLICATION & OFFLINE SOFTWARE
Department of Statistics • Nnamdi Azikiwe University (UNIZIK), Awka
Faculty of Physical Sciences

========================================================================
HOW TO RUN ON YOUR DEVICE (ANDROID, iOS, WINDOWS, MAC, LINUX)
========================================================================

1. ON ANDROID:
   - Extract this folder on your phone.
   - Tap 'index.html' to open in Chrome, Samsung Internet, or Opera.
   - You can tap 'Add to Home screen' in Chrome to place the NASS icon on your home screen.
   - All 14MB+ of lecture notes, past questions, and statistical tables will open instantly offline!
   - NO "problem in parsing the package" error because it runs directly on Android without APK parsing conflicts!

2. ON iPHONE / iPAD (iOS):
   - AirDrop or open this folder on your Apple device.
   - Tap 'NASS_UNIZIK.mobileconfig' to install the official UNIZIK WebClip profile to your home screen!
   - Or open 'index.html' in Safari, tap the Share button (square with arrow), and tap 'Add to Home Screen'.

3. ON PC / LAPTOP (WINDOWS, MAC, LINUX):
   - Simply double click 'index.html' to launch the portal.

========================================================================
INCLUDED MATERIALS (14MB+ BUNDLE):
- STA 312 Bivariate Distributions & Mathematical Proofs
- STA 312 Order Statistics Part 1, 2, 3
- STA 322 Complete Course Material
- STA 331 Regression Analysis Compendium
- STA 371 Operations Research (Dr. Ikediuwa, 3.8MB)
- COS 201 C++ Programming Notes
- CSC 202 Course Material & Practice Module
- ENT 312 Entrepreneurship Master Notes (Chapters 1-15)
- GST 312 Peace & Conflict Resolution CBT Study Guide
- Schaum's Outline Statistics & Solved Problems
- Official Statistical Tables (Z, t, F, Chi-Square)
- Departmental SQLite Database (nass_portal.db)
- Apple iOS Profile (NASS_UNIZIK.mobileconfig)
========================================================================
Designed by NASS UNIZIK • Powered by PhanCore
`;
zip.addFile('README_HOW_TO_INSTALL.txt', Buffer.from(readme, 'utf8'));

// 3. Add iOS mobileconfig
const mobileconfigPath = path.join(rootDir, 'NASS_UNIZIK.mobileconfig');
if (fs.existsSync(mobileconfigPath)) {
  zip.addFile('NASS_UNIZIK.mobileconfig', fs.readFileSync(mobileconfigPath));
}

// 4. Add Database
const dbPath = path.join(rootDir, 'data/nass_portal.db');
if (fs.existsSync(dbPath)) {
  zip.addFile('database/nass_portal.db', fs.readFileSync(dbPath));
}

// 5. Add Key PDF materials up to ~14.5MB
const materials = [
  { src: 'resources/documents/STA_312_Bivariate_Distributions_Theory.pdf', dest: 'materials/STA_312_Bivariate_Distributions_Theory.pdf' },
  { src: 'resources/documents/STA_312_Order_Statistics_Part_1.pdf', dest: 'materials/STA_312_Order_Statistics_Part_1.pdf' },
  { src: 'resources/documents/STA_322_Course_Material.pdf', dest: 'materials/STA_322_Course_Material.pdf' },
  { src: 'resources/documents/STA_331_Regression_Analysis_Course_Compendium.pdf', dest: 'materials/STA_331_Regression_Analysis_Course_Compendium.pdf' },
  { src: 'resources/materials/sta371_operations_research_dr_ikediuwa.pdf', dest: 'materials/sta371_operations_research_dr_ikediuwa.pdf' },
  { src: 'resources/documents/COS_201_Lecture_Note_on_C_Plus_Plus.pdf', dest: 'materials/COS_201_Lecture_Note_on_C_Plus_Plus.pdf' },
  { src: 'resources/documents/CSC_202_Course_Material_and_Practice_Module.pdf', dest: 'materials/CSC_202_Course_Material_and_Practice_Module.pdf' },
  { src: 'resources/documents/ENT_312_Chapters_1_to_15_Complete_Notes.pdf', dest: 'materials/ENT_312_Chapters_1_to_15_Complete_Notes.pdf' },
  { src: 'resources/documents/GST_312_Complete_12_Chapters_Master_Summary.pdf', dest: 'materials/GST_312_Complete_12_Chapters_Master_Summary.pdf' },
  { src: 'resources/documents/Statistical_Tables.pdf', dest: 'materials/Statistical_Tables.pdf' },
  { src: 'resources/materials/schaums_outline_statistics.pdf', dest: 'materials/schaums_outline_statistics.pdf' },
  { src: 'resources/materials/mat202_mathematical_methods_notes.pdf', dest: 'materials/mat202_mathematical_methods_notes.pdf' }
];

for (const m of materials) {
  const fullSrc = path.join(rootDir, m.src);
  if (fs.existsSync(fullSrc)) {
    zip.addFile(m.dest, fs.readFileSync(fullSrc));
  }
}

const zipBuffer = zip.toBuffer();
console.log('Final Software Package Size:', (zipBuffer.length / (1024 * 1024)).toFixed(2), 'MB');

const targets = [
  path.join(publicDownloads, 'NASS_UNIZIK_Software_Package.zip'),
  path.join(publicDownloads, 'NASS_UNIZIK_App.zip'),
  path.join(rootDir, 'dist/downloads/NASS_UNIZIK_Software_Package.zip'),
  path.join(rootDir, 'dist/downloads/NASS_UNIZIK_App.zip')
];

for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, zipBuffer);
  console.log('Saved to:', t);
}
console.log('Software Packaging complete!');
