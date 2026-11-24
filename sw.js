// Service worker: приложение открывается мгновенно из сохранённой копии,
// а свежая версия с GitHub тихо скачивается в фоне и показывается при следующем открытии.
const CACHE = "sport-v27";
const FILES = ["./", "index.html", "style.css", "app.js", "data.js", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === "navigate" ? "index.html" : req;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(req, { cache: "no-cache" })
          .then(res => {
            if (res.ok) cache.put(key, res.clone());
            return res;
          })
          .catch(() => cached);
        if (cached) {
          e.waitUntil(fresh);   // обновляем копию в фоне
          return cached;         // а показываем сразу сохранённую
        }
        return fresh;
      })
    )
  );
});
