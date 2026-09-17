// v2 — was cache-first with an unversioned cache name, so once a browser cached
// the shell once, it NEVER refetched index.html/app.js/data.js again (this file's
// own bytes never changed either, so the browser never even re-ran install() to
// notice). Every later republish silently failed to reach returning visitors —
// including this app's own self-publish-on-every-interaction flow — and a stale
// index.html paired with a newer/older app.js is exactly what can render as a
// blank page. Fixed by switching to network-first (always try the network so a
// republish is picked up immediately; fall back to the cache only when offline)
// and bumping CACHE_NAME so every existing install detects this file changed,
// updates right away (skipWaiting + clients.claim below already supported that),
// and throws away its stale cache.
var CACHE_NAME = 'meal-planner-v2';
var SHELL_FILES = [
  './index.html',
  './data.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(SHELL_FILES);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Network-first: always try to fetch the latest published files. Only fall back
// to the cached copy when the network request fails (i.e. offline), so the app
// still opens without a connection. The cache is kept fresh as a side effect of
// every successful fetch, so it's a true "last known good" fallback, not a stale
// permanent copy.
self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      return resp;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
