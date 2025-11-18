import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Gestión de equipos',
        short_name: 'GE',
        description: 'App para gestión de equipos',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#f6f9ff',
        theme_color: '#2563eb',
        icons: [
          // Prefer PNG icons in /public/icons/*.png - SVG can be used as fallback
          { src: '/GeLogo.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ],
})
