
self.addEventListener('install',(e)=>{
  e.waitUntil(caches.open('ronin-v1').then(c=>c.addAll(['./','./index.html','./style.css','./settings.overlay.css','./app.js','./settings.overlay.js','./manifest.webmanifest','./icons/cat.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate',(e)=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',(e)=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
