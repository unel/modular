const CACHE_VERSION = 2; // Увеличивайте при изменении index.html или sw.js
const CACHE_NAME = `modular-cache-v${CACHE_VERSION}`;
const MODULE_CACHE_PREFIX = 'module-';

// Файлы, которые нужно закешировать при установке SW (для offline работы)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/sw.js',
  '/config.js'
];

// Парсинг версии из URL вида: /files/{package}@{version}/{path} или ./files/{package}@{version}/{path}
export function parseModuleUrl(url) {
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(/\/files\/([^@\/]+)(?:@([^\/]+))?(\/.*)?$/);

  if (!pathMatch) {
    return null;
  }

  const [, packageName, version = 'latest', path = ''] = pathMatch;

  return {
    packageName,
    version,
    path,
    fullPath: `${packageName}@${version}${path}`,
    cacheKey: `${MODULE_CACHE_PREFIX}${packageName}@${version}`
  };
}

// Обработка запроса модуля с кешированием
export async function handleModuleRequest(request, moduleInfo) {
  const cacheName = moduleInfo.cacheKey;

  // Пытаемся получить из кеша
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Serving from cache:', moduleInfo.fullPath);
    return cachedResponse;
  }

  // Если нет в кеше, загружаем
  console.log('[SW] Fetching:', moduleInfo.fullPath);

  try {
    const response = await fetch(request);

    // Кешируем только успешные ответы
    if (response.ok) {
      console.log('[SW] Caching:', moduleInfo.fullPath);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', moduleInfo.fullPath, error);

    // Возвращаем ошибку
    return new Response(
      `Failed to load module: ${moduleInfo.fullPath}\n${error.message}`,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      }
    );
  }
}

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  // Прекешируем основные файлы для offline работы
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets:', PRECACHE_ASSETS);
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          // Удаляем все старые кеши (и модульные, и основной)
          .filter((name) => {
            return name.startsWith('modular-cache-') || name.startsWith(MODULE_CACHE_PREFIX);
          })
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Перехват fetch-запросов
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Проверяем, является ли это запросом к модулю
  const moduleInfo = parseModuleUrl(url);

  if (moduleInfo) {
    // Запрос к модулю - обрабатываем с версионированием
    console.log('[SW] Module request:', moduleInfo.fullPath);
    event.respondWith(handleModuleRequest(event.request, moduleInfo));
    return;
  }

  // Для всех остальных запросов - стратегия "Cache First" (для offline)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Если нет в кеше - загружаем из сети и кешируем
      return fetch(event.request).then((response) => {
        // Кешируем только GET-запросы с успешными ответами
        if (event.request.method === 'GET' && response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
