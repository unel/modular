export function init() {
  console.log('[App] Initializing...');

  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = `
      <h1>Hello World!</h1>
      <p>App module v1.0.0 loaded successfully</p>
      <p>Current time: ${new Date().toLocaleTimeString()}</p>
    `;
    console.log('[App] Hello World rendered!');
  } else {
    console.error('[App] Element #app not found');
  }
}

export function getVersion() {
  return '1.0.0';
}

console.log('[App] Module loaded, version:', getVersion());
