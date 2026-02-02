<!-- src/views/chat.vue -->
<template>
  <div class="chat-layout">
    <!-- 左侧：会话列表 -->
    <div class="sidebar">
      <h3>历史会话</h3>
      <button @click="startNewChat">+ 新建对话</button>
      <!-- 修改模板部分 -->
      <div v-for="thread in threads" :key="thread.thread_id" class="session-item"
        :class="{ active: thread.thread_id === currentThreadId }" @click="loadSession(thread.thread_id)">
        <div class="session-content">
          {{ thread.title || '未命名对话' }}
        </div>
        <div class="session-actions">
          <span @click.stop="editTitle(thread)" title="编辑标题">✏️</span>
          <span @click.stop="deleteSession(thread.thread_id)" title="删除会话">🗑️</span>
        </div>
      </div>
    </div>

    <!-- 右侧：聊天窗口 -->
    <div class="chat-main">
      <!-- 在 messages 循环中添加 class -->
      <div class="messages">
        <div v-for="msg in messages" :key="msg.id"
          :class="['message', msg.role === 'user' ? 'user-message' : 'ai-message']">
          <strong>{{ msg.role === 'user' ? '你' : 'AI' }}:</strong>
          {{ msg.content }}
        </div>
      </div>
      <div class="input-area">
        <textarea v-model="inputText" @keydown.enter.exact.prevent="sendMessage" placeholder="输入消息..."
          :disabled="isSending"></textarea>
        <button @click="sendMessage" :disabled="!inputText.trim() || isSending">
          {{ isSending ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 状态
const threads = ref([]) // 历史会话列表 [{ thread_id, title }]
const messages = ref([]) // 当前消息列表
const currentThreadId = ref(null) // null 表示新建状态
const inputText = ref('')
const userId = 'user129'
const isSending = ref(false)

const API_BASE = 'http://localhost:8000/api/'

// 获取用户所有会话
async function fetchSessions() {
  const params = new URLSearchParams({
    user_id: userId,
    page: '1',
    page_size: '20'
  })
  const res = await fetch(`${API_BASE}history_conversation/threads?${params}`)
  const data = await res.json()
  threads.value = data.threads || []
}

// 加载指定会话的历史消息
async function loadSession(threadId) {
  currentThreadId.value = threadId
  const params = new URLSearchParams({ thread_id: threadId })
  const res = await fetch(`${API_BASE}history_conversation/messages?${params}`)
  const data = await res.json()
  messages.value = data.messages || []
}

// 开始新对话
function startNewChat() {
  currentThreadId.value = null
  messages.value = []
  inputText.value = ''
}

// 编辑会话标题
async function editTitle(thread) {
  const newTitle = prompt('请输入新标题：', thread.title || '')
  if (newTitle !== null && newTitle.trim() !== '') {
    // 调用后端API更新标题
    const res = await fetch(`${API_BASE}history_conversation/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: thread.thread_id,
        title: newTitle.trim()
      })
    })

    if (res.ok) {
      // 更新本地数据
      thread.title = newTitle.trim()
    } else {
      alert('更新标题失败')
    }
  }
}

// 删除会话
async function deleteSession(threadId) {
  if (!confirm('确定删除此会话吗？')) return

  // 调用后端API删除
  const res = await fetch(`${API_BASE}history_conversation/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_id: threadId })
  })

  if (res.ok) {
    // 从本地列表中移除
    threads.value = threads.value.filter(t => t.thread_id !== threadId)

    // 如果删除的是当前会话，清空消息区域
    if (currentThreadId.value === threadId) {
      currentThreadId.value = null
      messages.value = []
    }
  } else {
    alert('删除失败')
  }
}

const scrollToBottom = () => {
  const messagesContainer = document.querySelector('.messages')
  if (messagesContainer) {
    // 等待DOM更新后再滚动
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }, 50)
  }
}

