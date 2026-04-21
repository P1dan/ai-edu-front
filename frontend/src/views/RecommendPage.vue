<template>
  <div class="rec-panel">
    <div class="right-header">
      <h3>专属课程列表</h3>
      <span class="user-chip">学号 {{ userId }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="recState === 'loading'" class="loading-state">
      <div class="small-spinner"></div>
      <p>正在推荐…</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="recState === 'error'" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ recErrorMsg }}</p>
      <button @click="fetchRecommendations">重试</button>
    </div>

    <!-- 推荐列表 -->
    <div v-else-if="recState === 'done'" class="rec-list-container">
      <a
        v-for="(item, idx) in recommendations"
        :key="item.name + idx"
        :href="item.url"
        target="_blank"
        class="rec-item"
      >
        <div class="rank-num">{{ idx + 1 }}</div>
        <div class="rec-info">
          <div class="rec-name" :title="item.name">{{ item.name }}</div>
          <div class="rec-url">{{ shortUrl(item.url) }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 用户ID（可通过 props 传入）
const props = defineProps({
  userId: {
    type: String,
    default: 'D202210493'
  }
})

// 推荐状态
const recState = ref('loading') // 'loading', 'done', 'error'
const recErrorMsg = ref('')
const recommendations = ref([])

// 模拟数据（后端未启动时使用）
const mockRecommendations = [
  {
    name: '从零开始学人工智能',
    url: 'https://www.coursera.org/learn/ai-for-everyone'
  },
  {
    name: 'Python全栈开发实战',
    url: 'https://www.udemy.com/course/python-full-stack/'
  },
  {
    name: '机器学习基础',
    url: 'https://www.coursera.org/learn/machine-learning'
  },
  {
    name: '数据结构与算法',
    url: 'https://leetcode.com/explore/learn/'
  },
  {
    name: 'React前端框架精讲',
    url: 'https://react.dev/learn'
  }
]

// 辅助函数
const escapeHtml = (str) => {
  if (!str) return ''
  return String(str).replace(/[&<>]/g, c => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
    return map[c] || c
  })
}

const shortUrl = (url) => {
  if (!url) return '#'
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url.length > 35 ? url.substring(0, 33) + '…' : url
  }
}

// 获取推荐（优先使用后端，失败则使用模拟数据）
const fetchRecommendations = async () => {
  recState.value = 'loading'
  
  // 尝试连接后端
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时
    
    const res = await fetch('http://localhost:8001/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.userId }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      throw new Error('后端请求失败')
    }
    
    const data = await res.json()
    if (data && data.length > 0) {
      recommendations.value = data.map(item => ({
        name: escapeHtml(item.name || '未知课程'),
        url: escapeHtml(item.url || '#')
      }))
      recState.value = 'done'
      return
    }
    throw new Error('无推荐数据')
  } catch (error) {
    console.log('使用模拟数据:', error.message)
    // 后端未启动或请求失败，使用模拟数据
    setTimeout(() => {
      recommendations.value = mockRecommendations.map(item => ({
        name: item.name,
        url: item.url
      }))
      recState.value = 'done'
    }, 800) // 模拟加载延迟
  }
}

// 刷新推荐
const refresh = () => {
  fetchRecommendations()
}

// 组件挂载时获取推荐
onMounted(() => {
  fetchRecommendations()
})

// 暴露方法给父组件
defineExpose({
  refresh,
  fetchRecommendations
})
</script>

<style scoped>
/* 右侧面板样式 - 简洁版 */
.rec-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 260px;
  max-width: 320px;
}

.right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.right-header h3 {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  color: #1f2937;
}

.user-chip {
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 500;
}


/* 右侧列表区域 */
.rec-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;  /* 🔥 关键修复：禁止水平滚动条 */
  min-height: 280px;
  max-height: 460px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  text-decoration: none;
  color: #1f2937;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.rec-item:hover {
  border-color: #3b82f6;
  background: #fff;
  transform: translateX(2px);
}

.rank-num {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.rec-url {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: #6b7280;
}

.small-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: #6b7280;
}

.error-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.error-state button {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 6px 18px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  color: #3b82f6;
}

.error-state button:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 滚动条样式 */
.rec-list-container::-webkit-scrollbar {
  width: 4px;
}

.rec-list-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}

.rec-list-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .rec-panel {
    min-width: auto;
    max-width: none;
    padding: 16px;
  }
}
</style>