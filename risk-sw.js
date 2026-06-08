/* 공정별 위험성평가 - 서비스워커 (오프라인 지원) */
var CACHE_NAME = "risk-assessment-v2";
var ASSETS = [
  "./",
  "./risk-assessment.html",
  "./risk-manifest.json",
  "./xlsx.mini.min.js",
  "./risk-icon-192.png",
  "./risk-icon-512.png",
  "./risk-favicon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request)
        .then(function (res) {
          if (res && res.status === 200 && res.type === "basic") {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, copy);
            });
          }
          return res;
        })
        .catch(function () {
          return caches.match("./risk-assessment.html");
        });
    })
  );
});
