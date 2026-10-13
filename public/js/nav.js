/**
 * NASS Portal - Navigation & Responsive Behavior
 * Handles mobile hamburger drawer, active page highlighting, scroll states,
 * and global dark/light theme toggle injection across all portal views.
 */

(function() {
  function setupThemeSupport() {
    // 1. Ensure theme script or logic exists
    if (!window.NassTheme) {
      const script = document.createElement('script');
      script.src = '/js/theme.js';
      document.head.appendChild(script);
    }

    // 2. Remove any previous toggle in institutional topbar to keep header clean
    const oldTopbarBtn = document.querySelector('.institutional-topbar .theme-toggle-btn');
    if (oldTopbarBtn) {
      oldTopbarBtn.remove();
    }

    // 3. Inject theme toggle in header-actions right next to the search bar
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !headerActions.querySelector('.header-theme-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'theme-toggle-btn header-theme-toggle';
      toggleBtn.id = 'headerThemeToggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Dark / Light Theme');
      toggleBtn.setAttribute('title', 'Toggle Dark / Light Theme');
      toggleBtn.innerHTML = `
        <span class="theme-toggle-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </span>
        <span class="theme-toggle-label">Theme</span>
      `;
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.NassTheme && typeof window.NassTheme.toggle === 'function') {
          window.NassTheme.toggle();
        } else {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          if (isDark) document.documentElement.removeAttribute('data-theme');
          else document.documentElement.setAttribute('data-theme', 'dark');
        }
      });

      const searchBtn = headerActions.querySelector('.search-trigger-btn, #searchTriggerBtn');
      if (searchBtn) {
        searchBtn.insertAdjacentElement('afterend', toggleBtn);
      } else {
        headerActions.insertBefore(toggleBtn, headerActions.firstChild);
      }
    }

    // 4. Ensure navigation drawer does not contain a theme toggle
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('.mobile-theme-item, .theme-toggle-btn').forEach((el) => {
        const item = el.closest('li') || el;
        item.remove();
      });
    }

    // Refresh button icons/text if NassTheme is ready
    if (window.NassTheme && typeof window.NassTheme.getTheme === 'function') {
      window.NassTheme.setTheme(window.NassTheme.getTheme());
    }
  }

  function modernizeNavIcons() {
    const iconSvgs = {
      'home': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'academia': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/><path d="M10 7h6"/><path d="M10 11h6"/></svg>',
      'timetable': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
      'siwes': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      'projects': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>',
      'administration': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="22" y2="22"/><line x1="12" x2="12" y1="2" y2="8"/><path d="m2 8 10-6 10 6v2H2Z"/><path d="M4 10v12"/><path d="M8 10v12"/><path d="M16 10v12"/><path d="M20 10v12"/></svg>',
      'nass': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="m15.477 12.89 2.128 7.643-4.605-2.424-4.605 2.424 2.128-7.643"/></svg>',
      'news': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>',
      'events': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
      'contacts': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      'about': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>',
      'archive': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
      'install': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/><path d="M12 6v6m-3-3 3 3 3-3"/></svg>'
    };

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      let key = 'home';
      if (href.includes('academia')) key = 'academia';
      else if (href.includes('timetable')) key = 'timetable';
      else if (href.includes('siwes')) key = 'siwes';
      else if (href.includes('projects')) key = 'projects';
      else if (href.includes('administration')) key = 'administration';
      else if (href.includes('nass')) key = 'nass';
      else if (href.includes('news')) key = 'news';
      else if (href.includes('events')) key = 'events';
      else if (href.includes('contacts')) key = 'contacts';
      else if (href.includes('about')) key = 'about';
      else if (href.includes('past-questions') || href.includes('archive')) key = 'archive';
      else if (href.includes('apk') || href.includes('download') || href.includes('install')) key = 'install';
      else if (href === '/' || href.includes('index')) key = 'home';

      // Strip legacy emoji characters and wrap text
      const cleanText = link.textContent.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
      const svg = iconSvgs[key] || iconSvgs['home'];
      link.innerHTML = `<span class="mobile-nav-icon" style="display:inline-flex; align-items:center; color:${key === 'install' ? '#fbbf24' : 'var(--primary-color)'};">${svg}</span><span>${cleanText}</span>`;
      link.style.display = 'flex';
      link.style.alignItems = 'center';
      link.style.gap = '12px';
    });
  }

  // Global PWA Install Prompt Listener
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // Mobile Drawer Control (available throughout module)
  function openMobileDrawer() {
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    const screenContent = document.getElementById('nassScreenContent');
    if (screenContent) screenContent.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    const screenContent = document.getElementById('nassScreenContent');
    if (screenContent) screenContent.style.overflow = '';
  }

  function ensureInstallModal() {
    let backdrop = document.getElementById('nassInstallModalBackdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = 'nassInstallModalBackdrop';
    backdrop.className = 'nass-modal-backdrop nass-install-modal-backdrop';
    backdrop.innerHTML = `
      <div class="nass-install-modal" role="dialog" aria-modal="true" aria-labelledby="nassModalTitle">
        <div class="nass-modal-header">
          <img src="/resources/images/nass-logo.jpg" alt="NASS UNIZIK Logo" class="nass-modal-logo" onerror="this.src='/favicon.ico'">
          <div class="nass-modal-title-group">
            <h3 id="nassModalTitle" class="nass-modal-title">Install NASS UNIZIK App</h3>
            <p class="nass-modal-sub">Department of Statistics • Faculty of Physical Sciences</p>
          </div>
          <button type="button" class="nass-modal-close" id="nassModalCloseBtn" aria-label="Close dialog">&times;</button>
        </div>
        <div class="nass-modal-body" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Option 1: Android -->
          <div class="nass-install-option-card" style="padding: 16px 18px;">
            <div class="nass-opt-top" style="margin-bottom: 12px;">
              <span class="nass-opt-heading" style="font-size: 1.05rem; font-weight: 700;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                <span>Android</span>
              </span>
            </div>
            <a href="/downloads/NASS_UNIZIK.apk" download="NASS_UNIZIK.apk" id="nassInstallAndroidBtn" class="nass-opt-btn gold" style="padding: 12px 18px; font-size: 0.95rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Install on Android</span>
            </a>
          </div>

          <!-- Option 2: iOS -->
          <div class="nass-install-option-card" style="padding: 16px 18px;">
            <div class="nass-opt-top" style="margin-bottom: 8px;">
              <span class="nass-opt-heading" style="font-size: 1.05rem; font-weight: 700;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20.94c1.5 0 2.75-.78 3.75-.78s2.17.78 3.75.78c2.25 0 4.12-2.12 5.08-4.32-2.33-1.04-2.83-4.14-.85-5.63-1.28-1.92-3.32-2.22-4.04-2.22-1.7 0-3.1 1.05-3.94 1.05-.85 0-2.02-1.01-3.48-1.01-2.52 0-4.87 1.83-5.83 4.46-.86 2.37.1 5.86 2.06 8.78 1 1.48 2.22 2.89 3.5 2.89z"/>
                  <path d="M15.5 2c-.3 1.5-1.5 2.7-2.9 2.9.2-1.4 1.4-2.6 2.9-2.9z"/>
                </svg>
                <span>Apple iOS (iPhone & iPad)</span>
              </span>
            </div>
            
            <!-- Method A: Recommended 1-Click Safari Add to Home Screen -->
            <div style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size: 0.8125rem;">
              <div style="font-weight: 700; color: var(--primary-color); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Recommended Instant Method (No warnings):</span>
              </div>
              <p style="margin: 0; color: var(--text-secondary); line-height: 1.45;">
                In <strong>Safari</strong> on iPhone, tap the <strong>Share</strong> button (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:-1px;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>) at the bottom, scroll down, and tap <strong>"Add to Home Screen"</strong> (<span style="font-weight:700;">+</span>).
              </p>
            </div>

            <!-- Method B: Download iOS Profile -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <a href="/downloads/NASS_UNIZIK.mobileconfig" download="NASS_UNIZIK.mobileconfig" id="nassInstallIosBtn" class="nass-opt-btn primary" style="padding: 10px 16px; font-size: 0.875rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download iOS Profile (.mobileconfig)</span>
              </a>
              <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.35;">
                <em>Note: If iOS prompts "Unsigned Profile", tap <strong>Install</strong> to add the NASS app icon to your Home Screen.</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Event Listeners for Modal
    backdrop.querySelector('#nassModalCloseBtn').addEventListener('click', closeInstallModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeInstallModal();
    });

    const androidBtn = backdrop.querySelector('#nassInstallAndroidBtn');
    if (androidBtn) {
      androidBtn.addEventListener('click', (e) => {
        if (deferredPrompt) {
          e.preventDefault();
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            closeInstallModal();
          });
        } else {
          showDownloadFeedback('Installing on Android', 'Downloading NASS UNIZIK app...');
          setTimeout(closeInstallModal, 1200);
        }
      });
    }

    const iosBtn = backdrop.querySelector('#nassInstallIosBtn');
    if (iosBtn) {
      iosBtn.addEventListener('click', () => {
        showDownloadFeedback('Installing on iOS', 'Downloading NASS UNIZIK profile...');
        setTimeout(closeInstallModal, 1200);
      });
    }

    return backdrop;
  }

  function openInstallModal() {
    closeMobileDrawer();
    const modal = ensureInstallModal();
    if (modal) {
      modal.classList.add('active');
      modal.classList.add('open');
      modal.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden';
  }

  function closeInstallModal() {
    const modal = document.getElementById('nassInstallModalBackdrop');
    if (modal) {
      modal.classList.remove('active');
      modal.classList.remove('open');
      modal.style.display = '';
    }
    document.body.style.overflow = '';
  }

  // Global capture click listener for all Install App triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(
      '.nav-install-btn, .mobile-install-btn, [data-action="install-app"], [data-install-app], a[href="#install-app"], a[href$="#install-app"], .install-trigger'
    );
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      openInstallModal();
      return;
    }

    const anchor = e.target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href') || '';
      const text = (anchor.textContent || '').trim().toLowerCase();
      if (href === '#install-app' || href.endsWith('#install-app') || (text.includes('install app') && (href === '#' || href === ''))) {
        e.preventDefault();
        e.stopPropagation();
        openInstallModal();
        return;
      }
    }
  }, true);

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('nassInstallModalBackdrop');
      if (modal && (modal.classList.contains('active') || modal.classList.contains('open'))) {
        closeInstallModal();
      }
    }
  });

  function showDownloadFeedback(title = 'Downloading NASS Software', desc = 'Your package is downloading. You can also install directly via the menu.') {
    const existing = document.querySelector('.nass-download-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'nass-download-toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="nass-download-toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <div class="nass-download-toast-content">
        <div class="nass-download-toast-title">
          <span>${title}</span>
        </div>
        <div class="nass-download-toast-desc">
          ${desc}
        </div>
      </div>
      <button type="button" class="nass-download-toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.nass-download-toast-close').addEventListener('click', () => {
      toast.remove();
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => toast.remove(), 400);
      }
    }, 6000);
  }

  function setupInstallButtons() {
    // 1. Ensure .main-nav has Install App link
    const mainNav = document.getElementById('mainNav') || document.querySelector('.main-nav');
    if (mainNav && !mainNav.querySelector('.nav-install-btn')) {
      const installLink = document.createElement('a');
      installLink.href = '#install-app';
      installLink.className = 'nav-link nav-install-btn';
      installLink.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
        <span>Install App</span>
      `;
      installLink.setAttribute('title', 'Install NASS UNIZIK Mobile App (Android, iOS & Offline)');
      mainNav.appendChild(installLink);
    }

    // 2. Ensure mobile drawer has Install App item
    const mobileNavList = document.querySelector('.mobile-nav-list');
    if (mobileNavList && !mobileNavList.querySelector('.mobile-install-btn')) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#install-app';
      a.className = 'mobile-nav-link mobile-install-btn';
      a.innerHTML = `
        <span class="mobile-nav-icon" style="display:inline-flex; align-items:center; color:#fbbf24;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 6v6m-3-3 3 3 3-3"/>
          </svg>
        </span>
        <span>Install App (Android / iOS)</span>
      `;
      li.appendChild(a);
      mobileNavList.appendChild(li);
    }

    // Pre-create modal in DOM
    ensureInstallModal();

    // Register Service Worker for PWA installability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration info:', err);
      });
    }
  }

  function initNav() {
    setupThemeSupport();
    setupInstallButtons();
    modernizeNavIcons();

    // 1. Highlight current active page link
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const filename = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.replace(/\/$/, '') || '/';
      const linkFilename = linkPath.split('/').pop() || 'index.html';

      if (
        linkPath === currentPath ||
        (currentPath === '/' && (linkFilename === 'index.html' || linkFilename === '')) ||
        (currentPath.endsWith(linkFilename) && linkFilename !== '')
      ) {
        link.classList.add('active');
      }
    });

    // 2. Mobile Drawer Event Bindings
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    const mobileCloseBtn = document.getElementById('mobileDrawerClose');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileDrawer();
      });
    }

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', closeMobileDrawer);
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileDrawer);
    }

    // Close mobile drawer on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();

