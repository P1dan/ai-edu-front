// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 👈 指向你的后端
        changeOrigin: true,
        // rewrite: (path) => path, // 默认不需要改
      }
    }
  }
})