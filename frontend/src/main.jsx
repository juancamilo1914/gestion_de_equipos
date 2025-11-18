import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register PWA service worker (vite-plugin-pwa)
// Requires installation: npm install vite-plugin-pwa --save-dev
try {
  // virtual:pwa-register is provided by vite-plugin-pwa at build time
  // using the 'auto' injectRegister option configured in vite.config.js
  // this import is safe — if the plugin is not installed it will be ignored in development
  // but the project should install the plugin to enable SW at build time.
  // eslint-disable-next-line import/no-unresolved
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        // you can show UI to inform user about the new version
        console.log('Nueva versión disponible — recarga para actualizar');
      },
      onOfflineReady() {
        console.log('Contenido en caché para uso offline');
      }
    })
  }).catch(() => {
    // plugin not installed or virtual module not available — ignore
  })
} catch (e) {
  // ignore
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
