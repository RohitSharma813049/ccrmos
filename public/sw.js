const CACHE_NAME = 'crmos-cache-v2';
const API_CACHE = 'crmos-api-cache';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        '/',
        '/dashboard',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  // API Requests: Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: Cache First, fallback to network
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
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
