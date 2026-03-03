import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/plateaux-sportifs-qc/',
  server: {
    port: 5173,
    host: '0.0.0.0',  // Allow external connections (needed for Docker)
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:8000',  // Access backend from Docker
        changeOrigin: true,
      },
    },
  },
})
