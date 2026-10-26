import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Persist PWA install state for notification routing
function recordAppInstallation() {
  try {
    const req = indexedDB.open('nass_pwa_meta', 1);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    req.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('meta', 'readwrite');
      tx.objectStore('meta').put(true, 'is_installed');
    };
  } catch (_) {}
}

// Register Service Worker for PWA installability & offline caching
if (typeof window !== 'undefined') {
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  ) {
    recordAppInstallation();
  }
  window.addEventListener('appinstalled', () => {
    recordAppInstallation();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.info('Service Worker registration note:', err);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
