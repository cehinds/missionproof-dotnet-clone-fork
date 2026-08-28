const CACHE_NAME = "missionproof-static-v2";
const SCOPE_URL = new URL(self.registration.scope);
const scopedPath = relativePath => new URL(relativePath, SCOPE_URL).pathname;
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/missionproof-app-icon.svg"].map(scopedPath);
const INDEX_PATH = scopedPath("./index.html");
const SCOPED_API_PATH = scopedPath("./api/");

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function offlineProblem() {
  return new Response(JSON.stringify({
    type: "about:blank",
    title: "MissionProof is offline",
    status: 503,
    code: "offline",
    detail: "Reconnect before reading or changing confirmed information.",
  }), {
    status: 503,
    headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store" },
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith(SCOPED_API_PATH)) {
    event.respondWith(fetch(request).catch(offlineProblem));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (!response.ok) return (await caches.match(INDEX_PATH)) || response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(INDEX_PATH, copy));
          return response;
        })
        .catch(async () => (await caches.match(INDEX_PATH)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    }),
  );
});
