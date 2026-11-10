import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const targetHtmlFiles = [
  'index.html',
  'website.html',
  'about.html',
  'academia.html',
  'administration.html',
  'archive.html',
  'contacts.html',
  'events.html',
  'nass.html',
  'news.html',
  'past-questions.html',
  'projects.html',
  'siwes.html',
  'staff-profile.html',
  'timetable.html'
];

function getActiveKey(filename) {
  if (filename === 'index.html' || filename === 'website.html') return 'home';
  if (filename === 'academia.html') return 'academia';
  if (filename === 'past-questions.html') return 'past-questions';
  if (filename === 'administration.html' || filename === 'staff-profile.html') return 'staffs';
  if (filename === 'nass.html') return 'nass';
  if (filename === 'news.html') return 'news';
  return '';
}

function buildDesktopNav(activeKey) {
  const isHome = activeKey === 'home' ? ' active' : '';
  const isAcademia = activeKey === 'academia' ? ' active' : '';
  const isPastQuestions = activeKey === 'past-questions' ? ' active' : '';
  const isStaffs = activeKey === 'staffs' ? ' active' : '';
  const isNass = activeKey === 'nass' ? ' active' : '';
  const isTraditional = activeKey === 'traditional' ? ' active' : '';
  const isNews = activeKey === 'news' ? ' active' : '';

  return `      <!-- Desktop Navigation -->
      <nav class="main-nav" id="mainNav" aria-label="Primary Navigation">
        <a href="/" class="nav-link${isHome}">Home</a>
        <a href="/academia.html" class="nav-link${isAcademia}">Academia</a>
        <a href="/past-questions.html" class="nav-link${isPastQuestions}">Past questions</a>
        <a href="/administration.html" class="nav-link${isStaffs}">Staffs</a>
        <a href="/nass.html" class="nav-link${isNass}">NASS Excos</a>
        <a href="/traditional-council.html" class="nav-link${isTraditional}">Traditional Council</a>
        <a href="/news.html" class="nav-link${isNews}">News</a>
        <button type="button" class="search-trigger-btn" id="searchTriggerBtn" aria-label="Open Search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span class="search-placeholder">Search portal...</span>
          <kbd class="search-shortcut">Ctrl K</kbd>
        </button>
        <a href="#install-app" class="nav-link nav-install-btn" title="Install NASS UNIZIK Mobile App (Android & iOS)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <span>Install App</span>
        </a>
      </nav>

      <!-- Mobile Hamburger Toggle -->
      <div class="header-actions">
        <button type="button" class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>`;
}

