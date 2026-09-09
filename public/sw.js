// Ajanta Prakashan service worker.
//
// Security rule (see AGENTS spec §35/§36): admin data must NEVER be cached in
// a publicly accessible cache. Firebase/Firestore/Auth traffic goes straight
// to *.googleapis.com and is explicitly passed through untouched. Every
// request under /admin/ is also served network-only — the admin shell is
// still installable (it's in the same manifest scope) but nothing about it
// is ever written into a Cache Storage entry.

const STATIC_CACHE = "ajanta-static-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL, "/manifest.webmanifest", "/images/icon-192.png", "/images/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isFirebaseRequest(url) {
  return /googleapis\.com|gstatic\.com|firebaseio\.com|firebaseapp\.com/.test(url.hostname);
}

function isAdminRequest(url) {
  return url.pathname.startsWith("/admin");
}

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/images/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept or cache Firebase/Firestore/Auth calls or anything under /admin.
  if (isFirebaseRequest(url) || isAdminRequest(url)) {
    return; // let the browser handle it directly, network-only
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error()))
    );
    return;
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.notification?.title || "Ajanta Prakashan", {
      body: data.notification?.body,
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      data: data.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/notifications";
  event.waitUntil(self.clients.openWindow(target));
});
