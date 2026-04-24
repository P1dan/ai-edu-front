<template>
  <div class="dashboard">
    <!-- 顶部欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-text">
        <h1>👋 下午好，同学</h1>
        <p>学号 {{ userId }} · 今天学习状态满分 ✨</p>
      </div>
      <div class="welcome-badge">
        <span>📅 {{ today }}</span>
      </div>
    </section>

    <!-- 双栏布局：推荐课程 + 最新消息 -->
    <div class="dashboard-grid">
      <!-- 左侧：原有推荐组件升级版 -->
      <div class="rec-card">
        <div class="card-header">
          <h3>⭐ 专属课程推荐</h3>
          <span class="badge">基于你的学习记录</span>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="small-spinner"></div>
          <p>正在为你生成专属推荐…</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <span style="font-size:32px;">⚠️</span>
          <p>{{ error }}</p>
          <el-button @click="fetchRecommendations" size="small">重试</el-button>
        </div>

        <!-- 推荐列表 -->
        <div v-else class="rec-list">
          <a
            v-for="(item, idx) in recommendations"
            :key="idx"
            :href="item.url"
            target="_blank"
            class="rec-item"
            :style="{ animationDelay: `${idx * 50}ms` }"
          >
            <div class="rank-badge">{{ idx + 1 }}</div>
            <div class="item-content">
              <div class="course-name">{{ item.name }}</div>
              <div class="course-url">{{ formatUrl(item.url) }}</div>
            </div>
            <el-icon class="external-icon"><Right /></el-icon>
          </a>

          <div v-if="recommendations.length === 0 && !loading" class="empty-tip">
            暂无推荐，稍后再试～
          </div>
        </div>
      </div>

      <!-- 右侧：最新消息板块 (MOCK) -->
      <div class="news-card">
        <div class="card-header">
          <h3>📢 最新消息</h3>
          <span class="badge">今日更新</span>
        </div>
        <div class="news-list">
          <div 
            v-for="(news, idx) in newsList" 
            :key="idx" 
            class="news-item"
            :style="{ animationDelay: `${idx * 30}ms` }"
          >
            <div class="news-dot"></div>
            <div class="news-content">
              <p class="news-title">{{ news.title }}</p>
              <span class="news-time">{{ news.time }}</span>
            </div>
          </div>
        </div>
        <div class="news-footer">
          <el-link type="primary" :underline="false">查看全部消息 →</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Right } from '@element-plus/icons-vue'

// 接收用户ID prop
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// 推荐相关状态
const loading = ref(true)
const error = ref(null)
const recommendations = ref([])
const API_BASE = 'http://localhost:8000'

// 模拟最新消息数据
const newsList = ref([
  {
    title: '📌 夏季学期课程补选通知，截止时间6月20日',
    time: '2小时前'
  },
  {
    title: '🎉 系统更新：个性化推荐算法升级，精准度提升30%',
    time: '昨天'
  },
  {
    title: '💡 华为云AI 线上讲座：大模型时代的学习路径',
    time: '昨天'
  },
  {
    title: '📚 图书馆新到一批计算机经典书籍，欢迎借阅',
    time: '3天前'
  }
])

// 显示当天日期
const today = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
})

// 获取推荐课程
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
      const errorData = await res.json()
      throw new Error(errorData.detail || '推荐服务异常')
    }

    const data = await res.json()
    if (!data || data.length === 0) {
      throw new Error('暂时没有相关课程推荐')
    }

    recommendations.value = data
  } catch (err) {
    error.value = err.message
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

// 缩短URL显示
const formatUrl = (url) => {
  if (!url) return ''
  return url.length > 40 ? url.substring(0, 38) + '…' : url
}

// 挂载时拉取推荐
onMounted(() => {
  fetchRecommendations()
})
</script>

<style scoped>
/* 全局重置 & 变量 */
:root {
  --primary: #4f6cff;
  --primary-light: #eef3ff;
  --primary-dark: #1a4fcc;
  --bg-page: #f5f9ff;
  --surface: #ffffff;
  --border-light: #e0eaf5;
  --text-main: #1a2c3e;
  --text-muted: #5e7180;
  --radius-card: 20px;
  --radius-element: 12px;
  --shadow-card: 0 8px 24px rgba(0, 35, 70, 0.06);
  --shadow-hover: 0 12px 28px rgba(79, 108, 255, 0.12);
  --transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dashboard {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 24px;
  background: var(--bg-page);
  min-height: 100vh;
  font-family: system-ui, 'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif;
}

/* 欢迎区域 */
.welcome-section {
  background: var(--surface);
  border-radius: var(--radius-card);
  padding: 24px 28px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  backdrop-filter: blur(2px);
}

.welcome-text h1 {
  font-size: 1.8rem;
  font-weight: 620;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #1a2c3e, #2c4c6e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.welcome-text p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.welcome-badge {
  background: var(--primary-light);
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary-dark);
}

/* 网格布局 */
.dashboard-grid {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.rec-card,
.news-card {
  background: var(--surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  flex: 1;
  min-width: 280px;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.rec-card {
  flex: 2;
  min-width: 300px;
}

.news-card {
  flex: 1.2;
  min-width: 280px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 20px 24px 12px 24px;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  gap: 12px;
}

.card-header h3 {
  font-weight: 650;
  font-size: 1.25rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  background: var(--primary-light);
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--primary-dark);
  letter-spacing: 0.3px;
}

/* 推荐列表样式（增强） */
.rec-list {
  padding: 8px 12px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-page);
  border-radius: 14px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-main);
  border: 1px solid transparent;
  transition: var(--transition);
  animation: fadeSlide 0.3s ease backwards;
}

.rec-item:hover {
  border-color: var(--primary);
  background: white;
  box-shadow: var(--shadow-hover);
  transform: translateX(4px);
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.rank-badge {
  width: 34px;
  height: 34px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  box-shadow: 0 4px 6px rgba(79, 108, 255, 0.2);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.course-name {
  font-weight: 650;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-url {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.external-icon {
  font-size: 16px;
  color: var(--text-muted);
  transition: var(--transition);
}

.rec-item:hover .external-icon {
  color: var(--primary);
  transform: translateX(2px);
}

/* 消息列表 */
.news-list {
  padding: 8px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 12px;
  background: var(--bg-page);
  border-radius: 14px;
  transition: var(--transition);
  animation: fadeSlide 0.25s ease backwards;
  cursor: default;
}

.news-item:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transform: translateX(2px);
}

.news-dot {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(79, 108, 255, 0.2);
}

.news-content {
  flex: 1;
}

.news-title {
  font-weight: 500;
  font-size: 0.88rem;
  line-height: 1.4;
  margin: 0 0 6px 0;
  color: var(--text-main);
}

.news-time {
  font-size: 0.7rem;
  color: var(--text-muted);
  display: inline-block;
}

.news-footer {
  padding: 12px 20px 20px;
  border-top: 1px solid var(--border-light);
  text-align: right;
}

.news-footer :deep(.el-link) {
  font-size: 0.8rem;
  color: var(--primary);
}

/* 加载 & 错误状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
}

.small-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 760px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dashboard-grid {
    flex-direction: column;
  }

  .rec-card,
  .news-card {
    max-width: 100%;
  }

  .rec-item {
    padding: 10px 12px;
  }
}
</style>