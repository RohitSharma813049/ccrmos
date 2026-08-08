self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('crmos-cache-v1').then(function (cache) {
      return cache.addAll([
        '/',
        '/dashboard',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
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
