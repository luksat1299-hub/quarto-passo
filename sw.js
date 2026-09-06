/* Service worker: guarda o app para funcionar sem internet.
   Não toca nos dados do inventário — esses ficam no localStorage. */
const CACHE = "quarto-passo-v1";
const ARQUIVOS = ["./", "./index.html", "./manifest.json",
                  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache primeiro: abre instantâneo e funciona offline.
   Em segundo plano, busca versão nova para a próxima abertura. */
self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request).then(resp => {
      const rede = fetch(ev.request).then(r => {
        if (r && r.status === 200 && r.type === "basic") {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copia));
        }
        return r;
      }).catch(() => resp);
      return resp || rede;
    })
  );
});
