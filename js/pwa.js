/**
 * PWA functionality completely removed.
 * Unregisters any previously active service workers and clears application caches.
 */
(function () {
  'use strict';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then(function (names) {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
  try {
    localStorage.removeItem('nass_app_installed');
    localStorage.removeItem('nass_pwa_dismissed');
    sessionStorage.removeItem('nass_pwa_dismissed');
  } catch (e) {}
})();
