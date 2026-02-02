<!-- src/components/FloatBall/index.vue -->
<template>
  <div
    class="float-ball"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
  >
    🎯
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'FloatBall',
  setup() {
    // 定义位置，默认在右下角
    const position = reactive({
      x: window.innerWidth - 60,
      y: window.innerHeight - 60
    })

    let isDragging = false
    let offsetX = 0
    let offsetY = 0

    const startDrag = (e) => {
      isDragging = true
      // 计算鼠标点击位置与元素左上角的偏移
      offsetX = e.clientX - position.x
      offsetY = e.clientY - position.y

      // 监听鼠标移动和松开
      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('mouseup', stopDrag)
    }

    const handleDrag = (e) => {
      if (!isDragging) return
      // 更新位置
      position.x = e.clientX - offsetX
      position.y = e.clientY - offsetY
    }

    const stopDrag = () => {
      isDragging = false
      // 简单的吸边逻辑：如果离左边或右边很近，就吸附过去
      const threshold = 50
      if (position.x < threshold) {
        position.x = 0
      } else if (position.x > window.innerWidth - threshold) {
        position.x = window.innerWidth - 40 // 假设球宽40px
      }
      // 移除监听
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', stopDrag)
    }

    // 组件挂载后，尝试从 localStorage 读取上次的位置
    onMounted(() => {
      const saved = localStorage.getItem('floatBallPos')
      if (saved) {
        const pos = JSON.parse(saved)
        position.x = pos.x
        position.y = pos.y
      }
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        // 保证球不会跑到视窗外
        if (position.x > window.innerWidth) position.x = window.innerWidth - 40
        if (position.y > window.innerHeight) position.y = window.innerHeight - 40
      })
    })

    // 组件卸载前保存位置
    // onUnmounted(() => {
    //   localStorage.setItem('floatBallPos', JSON.stringify({ x: position.x, y: position.y }))
    // })

    return {
      position,
      startDrag
    }
  }
}
</script>

<style scoped>
.float-ball {
  position: fixed;
  width: 40px;
  height: 40px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 40px;
  cursor: move;
  user-select: none; /* 禁止选中文字 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 9999; /* 必须是最高层级，否则会被其他内容盖住 */
  font-size: 20px;
  transition: box-shadow 0.2s;
}

.float-ball:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}
</style>