// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import chat from '../views/chat.vue'

// 表示访问这个接口的时候要访问哪个组件/页面
// router/index.js
const routes = [
  { path: '/', redirect: '/chat' },  // 默认跳转到对话页
  { path: '/chat', component: chat },  // 你的chat.vue
  // { path: '/tools', component: ToolsPage },  // 需要创建
  // { path: '/settings', component: SettingsPage }  // 需要创建
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router