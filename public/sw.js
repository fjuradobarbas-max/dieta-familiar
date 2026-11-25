// Service worker de Dieta Contigo: guarda la app en el móvil para abrirla al
// instante. Los datos de Firebase y las llamadas a /api no pasan por aquí.
const CACHE = "dieta-v1";
const SHELL = ["/", "/manifest.json", "/icon-192.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const guardar = (req, res) => {
  if (res && res.ok && res.type !== "opaque") {
    const copia = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copia));
  }
  return res;
};

const primeroCache = async (req) => {
  const enCache = await caches.match(req);
  return enCache || fetch(req).then((r) => guardar(req, r));
};

// Páginas: red primero (para ver siempre la última versión), pero si tarda
// más de 2 s se abre la copia guardada
const primeroRed = (req) =>
  new Promise((resolve) => {
    let resuelto = false;
    const desdeCache = () =>
      caches.match("/").then((r) => {
        if (r && !resuelto) {
          resuelto = true;
          resolve(r);
        }
        return r;
      });
    const t = setTimeout(desdeCache, 2000);
    fetch(req)
      .then((r) => {
        clearTimeout(t);
        if (r.ok) guardar("/", r.clone());
        if (!resuelto) {
          resuelto = true;
          resolve(r);
        }
      })
      .catch(async () => {
        clearTimeout(t);
        const r = await desdeCache();
        if (!resuelto) {
          resuelto = true;
          resolve(r || Response.error());
        }
      });
  });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(primeroCache(req));
    return;
  }
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/")) return;
  if (req.mode === "navigate") {
    e.respondWith(primeroRed(req));
    return;
  }
  if (url.pathname.startsWith("/assets/") || /\.(png|svg|ico|json|woff2?)$/.test(url.pathname)) {
    e.respondWith(primeroCache(req));
  }
});
