// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Proxy all API calls
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },

      // THIS IS THE MISSING PART — PROXY WEBSOCKETS TOO!
      '/ws': {
        target: 'http://127.0.0.1:8000',
        ws: true,                 // This enables WebSocket proxying
        changeOrigin: true,
        secure: false,
        // Optional: helps with some reconnection issues
        rewrite: (path) => path,
      },
    },
  },
})