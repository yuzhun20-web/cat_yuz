
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('csv-ro-v3k-theme2').then(c => c.addAll([
    './','./index.html','./style.css','./app.js','./manifest.webmanifest','./ronin.overrides.css'
  ])));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== 'csv-ro-v3k-theme2').map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
