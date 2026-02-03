<!-- src/views/chat.vue -->
<template>
  <div class="chat-view">
    <div class="chat-container">
      <!-- 左侧：会话列表 -->
      <aside class="chat-sidebar">
        <header class="sidebar-header">
          <h3>历史会话</h3>
          <button class="new-thread-btn" @click="startNewChat">+ 新建对话</button>
        </header>

        <section class="thread-list" aria-label="会话列表">
          <div
            v-for="thread in threads"
            :key="thread.thread_id"
            class="thread-item"
            :aria-current="currentThreadId === thread.thread_id ? 'true' : 'false'"
            @click="loadSession(thread.thread_id)">
            <div class="thread-meta">
              <div class="thread-title">{{ thread.title || '未命名对话' }}</div>
              <div class="thread-actions">
                <button class="icon-btn" @click.stop="editTitle(thread)" title="编辑标题">✏️</button>
                <button class="icon-btn" @click.stop="deleteSession(thread.thread_id)" title="删除会话">🗑️</button>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- 右侧：聊天窗口 -->
      <main class="chat-main">
        <div class="chat-header">
          <div class="chat-title">{{
            (threads.find(t => t.thread_id === currentThreadId)?.title) || '新对话'
          }}</div>
        </div>

        <section class="messages" ref="messagesContainer" aria-live="polite">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message-bubble', msg.role === 'user' ? 'is-user' : 'is-ai']">
            <div class="message-meta">
              <strong class="message-role">{{ msg.role === 'user' ? '你' : 'AI' }}</strong>
            </div>
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </section>

        <footer class="chat-input">
          <textarea
            v-model="inputText"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="输入消息..."
            :disabled="isSending"
            class="input-area"
          ></textarea>
          <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isSending">
            {{ isSending ? '发送中...' : '发送' }}
          </button>
        </footer>
      </main>
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
.chat-container { display: flex; height: calc(100vh - 80px); gap: 16px; padding: 16px; box-sizing: border-box; }
.chat-sidebar { width: 280px; background: var(--sidebar-bg, #f7f8fa); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.new-thread-btn { background: #2563eb; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.thread-list { overflow: auto; flex: 1; }
.thread-item { padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.thread-item[aria-current="true"] { background: #eef2ff; }
.thread-meta { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.thread-title { font-size: 14px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.thread-actions .icon-btn { background: transparent; border: none; cursor: pointer; margin-left: 6px; }
.chat-main { flex: 1; display: flex; flex-direction: column; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.chat-header { padding: 12px 16px; border-bottom: 1px solid #eee; background: linear-gradient(180deg,#fff,#fbfdff); }
.chat-title { font-weight: 600; color: #0f172a; }
.messages { flex: 1; padding: 16px; overflow: auto; display: flex; flex-direction: column; gap: 12px; background: linear-gradient(180deg,#ffffff,#fbfdff); }
.message-bubble { max-width: 70%; padding: 10px 12px; border-radius: 12px; line-height: 1.5; word-break: break-word; }
.message-bubble.is-ai { align-self: flex-start; background: #f3f4f6; color: #111827; }
.message-bubble.is-user { align-self: flex-end; background: #2563eb; color: #fff; }
.message-meta { font-size: 12px; margin-bottom: 6px; opacity: 0.8; }
.chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; align-items: flex-end; }
.input-area { flex: 1; min-height: 44px; max-height: 140px; resize: none; padding: 10px; border: 1px solid #e6e9ef; border-radius: 8px; font-size: 14px; }
.send-btn { background: #10b981; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }
.send-btn:disabled, .new-thread-btn:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 800px) {
  .chat-container { flex-direction: column; height: auto; }
  .chat-sidebar { width: 100%; order: 2; }
  .chat-main { order: 1; }
  .message-bubble { max-width: 100%; }
}
</style>