const CACHE_NAME = 'aaramdehi-static-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/aaramdehi-logo.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    await Promise.all(APP_SHELL.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'no-store' });
        if (response.ok && !(response.headers.get('content-type') || '').includes('text/html') || asset === '/') {
          await cache.put(asset, response);
        }
      } catch {
        // A missing optional shell asset must not block service-worker activation.
      }
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request).then((response) => {
      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html');
      if (isHtml && ['script', 'style', 'manifest'].includes(event.request.destination)) {
        return new Response('Asset not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
      }
      if (response.ok && response.type === 'basic' && !isHtml) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
