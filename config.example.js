// Пример конфигурации источников модулей

// ====================================
// ЛОКАЛЬНАЯ РАЗРАБОТКА
// ====================================
export const config = {
  source: 'local',
  sources: {
    local: './files',
    remote: 'https://your-worker.workers.dev/files'
  },
  getBaseUrl() {
    return this.sources[this.source];
  },
  getModuleUrl(packageName, version, path = '/index.js') {
    return `${this.getBaseUrl()}/${packageName}@${version}${path}`;
  }
};

// ====================================
// ПРОДАКШН С GIT-PROXY
// ====================================
// export const config = {
//   source: 'remote',
//   sources: {
//     local: './files',
//     remote: 'https://your-worker.workers.dev/files'
//   },
//   getBaseUrl() {
//     return this.sources[this.source];
//   },
//   getModuleUrl(packageName, version, path = '/index.js') {
//     return `${this.getBaseUrl()}/${packageName}@${version}${path}`;
//   }
// };

export function generateImportMap(modules) {
  const imports = {};

  for (const [alias, moduleInfo] of Object.entries(modules)) {
    const { package: pkg, version, path } = moduleInfo;
    imports[alias] = config.getModuleUrl(pkg, version, path);
  }

  return { imports };
}
