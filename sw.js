/* Service worker do Estoque Alecrim: rede primeiro, cache como reserva.
   Garante funcionamento offline depois do primeiro acesso e pega
   atualizações automaticamente quando houver internet. */
const CACHE = 'alecrim-estoque-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(resposta => {
      const copia = resposta.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return resposta;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
