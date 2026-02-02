<!-- LeftNavbar.vue -->
<template>
  <div class="left-navbar">
    <!-- 顶部logo -->
    <div class="logo-area">
      <div class="logo">AI</div>
      <div class="title">教育助手</div>
    </div>

    <!-- 三个大板块 -->
    <div class="nav-panel">
      <div 
        class="panel-item"
        :class="{ active: currentRoute === '/chat' }"
        @click="goToChat"
      >
        对话
      </div>
      <div 
        class="panel-item"
        :class="{ active: currentRoute === '/tools' }"
        @click="goToTools"
      >
        工具
      </div>
      <div 
        class="panel-item"
        :class="{ active: currentRoute === '/settings' }"
        @click="goToSettings"
      >
        设置
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="user-area">
      <div class="avatar">U</div>
      <div class="user-name">用户</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 获取当前路由用于高亮
const currentRoute = computed(() => route.path)

// 跳转方法
const goToChat = () => router.push('/chat')
const goToTools = () => router.push('/tools')
const goToSettings = () => router.push('/settings')
</script>

<style scoped>
.left-navbar {
  width: 80px;
  height: 100vh;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 40px;
  height: 40px;
  background: #3498db;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 8px;
}

.title {
  font-size: 12px;
  color: #95a5a6;
}

.nav-panel {
  flex: 1;
  width: 100%;
}

.panel-item {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  margin: 8px 0;
}

.panel-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.panel-item.active {
  background: #3498db;
  border-left: 3px solid #2980b9;
}

.user-area {
  text-align: center;
  padding: 20px 0;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #7f8c8d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}

.user-name {
  font-size: 12px;
  color: #95a5a6;
}
</style>