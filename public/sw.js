const CACHE_NAME = 'crmos-cache-v3';
const API_CACHE = 'crmos-api-cache-v3';

self.addEventListener('install', function (event) {
  // Force new service worker to install immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        '/',
        '/dashboard',
        '/manifest.json'
      ]).catch((err) => console.warn('Failed to pre-cache some assets:', err));
    })
  );
});

self.addEventListener('activate', function (event) {
  // Claim clients immediately and clear old caches
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function (event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip chrome-extension requests or other non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Network First strategy for everything to ensure fresh Next.js chunks
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache successful network responses
        const responseClone = response.clone();
        const cacheToUse = url.pathname.startsWith('/api/') ? API_CACHE : CACHE_NAME;
        
        caches.open(cacheToUse).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline)
        return caches.match(event.request);
      })
  );
});

self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const title = data.title || "New Activity";
  const options = {
    body: data.body || "You have a new update in CRM OS.",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url || '/dashboard'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        // If so, just focus it.
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
