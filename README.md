# modular

Клиентский каркас для приложений с динамической загрузкой ESM-модулей через Service Worker.

## Концепция

Приложение состоит из минимального `index.html` и Service Worker, который:
- Перехватывает запросы на импорт ESM-модулей
- Кеширует модули локально с учетом версий
- Загружает код из настроенных источников
- Обеспечивает offline-работу приложения

### Offline-first подход

**Первый визит (online):**
1. Браузер загружает `index.html`
2. Регистрируется Service Worker
3. SW прекеширует себя и основные файлы (`index.html`, `sw.js`)
4. При импорте модулей SW кеширует их с учетом версий

**Последующие визиты (offline):**
1. Браузер достает `index.html` из HTTP-кеша
2. SW активируется и отдает все файлы из кеша
3. Приложение полностью работает без сети

## Источники модулей

Переключение между источниками происходит в файле `config.js`:

```javascript
export const config = {
  source: 'local', // или 'remote' для git-proxy
  // ...
};
```

### Локальный источник (`source: 'local'`)
Модули загружаются из локальной папки `./files/`.

Структура:
```
files/
  app@1.0.0/
    index.js
  utils@2.3.1/
    index.js
```

### Удаленный источник (`source: 'remote'`)
Модули загружаются через Cloudflare Worker из GitHub репозиториев ([git-proxy](https://github.com/unel/git-proxy)).

URL формат:
```
https://your-worker.workers.dev/files/{package}@{version}/{path}
```

**Настройка:**
1. Откройте `config.js`
2. Измените `source: 'local'` на `source: 'remote'`
3. Укажите URL вашего worker в `sources.remote`
4. Обновите страницу - модули будут загружаться из GitHub

## Структура проекта

```
/
├── index.html           # Точка входа приложения
├── sw.js               # Service Worker для перехвата и кеширования модулей
├── config.js           # Конфигурация источников модулей
├── files/              # Локальные модули
│   └── app@1.0.0/
│       └── index.js
├── README.md
└── TEST.md
```

## Import Maps

Для управления версиями модулей используется Import Maps в `index.html`:

```json
{
  "imports": {
    "react": "https://worker.dev/files/react@18.2.0/index.js",
    "lodash": "https://worker.dev/files/lodash@4.17.21/index.js",
    "my-lib": "http://localhost:3000/files/my-lib@1.0.0/index.js"
  }
}
```

### Формат URL для версионирования

```
{protocol}://{host}/files/{package}@{version}/{path}
```

Примеры:
- `https://worker.dev/files/react@18.2.0/index.js`
- `http://localhost:3000/files/my-app@latest/components/Button.js`
- `https://worker.dev/files/utils@1.2.3/helpers/format.js`

Service Worker будет:
- Парсить версию из URL
- Кешировать с учетом версии
- Обеспечивать изоляцию разных версий одного модуля

## Roadmap

- [ ] Базовый Service Worker с перехватом import-запросов
- [ ] Кеширование модулей в Cache API
- [ ] Формат URL для версионирования модулей
- [ ] Парсинг и обработка версий в Service Worker
- [ ] Поддержка Import Maps
- [ ] Конфигурация источников модулей (приоритеты, fallback)
- [ ] Fallback-стратегии при недоступности источников
- [ ] Инвалидация кеша по версиям
- [ ] Dev-режим с hot reload