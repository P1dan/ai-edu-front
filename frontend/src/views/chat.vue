<!-- src/views/chat.vue -->
<template>
  <div class="chat-view">
    <div class="chat-container">
      <!-- 左侧：会话列表 -->
      <aside class="chat-sidebar">
        <!-- 模板快捷入口（常驻） -->
        <section class="template-section" aria-label="快捷模板">
          <h4>快速开始</h4>
          <div class="template-buttons">
            <button class="template-btn" @click="startTemplate('ppt')">PPT 制作</button>
            <button class="template-btn" @click="startTemplate('study_plan')">学习规划</button>
            <button class="template-btn" @click="startTemplate('homework')">习题生成</button>
            <button class="template-btn" @click="startTemplate('website')">网站分析</button>
            <button class="template-btn" @click="startTemplate('document')">文档整理</button>
            <button class="template-btn" @click="startTemplate('code')">代码生成</button>
          </div>
        </section>

        <!-- 历史会话 -->
        <header class="sidebar-header">
          <h3>历史会话</h3>
          <!-- 可选：保留一个“新建空白对话”按钮 -->
          <button class="new-chat-btn" @click="startNewChat">+ 新建对话</button>
        </header>

        <section class="thread-list" aria-label="会话列表">
          <div v-for="thread in threads" :key="thread.thread_id" class="thread-item"
            :aria-current="currentThreadId === thread.thread_id ? 'true' : 'false'"
            @click="loadSession(thread.thread_id)">
            <div class="thread-meta">
              <div class="thread-title">{{ thread.title || '未命名对话' }}</div>
              <div class="thread-actions">
                <!-- 三个点按钮 -->
                <button class="icon-btn more-options-btn" @click.stop="toggleMenu(thread.thread_id)" title="更多操作">
                  ⋮
                </button>

                <!-- 下拉菜单（仅当该 thread 的菜单打开时显示） -->
                <div v-if="openMenuId === thread.thread_id" class="dropdown-menu" @click.stop>
                  <button class="dropdown-item" @click="handleEdit(thread)">
                    编辑标题
                  </button>
                  <button class="dropdown-item delete-item" @click="handleDelete(thread.thread_id)">
                    删除会话
                  </button>
                </div>
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
        <!-- 欢迎提示面板（仅在无消息时显示） -->
        <div v-if="messages.length === 0" class="welcome-panel">
          <div class="welcome-content">
            <h3>{{ welcomeMessage }}</h3>
          </div>
        </div>

        <!-- 消息区域（正常滚动） -->
        <section v-else class="messages" ref="messagesContainer" aria-live="polite">
          <div v-for="msg in messages" :key="msg.id"
            :class="['message-bubble', msg.role === 'user' ? 'is-user' : 'is-ai']">
            <div v-if="msg.role === 'user'" class="message-content">{{ msg.content }}</div>
            <div v-else class="message-content" v-html="msg.html"></div>
          </div>
        </section>

        <footer class="chat-input">
          <textarea v-model="inputText" @keydown.enter.exact.prevent="sendMessage" placeholder="输入消息..."
            :disabled="isSending" class="input-area"></textarea>
          <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isSending">
            {{ isSending ? '发送中...' : '发送' }}
          </button>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import request from '../utils/request'
// 状态
const threads = ref([])
const messages = ref([])
const currentThreadId = ref(null)
const openMenuId = ref(null) // 当前打开菜单的 thread_id
const inputText = ref('')
const isSending = ref(false)
const agentName = ref('rag_agent') // agent的名字，作为聊天的参数，先默认用这个测试
const templateType = ref(null) // 可选值: 'ppt', 'study_plan', 'homework', 'website', 'document', 'code'


const welcomeMessage = ref('你好！我能帮你做什么？\n例如：帮我写一份周报、解释量子计算、生成 Python 爬虫代码...');



