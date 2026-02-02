<!-- App.vue -->
<template>
  <div class="app-container">
    <LeftNavbar />
    <div class="main-content">
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
  margin-left: 80px; /* 侧边栏宽度 */
  min-height: 100vh;
}
</style>