// Lean PWA — offline-first service worker
// Bump CACHE on every release so clients pull fresh assets.
const CACHE = 'lean-v7-2026-06-09-b';
const IMG_CACHE = 'lean-img-v1';     // exercise demonstration photos (persistent)
const LIB_CACHE = 'lean-lib-v1';     // CDN libraries: zxing, pdf.js, tesseract, fflate (persistent)
const IMG_CACHE_LIMIT = 400;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Nuke old app caches, but keep persistent image/lib caches
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k !== IMG_CACHE && k !== LIB_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Trim a cache to a max number of entries (oldest first)
async function trimCache(name, limit) {
  try {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    if (keys.length > limit) {
      await Promise.all(keys.slice(0, keys.length - limit).map(k => cache.delete(k)));
    }
  } catch (e) {}
}

// Cache-first helper for cross-origin static assets
function cacheFirst(e, cacheName, trim) {
  e.respondWith(
    caches.open(cacheName).then(cache =>
      cache.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        if (resp.ok || resp.type === 'opaque') {
          cache.put(e.request, resp.clone()).then(() => { if (trim) trimCache(cacheName, IMG_CACHE_LIMIT); }).catch(() => {});
        }
        return resp;
      }))
    )
  );
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Never intercept dynamic APIs (AI, food search) — always live network
  if (url.hostname === 'api.anthropic.com' || url.hostname.endsWith('openfoodfacts.org')) return;

  // Exercise demonstration photos → persistent cache-first (works offline after first view)
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/free-exercise-db/')) {
    return cacheFirst(e, IMG_CACHE, true);
  }

  // CDN libraries (zxing, pdf.js, tesseract, fflate) → persistent cache-first
  if (['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com'].includes(url.hostname)) {
    return cacheFirst(e, LIB_CACHE, false);
  }

  if (url.origin !== self.location.origin) return;

  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isHTML) {
    // Network-first for HTML so updates are picked up immediately
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
  } else {
    // Cache-first for static same-origin assets (icons, manifest)
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }))
    );
  }
});
