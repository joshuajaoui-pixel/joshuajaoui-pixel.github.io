// sw.js — Jaouis Music Service Worker
// Keeps audio playing in background and enables lock screen controls

const CACHE = 'jaouis-music-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Fetch handler — serve from network, fall back to cache for app shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Cache the main HTML file so the app works offline
  if (url.pathname.endsWith('jaouis-music.html') || url.pathname === '/') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; })
          .catch(() => cache.match(e.request))
      )
    );
    return;
  }

  // For audio files — use network directly (streaming)
  if (e.request.destination === 'audio') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Everything else — network first
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Message handler — page can send commands to SW
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
