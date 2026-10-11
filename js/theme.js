/**
 * NASS Departmental Portal - Theme Controller (Dark / Light Mode)
 * Provides instant theme initialization, persistence in localStorage,
 * and reactive UI icon updates across public pages and admin dashboard.
 */
(function () {
  const STORAGE_KEY = 'nass_portal_theme';

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    // Default to light, but respect system dark mode if preferred
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    updateToggleButtons(theme);
    bindToggleEvents();
    if (theme === 'dark') {
      enforceBrightBackgroundContrast();
    }
  }

  function enforceBrightBackgroundContrast() {
    if (document.documentElement.getAttribute('data-theme') !== 'dark') return;

    function getLuminance(rgbStr) {
      if (!rgbStr) return 0;
      const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return 0;
      const r = parseInt(match[1], 10) / 255;
      const g = parseInt(match[2], 10) / 255;
      const b = parseInt(match[3], 10) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    try {
      const candidates = document.querySelectorAll('[style*="background"], [style*="background-color"], .bg-white, .bg-light, .card, .table-responsive');
      candidates.forEach((el) => {
        const style = el.getAttribute('style') || '';
        const hasBrightStyle = /(?:background|background-color)\s*:\s*(?:#(?:fff|faf|f8|f1|f5|e2)[a-f0-9]*|white)/i.test(style);
        if (hasBrightStyle || el.classList.contains('bg-white') || el.classList.contains('bg-light')) {
          el.setAttribute('data-bright-bg', 'true');
        } else {
          const computed = window.getComputedStyle(el);
          const bg = computed.backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            if (getLuminance(bg) > 0.75) {
              el.setAttribute('data-bright-bg', 'true');
            }
          }
        }
      });
    } catch (e) {}
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  function updateToggleButtons(theme) {
    const isDark = theme === 'dark';
    const buttons = document.querySelectorAll('.theme-toggle-btn');

    buttons.forEach((btn) => {
      btn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      btn.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      
      const iconSpan = btn.querySelector('.theme-toggle-icon');
      if (iconSpan) {
        if (isDark) {
          // Show Sun icon to switch back to Light
          iconSpan.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          `;
        } else {
          // Show Moon icon to switch to Dark
          iconSpan.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          `;
        }
      }

      const textSpan = btn.querySelector('.theme-toggle-label');
      if (textSpan) {
        textSpan.textContent = isDark ? 'Light' : 'Dark';
      }
    });
  }

  // Initial immediate application to eliminate flash of unstyled content
  const initialTheme = getSavedTheme();
  if (initialTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Expose global controller
  window.NassTheme = {
    getTheme: () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    setTheme: applyTheme,
    toggle: toggleTheme,
    update: () => {
      const currentTheme = window.NassTheme.getTheme();
      updateToggleButtons(currentTheme);
      bindToggleEvents();
      if (currentTheme === 'dark') {
        enforceBrightBackgroundContrast();
      }
    }
  };

  // Bind to DOM when loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const currentTheme = window.NassTheme.getTheme();
      updateToggleButtons(currentTheme);
      bindToggleEvents();
      if (currentTheme === 'dark') {
        enforceBrightBackgroundContrast();
      }
    });
  } else {
    const currentTheme = window.NassTheme.getTheme();
    updateToggleButtons(currentTheme);
    bindToggleEvents();
    if (currentTheme === 'dark') {
      enforceBrightBackgroundContrast();
    }
  }

  function bindToggleEvents() {
    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      if (!btn.dataset.themeBound) {
        btn.dataset.themeBound = 'true';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          toggleTheme();
        });
      }
    });
  }

  // Listen for system theme changes if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    });
  }
})();