// 在 script setup 中
function startTemplate(type) {
  // 清空当前状态
  currentThreadId.value = null;
  messages.value = [];
  inputText.value = '';

  // 设置模板类型（用于显示中间提示）
  templateType.value = type;

  // 根据模板类型设置欢迎信息
  switch (type) {
    case 'ppt':
      welcomeMessage.value = '输入PPT主题帮你生成大纲，包含标题页、目录、正文和总结。';
      agentName.value = 'ppt_agent'
      break;
    case 'study_plan':
      welcomeMessage.value = '请输入学习计划的时间长度和目标技能或知识领域。';
      agentName.value = 'plan_agent'
      break;
    case 'homework':
      welcomeMessage.value = '请输入相关知识点，我将为你生成5道练习题及其答案解析。';
      agentName.value = 'homework_agent'
      break;
    case 'website':
      welcomeMessage.value = '请提供网站链接或描述，我将帮助你分析其设计思路。';
      agentName.value = 'website_agent'
      break;
    case 'document':
      welcomeMessage.value = '请提供需要整理成文档的文字内容。';
      agentName.value = 'document_agent'
      break;
    case 'code':
      welcomeMessage.value = '请输入你想要实现的功能描述，我将用Python编写相应的代码并加上注释。';
      agentName.value = 'code_agent'
      break;
    default:
      welcomeMessage.value = '你好！我能帮你做什么？\n例如：帮我写一份周报、解释量子计算、生成 Python 爬虫代码...';
      agentName.value = 'rag_agent'
  }

  // 自动聚焦输入框（可选）
  nextTick(() => {
    document.querySelector('.input-area')?.focus();
  });
}

const API_BASE = 'http://localhost:8000/api/'

// ========== 初始化 marked + highlight.js ==========
if (typeof DOMPurify === 'undefined' || typeof marked === 'undefined' || typeof hljs === 'undefined') {
  console.error('请确保在 index.html 中引入 DOMPurify、marked 和 highlight.js')
}

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-',
  breaks: true
})

function renderMarkdown(md) {
  const dirtyHtml = marked.parse(md || '')
  return DOMPurify.sanitize(dirtyHtml)
}

// ========== 会话管理 ==========
async function fetchSessions() {
  try {
    const res = await request.get('/history_conversation/threads', {
      params: { page: '1', page_size: '20' }
    })
    threads.value = res.threads || []
  } catch (error) {
    console.error('获取会话失败:', error)
  }
}

