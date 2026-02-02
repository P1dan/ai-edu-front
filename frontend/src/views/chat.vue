<!-- src/views/chat.vue -->
<template>
  <div class="chat-layout">
    <!-- 左侧：会话列表 -->
    <div class="sidebar">
      <h3>历史会话</h3>
      <button @click="startNewChat">+ 新建对话</button>
      <div
        v-for="thread in threads"
        :key="thread.thread_id"
        class="session-item"
        :class="{ active: thread.thread_id === currentThreadId }"
        @click="loadSession(thread.thread_id)"
      >
        {{ thread.title || '未命名对话' }}
      </div>
    </div>

    <!-- 右侧：聊天窗口 -->
    <div class="chat-main">
      <div class="messages">
        <div v-for="msg in messages" :key="msg.id" class="message">
          <strong>{{ msg.role === 'user' ? '你' : 'AI' }}:</strong>
          {{ msg.content }}
        </div>
      </div>
      <div class="input-area">
        <textarea
          v-model="inputText"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="输入消息..."
          :disabled="isSending"
        ></textarea>
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

// ✅ 核心：流式发送消息（修复多轮对话 + 流式响应）
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

  // --- 关键：如果无 thread_id，前端生成一个 ---
  let threadId = currentThreadId.value

  if (!threadId) {
    // 生成 UUID v4（无依赖，使用浏览器 crypto API）
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
  height: calc(100vh - 60px);
}
.sidebar {
  width: 250px;
  border-right: 1px solid #eee;
  padding: 16px;
  overflow-y: auto;
}
.sidebar h3 {
  margin-top: 0;
}
.session-item {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
}
.session-item:hover {
  background: #f5f5f5;
}
.session-item.active {
  background: #e6f7ff;
  font-weight: bold;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.message {
  margin-bottom: 12px;
  line-height: 1.5;
}
.input-area {
  display: flex;
  padding: 16px;
  border-top: 1px solid #eee;
}
.input-area textarea {
  flex: 1;
  height: 40px;
  padding: 8px;
  resize: none;
}
.input-area button {
  margin-left: 8px;
  padding: 8px 16px;
}
</style>