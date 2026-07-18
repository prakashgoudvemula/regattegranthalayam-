// Regatte Granthalayam — service worker
// Basic offline support: caches the shell so the site can open even with a weak connection.
// This does NOT cache PDFs or storage data — only the app shell itself.

const CACHE_NAME = "regatte-granthalayam-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first for navigation (so updates are picked up quickly),
// falling back to the cached shell if there's no connection.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first for the shell's own static assets (icons, manifest).
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
