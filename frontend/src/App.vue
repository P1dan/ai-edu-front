<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 所有的页面内容会在这里渲染 -->
    <router-view />
    <!-- 全局悬浮球组件 -->
    <!-- <FloatBall /> -->
  </div>
</template>

<script>
import FloatBall from './components/FloatBall/index.vue'

export default {
  name: 'App',
  components: {
    FloatBall
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>