// 核心：流式发送消息（修复多轮对话 + 流式响应）
async function sendMessage() {
  if (!inputText.value.trim() || isSending.value) return

  const content = inputText.value.trim()
  inputText.value = ''
  isSending.value = true

  // 显示用户消息
  const userMsg = {
    id: `user-${Date.now()}`,
    role: 'user',
    content
  }
  messages.value.push(userMsg)

  //消息发送后滚动到底部
  scrollToBottom()
  // --- 关键：如果无 thread_id，前端生成一个 ---
  let threadId = currentThreadId.value

  if (!threadId) {
    // 生成 UUID v4（无依赖，使用浏览器 crypto API）
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    threadId = generateUUID()
    currentThreadId.value = threadId // ✅ 保存到状态

    // 可选：立即在左侧会话列表添加（提升 UX）
    const title = content.length > 30 ? content.slice(0, 30) + '...' : content
    threads.value.unshift({
      thread_id: threadId,
      title: title
    })
  }

  // --- 发起 SSE 流式请求，带上 thread_id ---
  const params = new URLSearchParams({
    user_id: userId,
    message: content,
    thread_id: threadId // ✅ 现在一定有值
  })

  const eventSource = new EventSource(`${API_BASE}chat_conversation/stream?${params}`)

  // 添加 AI 占位消息
  const aiIndex = messages.value.length
  messages.value.push({
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: ''
  })

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close()
      isSending.value = false
      return
    }

    try {
      const data = JSON.parse(event.data)
      const current = messages.value[aiIndex]
      messages.value[aiIndex] = {
        ...current,
        content: current.content + data.content
      }
    } catch (e) {
      console.error('解析失败:', e)
      const current = messages.value[aiIndex]
      messages.value[aiIndex] = {
        ...current,
        content: current.content + event.data
      }
    }
  }

  eventSource.onerror = (err) => {
    console.error('SSE 连接出错:', err)
    const current = messages.value[aiIndex]
    messages.value[aiIndex] = {
      ...current,
      content: current.content + ' [连接中断]'
    }
    eventSource.close()
    isSending.value = false
  }
}

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 左侧侧边栏样式 */
.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar h3 {
  padding: 0 24px;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 新建对话按钮 */
.sidebar button {
  margin: 0 24px 24px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.sidebar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 会话列表容器 */
.session-item {
  margin: 0 16px 8px;
  padding: 10px 12px;
  /* 减小内边距 */
  background: white;
  border-radius: 8px;
  /* 减小圆角 */
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 36px;
  /* 设置最小高度 */
}

.session-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(2px);
}

.session-item.active {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-left: 4px solid #3498db;
}

.session-content {
  flex: 1;
  font-size: 13px;
  /* 字体稍小 */
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding-right: 30px;
  /* 减小右侧留白 */
}

/* 操作按钮 */
.session-actions {
  position: absolute;
  right: 8px;
  display: none;
  gap: 6px;
}

.session-actions span {
  font-size: 12px; /* 更小的图标 */
  color: #999;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s;
}

.session-actions span:hover {
  background: #f0f0f0;
  color: #333;
}

.session-item:hover .session-actions {
  display: flex;
}

.session-actions button {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #666;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.session-actions button:hover {
  background: #e9ecef;
  color: #333;
}

/* 右侧聊天主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px 0 0 16px;
  margin: 16px 16px 16px 0;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 消息区域 */
.messages {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  max-width: 80%;
  padding: 16px 20px;
  border-radius: 18px;
  line-height: 1.5;
  position: relative;
  animation: fadeIn 0.3s ease;
  word-wrap: break-word;
}

.message strong {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 用户消息样式 */
.message.user-message {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.user-message strong {
  color: rgba(255, 255, 255, 0.9);
}

/* AI消息样式 */
.message.ai-message {
  align-self: flex-start;
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 输入区域 */
.input-area {
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.input-area textarea {
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.3s;
  background: #fafafa;
}

.input-area textarea:focus {
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-area textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-area textarea::placeholder {
  color: #999;
}

.input-area button {
  height: 48px;
  padding: 0 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.input-area button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 滚动条样式 */
.sidebar,
.messages {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.sidebar::-webkit-scrollbar,
.messages::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb,
.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>