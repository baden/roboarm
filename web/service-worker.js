const CACHE_NAME = 'step-viewer-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Важливо: CDN ресурси не будуть кешуватися цим service worker'ом за замовчуванням
    // через обмеження CORS. Для офлайн роботи їх потрібно або завантажити локально,
    // або використовувати складніші стратегії кешування.
    // Для простоти, цей приклад кешує тільки локальні файли.
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Відкрито кеш');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Якщо є в кеші, повертаємо з кешу
                if (response) {
                    return response;
                }
                // Інакше, робимо запит до мережі
                return fetch(event.request);
            })
    );
});

// Оновлення кешу при активації нової версії service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});