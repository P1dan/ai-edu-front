// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import chat from '../views/chat.vue'


// 表示访问这个接口的时候要访问哪个组件/页面
const routes = [
  { path: '/', component: chat }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router