<template>
  <div class="rec-right">
    <div class="right-header">
      <h3>⭐ 专属课程列表</h3>
      <span class="user-chip">{{ `学号 ${userId}` }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="small-spinner"></div>
      <p>正在推荐…</p>
      <p style="font-size:0.8rem; margin-top:8px;"></p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <span style="font-size:32px; margin-bottom:8px;">⚠️</span>
      <p>{{ error }}</p>
      <el-button @click="fetchRecommendations">重试</el-button>
    </div>

    <!-- 推荐列表容器 -->
    <div v-else class="rec-list-container">
      <a
        v-for="(item, idx) in recommendations"
        :key="idx"
        :href="item.url"
        target="_blank"
        class="rec-item"
        :style="{ animationDelay: `${idx * 40}ms` }"
      >
        <div class="rank-num">{{ idx + 1 }}</div>
        <div class="rec-info">
          <div class="rec-name" :title="item.name">{{ item.name }}</div>
          <div class="rec-url">{{ getShortUrl(item.url) }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const recommendations = ref([])
const API_BASE = 'http://localhost:8000'

const fetchRecommendations = async () => {
  loading.value = true
  error.value = null
  recommendations.value = []

  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: props.userId || 'U202242760' })
    })

    if (!res.ok) {
      const e = await res.json()
      throw new Error(e.detail || '推荐服务异常')
    }

    const data = await res.json()
    if (!data || data.length === 0) {
      throw new Error('暂无推荐课程')
    }

    recommendations.value = data
  } catch (e) {
    error.value = e.message
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

const getShortUrl = (url) => {
  return url.length > 35 ? url.substring(0, 33) + '…' : url
}

onMounted(() => {
  fetchRecommendations()
})
</script>

<style scoped>
:root {
  --primary: #4f6cff;
  --primary-light: #eef3ff;
  --primary-dark: #1a4fcc;
  --bg-page: #f5f9ff;
  --surface: #ffffff;
  --border-light: #e0eaf5;
  --text-main: #1a2c3e;
  --text-muted: #5e7180;
  --radius-card: 16px;
  --radius-element: 10px;
  --shadow-card: 0 8px 24px rgba(0, 35, 70, 0.08);
  --shadow-hover: 0 12px 28px rgba(79, 108, 255, 0.12);
  --transition: all 0.2s ease;
}

.rec-right {
  flex: 1;
  min-width: 280px;
  max-width: 340px;
  background: var(--surface);
  border-radius: var(--radius-card);
  padding: 24px 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.right-header h3 {
  font-weight: 650;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-chip {
  background: var(--primary-light);
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.8rem;
  color: var(--primary-dark);
}

.rec-list-container {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-page);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  text-decoration: none;
  color: var(--text-main);
  border: 1px solid transparent;
  transition: var(--transition);
  animation: fadeSlide 0.25s;
}

.rec-item:hover {
  border-color: var(--primary);
  background: white;
  box-shadow: var(--shadow-hover);
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.rank-num {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-name {
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-url {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.small-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state :deep(.el-button) {
  margin-top: 16px;
  border-radius: 40px;
}

@media (max-width: 900px) {
  .rec-right {
    max-width: 100%;
  }
}
</style>