// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import chat from '../views/chat.vue'
import login from '../views/login.vue'

const routes = [
  { 
    path: '/', 
    component: login,
    meta: { hideNavbar: true }  // 注册登录页隐藏导航栏
  },
  { 
    path: '/chat', 
    component: chat,
    meta: { hideNavbar: false }  // 聊天页显示导航栏（可以省略，因为默认就是false）
  },
  // 其他

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router