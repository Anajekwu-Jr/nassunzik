// NASS UNIZIK Departmental Service Worker
// Provides offline capability, asset caching, PWA installability, and clean text-only push alerts

const CACHE_NAME = 'nass-unizik-v5';
const PRECACHE_URLS = [
  '/',
  '/website.html',
  '/app',
  '/app.html',
  '/manifest.json',
  '/css/style.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/nav.js',
  '/resources/images/nass-logo.jpg',
  '/resources/images/nass-icon-192.png',
  '/resources/images/nass-badge.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging legacy service worker cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API mutations or upload routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first for HTML pages, cache fallback
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/app.html') || caches.match('/website.html');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for images and static assets so fresh assets update immediately
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});

// Push Notification Handling:
// 1. Text only (no large logo image) so the entire message is completely readable
// 2. Uses official NASS logo icon for both icon and top status bar badge
self.addEventListener('push', (event) => {
  let data = { title: 'NASS UNIZIK Update', body: 'New departmental announcement available.', url: '/app' };
  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (_) {
      data.body = event.data.text();
    }
  }

  const origin = self.location ? self.location.origin : '';
  const iconUrl = origin + '/resources/images/nass-icon-192.png';
  const badgeUrl = origin + '/resources/images/nass-badge.png';

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    // Note: 'image' is omitted so notification shows clean text without blocking header/body
    vibrate: [200, 100, 200],
    tag: 'nass-unizik-announcement',
    renotify: true,
    data: { url: '/app' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Helper to determine if NASS mobile app is installed or running on this device
async function isNassAppInstalled(clientList) {
  // 1. If any client is open in standalone mode or on the app route
  if (Array.isArray(clientList)) {
    for (const client of clientList) {
      if (
        client.displayMode === 'standalone' ||
        (client.url && client.url.includes('/app'))
      ) {
        return true;
      }
    }
  }

  // 2. Query getInstalledRelatedApps if supported in service worker
  if ('getInstalledRelatedApps' in self.navigator) {
    try {
      const apps = await self.navigator.getInstalledRelatedApps();
      if (apps && apps.length > 0) return true;
    } catch (_) {}
  }

  // 3. Query persistent IndexedDB storage
  try {
    const isIdbInstalled = await new Promise((resolve) => {
      const req = indexedDB.open('nass_pwa_meta', 1);
      req.onerror = () => resolve(false);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      };
      req.onsuccess = (e) => {
        try {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('meta')) return resolve(false);
          const tx = db.transaction('meta', 'readonly');
          const store = tx.objectStore('meta');
          const getReq = store.get('is_installed');
          getReq.onsuccess = () => resolve(Boolean(getReq.result));
          getReq.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      };
    });
    if (isIdbInstalled) return true;
  } catch (_) {}

  return false;
}

// Notification Click Handler:
// Returns or redirects user to the NASS mobile app if installed, otherwise nowhere
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      // 1. If an existing NASS app window or tab is already open, return/focus to it
      for (const client of clientList) {
        if (client.url && client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. Check if the NASS mobile app is installed on this device
      const installed = await isNassAppInstalled(clientList);

      if (installed) {
        // App is installed: open/launch the NASS mobile app
        if (self.clients.openWindow) {
          return self.clients.openWindow('/app');
        }
      }

      // 3. Otherwise nowhere (do not redirect or open browser windows)
      return;
    })()
  );
});
