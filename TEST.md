# Тестирование

## Как запустить

1. Запустите локальный HTTP-сервер (например, используя расширение Live Server для VS Code)
2. Откройте `index.html` в браузере
3. Откройте DevTools (F12) и проверьте консоль

## Переключение источников модулей

### Локальный режим (по умолчанию)
В `config.js`:
```javascript
source: 'local'
```

### Удаленный режим (git-proxy)
1. Откройте `config.js`
2. Измените:
```javascript
source: 'remote',
sources: {
  local: './files',
  remote: 'https://your-actual-worker.workers.dev/files'
}
```
3. Убедитесь что в вашем git-proxy репозитории есть папка `files/app@1.0.0/index.js`
4. Обновите страницу (Ctrl+Shift+R)

## Что должно произойти

### В консоли:
```
Service Worker registered: http://localhost:5500/
[SW] Installing...
[SW] Precaching assets: ["/", "/index.html", "/sw.js"]
[SW] Activating...
[App] Module loaded, version: 1.0.0
[Main] Starting app...
[Main] App version: 1.0.0
[App] Initializing...
[App] Hello World rendered!
[SW] Module request: app@1.0.0/index.js
[SW] Fetching: app@1.0.0/index.js
[SW] Caching: app@1.0.0/index.js
```

### На странице:
```
Hello World!
App module v1.0.0 loaded successfully
Current time: [текущее время]
```

## Проверка offline-работы

1. Обновите страницу (Ctrl+R) - модуль должен загрузиться из кеша
2. В консоли должно появиться: `[SW] Serving from cache: app@1.0.0/index.js`
3. В DevTools → Application → Service Workers - проверьте что SW активен
4. В DevTools → Application → Cache Storage - проверьте кеш модулей
5. Выключите сервер и обновите страницу - все должно работать offline!
