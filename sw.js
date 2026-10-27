// Service worker di PinQuattrini: precache della shell + stale-while-revalidate.
// Incrementare VERSION quando cambia l'elenco SHELL o si vuole forzare il ricaricamento.
const VERSION = 'v1';
const CACHE = 'pinquattrini-' + VERSION;

const SHELL = [
  './',
  'index.html',
  'manifest.json',
  'favicon.svg',
  'favicon-32.png',
  'apple-touch-icon.png',
  'logo-192.png',
  'logo-512.png',
  'logo-maskable-512.png',
  'logo-mono-512.png'
];

// Host serviti con stale-while-revalidate oltre alle risorse same-origin.
function cacheable(url) {
  if (url.origin === self.location.origin) return true;
  if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/10.12.2/')) return true;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return true;
  return false;
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pinquattrini-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!cacheable(url)) return; // Firestore/Auth e altro: direttamente in rete

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const opts = url.origin === self.location.origin ? { ignoreSearch: true } : undefined;
      const cached = await cache.match(req, opts);
      const network = fetch(req).then((res) => {
        // Si memorizzano risposte valide (anche opaque, es. font cross-origin senza CORS).
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
        return res;
      });
      if (cached) {
        network.catch(() => {}); // aggiorna in background
        return cached;
      }
      return network.catch(() => (req.mode === 'navigate' ? cache.match('index.html') : Response.error()));
    })
  );
});
