// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,       // ← 改成你想要的端口，比如 3000、8080 等
    open: true        // 可选：启动后自动打开浏览器
  }
})