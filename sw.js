/* 현장 안전 순회점검 - 서비스워커 (오프라인 지원) */
var CACHE_NAME = "safety-patrol-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.png"
];

/* 설치: 핵심 파일 캐싱 */
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* 활성화: 이전 버전 캐시 정리 */
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

/* 요청 처리: 캐시 우선, 없으면 네트워크 */
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request)
        .then(function (res) {
          /* 새로 받은 동일 출처 자원은 캐시에 추가 */
          if (res && res.status === 200 && res.type === "basic") {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, copy);
            });
          }
          return res;
        })
        .catch(function () {
          /* 오프라인 상태에서 캐시에도 없으면 메인 페이지 반환 */
          return caches.match("./index.html");
        });
    })
  );
});
