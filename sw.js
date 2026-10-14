/* Increment this version whenever the cached app shell changes. */
'use strict';
const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = 'kanacard-shell-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + 'v4';
const SHELL = [
 'index.html','style.css','lessons.js','portraits.js','core.js','combat-actor.js','word-effects.js','app.js','pwa.js','viewport.js','motion-preview.html','manifest.webmanifest',
 'icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'
].map(path => new URL(path, BASE).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })))));
  // Updates wait for old tabs to close; never force a reload during editing.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin) return;
  const navigation = request.mode === 'navigate' &&
    (url.pathname === BASE.pathname || url.pathname === new URL('index.html', BASE).pathname);
  // Normalize asset version queries to the coherent, versioned offline shell.
  url.search = ''; url.hash = '';
  const key = navigation ? new URL('index.html', BASE).href : url.href;
  if (!navigation && !SHELL.includes(key)) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(key);
    if (cached) return cached;
    return fetch(request);
  }));

});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});