async function loadSession(threadId) {
  currentThreadId.value = threadId
  try {
    const res = await request.get('/history_conversation/messages', {
      params: { thread_id: threadId }
    })
    messages.value = (res?.messages || []).map(msg => ({
      ...msg,
      html: msg.role === 'assistant' ? renderMarkdown(msg.content) : ''
    }))
    nextTick(() => {
      scrollToBottom()
      hljs.highlightAll()
    })

  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

function startNewChat() {
  currentThreadId.value = null
  messages.value = []
  inputText.value = ''
  templateType.value = null
  welcomeMessage.value = '你好！我能帮你做什么？\n例如：帮我写一份周报、解释量子计算、生成 Python 爬虫代码...'
}



// ========== 其他逻辑 ==========

// 切换菜单显隐
function toggleMenu(threadId) {
  // 如果当前点击的是已打开的菜单，则关闭；否则打开
  openMenuId.value = openMenuId.value === threadId ? null : threadId
}

// 处理编辑（可复用原逻辑）
function handleEdit(thread) {
  openMenuId.value = null
  const newTitle = prompt('请输入新标题：', thread.title || '')
  if (newTitle !== null && newTitle.trim() !== '') {
    request.post('/history_conversation/edit', {
      thread_id: thread.thread_id,
      title: newTitle.trim()
    }).then(() => {
      thread.title = newTitle.trim()
    }).catch(console.error)
  }
}

// 处理删除（可复用原逻辑）
function handleDelete(threadId) {
  openMenuId.value = null
  if (!confirm('确定删除此会话吗？')) return
  request.post('/history_conversation/delete', {
    thread_id: threadId
  }).then(() => {
    threads.value = threads.value.filter(t => t.thread_id !== threadId)
    if (currentThreadId.value === threadId) {
      currentThreadId.value = null
      messages.value = []
    }
  }).catch(console.error)
}

function scrollToBottom() {
  const container = document.querySelector('.messages')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

async function sendMessage() {
  if (!inputText.value.trim() || isSending.value) return

  const content = inputText.value.trim()
  inputText.value = ''
  isSending.value = true

  messages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    content
  })
  nextTick(() => scrollToBottom())

  let threadId = currentThreadId.value
  if (!threadId) {
    // 若没有线程ID就由前端生成一个
    const generateUUID = () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    threadId = generateUUID()
    currentThreadId.value = threadId
    const title = content.length > 30 ? content.slice(0, 30) + '...' : content
    threads.value.unshift({ thread_id: threadId, title })
  }

  const aiMsg = {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: '',
    html: ''
  }
  messages.value.push(aiMsg)
  const aiIndex = messages.value.length - 1
  const token = localStorage.getItem('access_token')
  // sse比较特殊，用query的方式传递jwt参数
  const params = new URLSearchParams({ message: content, thread_id: threadId, agent_name: agentName.value, token: token })
  const eventSource = new EventSource(`${API_BASE}chat_conversation/stream?${params}`)

  eventSource.onmessage = async (event) => {
    if (event.data === '[DONE]') {
      eventSource.close()
      isSending.value = false
      // 最后再高亮一次（确保完整）
      await nextTick()
      hljs.highlightAll()
      return
    }

    try {
      const data = JSON.parse(event.data)
      const currentMsg = messages.value[aiIndex]
      const newContent = currentMsg.content + data.content
      const updatedMsg = {
        ...currentMsg,
        content: newContent,
        html: renderMarkdown(newContent)
      }
      messages.value[aiIndex] = updatedMsg

      // 关键：等 DOM 更新后高亮
      await nextTick()
      hljs.highlightAll()
    } catch (e) {
      console.error('解析失败:', e)
      // 同样处理错误 fallback
      const currentMsg = messages.value[aiIndex]
      const newContent = currentMsg.content + event.data
      const updatedMsg = {
        ...currentMsg,
        content: newContent,
        html: renderMarkdown(newContent)
      }
      messages.value[aiIndex] = updatedMsg

      await nextTick()
      hljs.highlightAll()
    }

    scrollToBottom()
  }

  eventSource.onerror = (err) => {
    console.error('SSE 连接出错:', err)
    aiMsg.content += ' [连接中断]'
    aiMsg.html = renderMarkdown(aiMsg.content)
    eventSource.close()
    isSending.value = false
    nextTick(() => scrollToBottom())
  }
}

onMounted(() => {
  fetchSessions()

  // 点击外部关闭菜单
  const handleClickOutside = () => {
    openMenuId.value = null
  }

  document.addEventListener('click', handleClickOutside)

  // 组件卸载时移除监听
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

/* ========== 侧边栏 ========== */
.chat-sidebar {
  width: 260px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.template-section h4 {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.template-buttons {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.template-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.template-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.new-chat-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.new-chat-btn:hover {
  background: #2563eb;
}

.thread-list {
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

/* 滚动条美化（仅 WebKit） */
.thread-list::-webkit-scrollbar {
  width: 6px;
}

.thread-list::-webkit-scrollbar-track {
  background: transparent;
}

.thread-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.thread-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.thread-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.15s;
  position: relative;
}

.thread-item:hover {
  background: #f1f5f9;
}

.thread-item[aria-current='true'] {
  background: #dbeafe;
  color: #1d4ed8;
}

.thread-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.thread-title {
  font-size: 14px;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.thread-actions .icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
  font-size: 14px;
}

.thread-item:hover .icon-btn {
  opacity: 1;
}

/* ========== 主聊天区 ========== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chat-header {
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.chat-title {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  line-height: 1.4;
}

/* ========== 消息区域 ========== */
.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f9fafb;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 3px;
}

.message-bubble {
  max-width: 75%;
  padding: 14px 18px;
  border-radius: 16px;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.message-bubble.is-ai {
  align-self: flex-start;
  background: #ffffff;
  color: #1e293b;
  border-bottom-left-radius: 8px;
  border-top-right-radius: 8px;
}

.message-bubble.is-user {
  align-self: flex-end;
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 8px;
  border-top-left-radius: 8px;
}


.message-content {
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}


/* ========== 输入区 ========== */
.chat-input {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.input-area {
  flex: 1;
  min-height: 48px;
  max-height: 140px;
  resize: none;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.input-area:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.send-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  min-width: 80px;
  transition: background 0.2s, opacity 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0da271;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 欢迎面板 ========== */
.welcome-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #fafafa;
}

.welcome-content {
  text-align: center;
  max-width: 560px;
  color: #64748b;
}

.welcome-content h3 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 20px;
  line-height: 1.4;
  white-space: pre-wrap;
}

/* 三个点按钮 */
.more-options-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 2px;
}

.thread-item:hover .more-options-btn {
  opacity: 1;
  background: #e2e8f0;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  right: 12px;
  /* 距离右侧边距，根据你的布局调整 */
  top: 36px;
  /* 在按钮下方 */
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.dropdown-item.delete-item {
  color: #ef4444;
}

.dropdown-item.delete-item:hover {
  background: #fee2e2;
}
</style>