function buildMobileDrawer(activeKey) {
  const isHome = activeKey === 'home' ? ' active' : '';
  const isAcademia = activeKey === 'academia' ? ' active' : '';
  const isPastQuestions = activeKey === 'past-questions' ? ' active' : '';
  const isStaffs = activeKey === 'staffs' ? ' active' : '';
  const isNass = activeKey === 'nass' ? ' active' : '';
  const isTraditional = activeKey === 'traditional' ? ' active' : '';
  const isNews = activeKey === 'news' ? ' active' : '';

  return `  <!-- Mobile Drawer -->
  <div class="mobile-nav-backdrop" id="mobileNavBackdrop"></div>
  <div class="mobile-nav-drawer" id="mobileNavDrawer">
    <div class="mobile-drawer-header">
      <div class="mobile-drawer-brand">NASS UNIZIK</div>
      <button type="button" class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close menu">&times;</button>
    </div>
    <ul class="mobile-nav-list">
      <li><a href="/" class="mobile-nav-link${isHome}">Home</a></li>
      <li><a href="/academia.html" class="mobile-nav-link${isAcademia}">Academia</a></li>
      <li><a href="/past-questions.html" class="mobile-nav-link${isPastQuestions}">Past questions</a></li>
      <li><a href="/administration.html" class="mobile-nav-link${isStaffs}">Staffs</a></li>
      <li><a href="/nass.html" class="mobile-nav-link${isNass}">NASS Excos</a></li>
      <li><a href="/traditional-council.html" class="mobile-nav-link${isTraditional}">Traditional Council</a></li>
      <li><a href="/news.html" class="mobile-nav-link${isNews}">News</a></li>
      <li>
        <button type="button" class="mobile-nav-link search-trigger-btn mobile-search-btn" style="width:100%; text-align:left; background:none; border:none; cursor:pointer; font-family:inherit; font-size:inherit;">
          <span class="mobile-nav-icon" style="display:inline-flex; align-items:center; color:var(--primary);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <span>Search Portal</span>
        </button>
      </li>
      <li>
        <a href="#install-app" class="mobile-nav-link mobile-install-btn">
          <span class="mobile-nav-icon" style="display:inline-flex; align-items:center; color:#fbbf24;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
              <path d="M12 6v6m-3-3 3 3 3-3"/>
            </svg>
          </span>
          <span>Install App (Android & iOS)</span>
        </a>
      </li>
    </ul>
    <div class="mobile-nav-footer">
      <div>National Association of Students of Statistics</div>
      <div style="font-size: 0.75rem; margin-top: 4px;">UNIZIK, Awka · "Facts from Figures"</div>
    </div>
  </div>`;
}

const quickLinksBlock = `        <!-- Column 3: Quick Links & Media -->
        <div>
          <h4 class="footer-col-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="/timetable.html">Lecture Timetable</a></li>
            <li><a href="/events.html">Events & Workshops</a></li>
            <li><a href="/archive.html">Gallery & Photos</a></li>
            <li><a href="/projects.html">Project Guidelines</a></li>
            <li><a href="/siwes.html">SIWES Industrial Training</a></li>
            <li><a href="/about.html">Departmental Profile</a></li>
            <li><a href="/contacts.html">Key Contacts & Helpdesk</a></li>
          </ul>
        </div>`;

for (const file of targetHtmlFiles) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing ${file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const activeKey = getActiveKey(file);

  // 1. Replace main-nav + header-actions block
  // Matches from <!-- Desktop Navigation --> or <nav class="main-nav" until </header>
  const navRegex = /(?:<!-- Desktop Navigation -->\s*)?<nav class="main-nav"[\s\S]*?<\/header>/;
  if (navRegex.test(content)) {
    const replacement = `${buildDesktopNav(activeKey)}\n    </div>\n  </header>`;
    content = content.replace(navRegex, replacement);
  } else {
    console.warn(`Could not find main-nav in ${file}`);
  }

  // 2. Replace mobile drawer
  // Matches from <!-- Mobile Drawer --> or <div class="mobile-nav-backdrop" until </div>\s*</div>\s*(?=<main|<section)/
  const drawerRegex = /(?:<!-- Mobile Drawer -->\s*)?<div class="mobile-nav-backdrop"[\s\S]*?id="mobileNavDrawer"[\s\S]*?<\/div>\s*<\/div>/;
  if (drawerRegex.test(content)) {
    content = content.replace(drawerRegex, buildMobileDrawer(activeKey));
  } else {
    console.warn(`Could not find mobile drawer in ${file}`);
  }

  // 3. Replace Quick Links Column in footer if present
  const quickLinksRegex = /<!-- Column 3: Quick Links[\s\S]*?<\/div>/;
  if (quickLinksRegex.test(content)) {
    content = content.replace(quickLinksRegex, quickLinksBlock);
  }

  // 4. Ensure any remaining theme toggle buttons are removed from the file
  content = content.replace(/<button[^>]*class="[^"]*theme-toggle-btn[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
  content = content.replace(/<button[^>]*id="headerThemeToggle"[^>]*>[\s\S]*?<\/button>/gi, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated menu & footer in ${file}`);
}

console.log('All files updated successfully.');
