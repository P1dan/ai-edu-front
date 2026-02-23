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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;  /* 禁止外层滚动 */
}

/* 如果某个页面需要滚动，单独设置 */
.scrollable-page {
  height: 100%;
  overflow-y: auto;
}
</style>