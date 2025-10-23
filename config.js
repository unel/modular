// Конфигурация источников модулей
export const config = {
  // Источник модулей: 'local' или 'remote'
  source: 'local', // измените на 'remote' для использования git-proxy

  // Префиксы для разных источников
  sources: {
    local: './files',
    remote: 'https://your-worker.workers.dev/files'
  },

  // Получить базовый URL для текущего источника
  getBaseUrl() {
    return this.sources[this.source];
  },

  // Сформировать URL модуля
  getModuleUrl(packageName, version, path = '/index.js') {
    return `${this.getBaseUrl()}/${packageName}@${version}${path}`;
  }
};

// Генерация Import Map на основе конфига
export function generateImportMap(modules) {
  const imports = {};

  for (const [alias, moduleInfo] of Object.entries(modules)) {
    const { package: pkg, version, path } = moduleInfo;
    imports[alias] = config.getModuleUrl(pkg, version, path);
  }

  return { imports };
}
