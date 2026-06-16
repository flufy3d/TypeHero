/* 打字英雄 Service Worker —— 预缓存全部资源，离线可用（cache-first）。
   每次发布如改了文件，把 CACHE 版本号 +1 即可让旧缓存失效。 */
const CACHE = 'typehero-v4';

// 注意：URL 相对于本文件所在目录（仓库根），在 /TypeHero/ 子路径下也能正确解析。
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './assets/icons/icon.svg',
  './js/app.js',
  './js/data/lessons.js',
  './js/state/store.js',
  './js/engine/typing.js',
  './js/engine/keyboard.js',
  './js/ui/screens.js',
  './js/ui/effects.js',
  './js/gamify/achievements.js'
];

// 安装：把所有资源放进缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 激活：清掉旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 取数据：导航请求回退到 index.html；其余 cache-first，缓存未命中再走网络并顺手缓存
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // 仅缓存同源、成功的响应
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
