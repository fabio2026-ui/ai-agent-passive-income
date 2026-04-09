const CACHE_NAME = 'focus-forest-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log('Cache failed:', err))
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中 - 返回缓存
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // 检查是否收到有效的响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 克隆响应
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-focus-data') {
    event.waitUntil(syncFocusData());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '专注时间到！',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'focus-timer',
    requireInteraction: true,
    actions: [
      { action: 'complete', title: '完成任务' },
      { action: 'extend', title: '延长5分钟' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification('专注森林', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'complete') {
    // 完成任务逻辑
  } else if (event.action === 'extend') {
    // 延长计时器逻辑
  }
  event.waitUntil(
    clients.openWindow('/')
  );
});

async function syncFocusData() {
  // 同步专注数据到服务器
  console.log('Syncing focus data...');
}
