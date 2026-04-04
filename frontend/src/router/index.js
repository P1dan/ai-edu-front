// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import index from '../views/index.vue'
import agents from '../views/agents.vue'
import login from '../views/login.vue'
import settings from '../views/settings.vue'

const routes = [
  {
    path: '/', //默认是登录页
    component: login,
    meta: { hideNavbar: true }
  },
  {
    path: '/login',
    component: login,
    meta: { hideNavbar: true }  // 注册登录页隐藏导航栏
  },
  {
    path: '/index',
    component: index,
    meta: { hideNavbar: false }
  },
  {
    path: '/agents',
    component: agents,
    meta: { hideNavbar: false }
  },
  {
    path: '/settings',
    component: settings,
    meta: { hideNavbar: false }
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router