<!-- App.vue -->
<template>
  <div class="app-container">
    <!-- 使用路由元信息控制显示 -->
    <LeftNavbar v-if="!$route.meta.hideNavbar" />
    <div class="main-content" :class="{ 'full-width': $route.meta.hideNavbar }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import LeftNavbar from './components/leftnavbar.vue'
</script>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.main-content:not(.full-width) {
  margin-left: 80px; /* 侧边栏宽度 */
}

.main-content.full-width {
  margin-left: 0;
}
</style>