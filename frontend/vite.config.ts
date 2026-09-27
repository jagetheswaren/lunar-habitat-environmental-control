import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES ? '/lunar-habitat-environmental-control/' : '/'),
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/actuator': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          lucide: ['lucide-react'],
        }
      }
    }
  }
})
