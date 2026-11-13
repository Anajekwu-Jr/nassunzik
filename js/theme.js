/**
 * NASS Departmental Portal - Website Light Mode Enforcer
 * The website is permanently locked to Light Mode.
 * Theme toggling (Light <-> Dark) is available exclusively inside the NASS Mobile App.
 */
(function () {
  const STORAGE_KEY = 'nass_portal_theme';

  function enforceLightMode() {
    const root = document.documentElement;
    if (root) {
      root.removeAttribute('data-theme');
      root.classList.remove('dark-mode');
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  // Enforce immediately before first paint to prevent dark flash
  enforceLightMode();

  // Keep NassTheme safe no-op locked to light mode for any legacy callers
  window.NassTheme = {
    getTheme: () => 'light',
    setTheme: () => enforceLightMode(),
    toggle: () => enforceLightMode(),
    update: () => enforceLightMode()
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceLightMode);
  } else {
    enforceLightMode();
  }
})();
