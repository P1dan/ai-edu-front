<template>
  <div class="learning-plan-panel">
    <header class="page-header">
      <div>
        <h1>个性化学习路径</h1>
        <p>基于你的学习目标动态生成，并随着进度自动调整。</p>
      </div>
      <div class="header-actions">
        <button class="ghost-button" @click="isHistoryOpen = true">历史记录</button>
        <button class="primary-button" @click="handleNewPath">新建路径</button>
      </div>
    </header>

    <section v-if="step === 1" class="card card-panel">
      <div class="panel-header">
        <h2>规划您的学习旅程</h2>
        <p>输入你的目标、学习时间安排，或者上传相关材料，AI将为你生成专属路径。</p>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>学习目标 / 主题内容 + 学习时间规划</label>
          <textarea
            v-model="usersInput"
            placeholder="例如：我想在一个月内掌握 Vue 前端开发，每天学习 2 小时..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>上传相关文件（可选）</label>
          <p class="hint">支持上传教学大纲、课程表或现有资料，AI会结合内容为你定制路径。</p>
          <input ref="fileInput" type="file" class="hidden-input" @change="handleFileChange" />
          <div v-if="uploadedFile" class="file-card">
            <div>
              <strong>{{ uploadedFile.name }}</strong>
              <div class="file-meta">{{ formatFileSize(uploadedFile.size) }}</div>
            </div>
            <button class="text-button" @click="removeFile">移除</button>
          </div>
          <button v-else class="upload-card" @click="triggerUpload">
            <div class="upload-icon">📁</div>
            <div>
              <p>点击上传文件</p>
              <p class="hint">支持 .txt、.md、.pdf 等格式</p>
            </div>
          </button>
        </div>
      </div>

      <div class="action-footer">
        <button
          class="primary-button full-width"
          :disabled="(!usersInput.trim() && !uploadedFile) || isGenerating"
          @click="handleGenerate"
        >
          {{ isGenerating ? '生成中...' : '生成专属学习路径' }}
        </button>
      </div>
    </section>

    <section v-else class="grid-layout">
      <div class="card timeline-card">
        <div class="section-title">
          <h2>您的目标和计划</h2>
          <p>{{ usersInput || '请填写学习目标以生成路径' }}</p>
        </div>

        <div class="timeline">
          <div
            v-for="node in pathNodes"
            :key="node.id"
            class="timeline-item"
            :class="node.status"
            @click="handleNodeClick(node)"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-meta">
                <span>{{ node.type }} · {{ node.duration }}</span>
                <span class="status-tag" :class="node.status">{{ node.statusLabel }}</span>
              </div>
              <h3>{{ node.title }}</h3>
              <p v-if="node.status !== 'locked'">{{ node.content }}</p>
              <p v-else class="locked-text">该节点需要解锁后才能查看详细内容。</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="card detail-card">
        <div class="section-title">
          <h3>当前重点</h3>
          <p>{{ currentNode?.title || '请选择一个节点开始学习' }}</p>
        </div>

        <div class="detail-block">
          <div v-if="currentNode">
            <div class="detail-row">
              <strong>类型</strong>
              <span>{{ currentNode.type }}</span>
            </div>
            <div class="detail-row">
              <strong>时长</strong>
              <span>{{ currentNode.duration }}</span>
            </div>
            <div class="detail-row">
              <strong>状态</strong>
              <span>{{ currentNode.statusLabel }}</span>
            </div>
            <p class="detail-text">{{ currentNode.content }}</p>
          </div>
          <div v-else class="empty-state">请选择左侧路径中的一个节点查看详情。</div>

          <div class="button-group" v-if="currentNode">
            <button
              v-if="currentNode.status === 'locked'"
              class="primary-button"
              @click="handleUnlock"
            >
              解锁并开始学习
            </button>
            <button
              v-else
              class="secondary-button"
              @click="startLearning(currentNode.id)"
            >
              开始学习
            </button>
          </div>
        </div>

        <div class="recommendation-card">
          <h4>推荐资源</h4>
          <ul>
            <li v-for="item in recommendations" :key="item.title">
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </li>
          </ul>
        </div>
      </aside>
    </section>

    <div v-if="isHistoryOpen" class="modal-mask" @click.self="isHistoryOpen = false">
      <div class="modal-panel">
        <header>
          <h3>学习记录</h3>
          <button class="text-button" @click="isHistoryOpen = false">关闭</button>
        </header>
        <div class="history-list">
          <button
            v-for="item in history"
            :key="item.id"
            class="history-item"
            @click="selectHistory(item)"
          >
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.date }}</p>
            </div>
            <span>查看</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-mask" @click.self="isModalOpen = false">
      <div class="modal-panel">
        <header>
          <h3>解锁节点</h3>
          <button class="text-button" @click="isModalOpen = false">×</button>
        </header>
        <div class="modal-content">
          <p>你正在尝试解锁：</p>
          <h4>{{ currentNode?.title }}</h4>
          <p>{{ currentNode?.content }}</p>
          <div class="modal-actions">
            <button class="ghost-button" @click="isModalOpen = false">取消</button>
            <button class="primary-button" @click="handleUnlock">解锁并开始</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const step = ref(1)
const usersInput = ref('')
const uploadedFile = ref(null)
const isGenerating = ref(false)
const activeNode = ref(null)
const recommendations = ref([])
const pathNodes = ref([])
const currentNode = ref(null)
const isModalOpen = ref(false)
const isHistoryOpen = ref(false)

const mockHistory = [
  {
    id: '1',
    title: '前端开发进阶路线',
    date: '2026-03-20',
    usersInput: '我想在一个月内掌握 Vue 前端开发，每天学习 2 小时。',
    pathNodes: [
      { id: 1, title: 'HTML & CSS 基础', content: '讲解 HTML 结构和 CSS 样式基础。', status: 'completed', type: '视频', duration: '2小时', next: [2, 3] },
      { id: 2, title: 'JavaScript 基础', content: '变量、函数、DOM 操作等 JS 基础。', status: 'active', type: '视频', duration: '3小时', next: [3] },
      { id: 3, title: '前端框架入门', content: 'Vue 基础概念与组件开发。', status: 'locked', type: '项目', duration: '4小时', next: [] }
    ]
  },
  {
    id: '2',
    title: '考研数学复习规划',
    date: '2026-03-15',
    usersInput: '需要复习高数和线性代数，目标每周完成两个章节。',
    pathNodes: [
      { id: 1, title: '高等数学复习', content: '极限、导数、积分等基础复习。', status: 'completed', type: '阅读', duration: '3小时', next: [2] },
      { id: 2, title: '线性代数复习', content: '矩阵、向量空间等内容讲解。', status: 'active', type: '阅读', duration: '2小时', next: [] }
    ]
  }
]

const history = ref([...mockHistory])

function formatFileSize(size) {
  return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(2)} KB`
}

function triggerUpload() {
  const el = fileInput.value
  if (el) el.click()
}

function removeFile() {
  uploadedFile.value = null
  const el = fileInput.value
  if (el) el.value = ''
}

const fileInput = ref(null)

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadedFile.value = file
}

function buildPathNodes(nodes) {
  return nodes.map((node, index) => ({
    ...node,
    status: index === 0 ? 'active' : node.status || 'locked',
    statusLabel: node.status === 'completed' ? '已完成' : node.status === 'active' ? '进行中' : '锁定'
  }))
}

async function handleGenerate() {
  if (isGenerating.value) return
  if (!usersInput.value.trim() && !uploadedFile.value) {
    ElMessage.error('请输入学习目标或上传相关文件')
    return
  }

  isGenerating.value = true

  try {
    let documentContext = null
    if (uploadedFile.value && uploadedFile.value.type.startsWith('text')) {
      documentContext = await readFileText(uploadedFile.value)
    }

    const response = await fetch('http://localhost:8000/api/generate-learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input: usersInput.value,
        document_context: documentContext
      })
    })

    if (!response.ok) {
      throw new Error('后端请求失败')
    }

    const data = await response.json()
    if (!data.nodes || !data.nodes.length) {
      throw new Error('返回路径为空')
    }

    pathNodes.value = buildPathNodes(data.nodes)
    activeNode.value = pathNodes.value[0]?.id
    currentNode.value = pathNodes.value[0]
    step.value = 2
    ElMessage.success('学习路径已生成！')
  } catch (error) {
    console.error(error)
    ElMessage.error('生成失败，已加载默认演示路径')
    pathNodes.value = buildPathNodes(mockHistory[0].pathNodes)
    activeNode.value = pathNodes.value[0]?.id
    currentNode.value = pathNodes.value[0]
    step.value = 2
  } finally {
    isGenerating.value = false
  }
}

function handleNewPath() {
  if (pathNodes.value.length) {
    history.value.unshift({
      id: `${Date.now()}`,
      title: usersInput.value || '未命名路径',
      date: new Date().toISOString().slice(0, 10),
      usersInput: usersInput.value,
      pathNodes: pathNodes.value.map((node) => ({ ...node }))
    })
  }
  step.value = 1
  usersInput.value = ''
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  pathNodes.value = []
  currentNode.value = null
  ElMessage.success('已新建学习路径')
}

function handleNodeClick(node) {
  if (node.status === 'locked') {
    currentNode.value = node
    isModalOpen.value = true
    return
  }

  currentNode.value = node
  activeNode.value = node.id
}

function handleUnlock() {
  if (!currentNode.value) return
  pathNodes.value = pathNodes.value.map((node) =>
    node.id === currentNode.value.id ? { ...node, status: 'active', statusLabel: '进行中' } : node
  )
  activeNode.value = currentNode.value.id
  isModalOpen.value = false
}

function startLearning(nodeId) {
  const node = pathNodes.value.find((item) => item.id === nodeId)
  if (!node) return
  currentNode.value = node
}

function completeCurrentNode() {
  if (!currentNode.value) return
  const nextIds = currentNode.value.next || []
  pathNodes.value = pathNodes.value.map((node) => {
    if (node.id === currentNode.value.id) {
      return { ...node, status: 'completed', statusLabel: '已完成' }
    }
    if (nextIds.includes(node.id)) {
      return { ...node, status: 'active', statusLabel: '进行中' }
    }
    return node
  })
  currentNode.value = pathNodes.value.find((node) => node.id === nextIds[0]) || null
  activeNode.value = currentNode.value?.id || null
}

function selectHistory(item) {
  if (!item?.pathNodes) return
  pathNodes.value = item.pathNodes.map((node) => ({ ...node }))
  usersInput.value = item.usersInput || ''
  currentNode.value = pathNodes.value.find((node) => node.status === 'active') || pathNodes.value[0] || null
  activeNode.value = currentNode.value?.id || null
  step.value = 2
  isHistoryOpen.value = false
  ElMessage.success('历史路径已恢复')
}

onMounted(() => {
  recommendations.value = [
    { title: 'Vue 3 官方教程', desc: '系统化掌握 Vue 3 语法与组件开发。' },
    { title: '前端项目实战', desc: '通过真实项目巩固学习成果。' },
    { title: '学习进度分析报告', desc: '查看你的阶段目标和提升建议。' }
  ]
})
</script>

<style scoped>
.learning-plan-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 18px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.page-header p {
  margin: 8px 0 0;
  color: #556179;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card,
.card-panel,
.timeline-card,
.detail-card {
  background: white;
  border: 1px solid #e5e9f0;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(20, 40, 80, 0.05);
}

.card-panel,
.timeline-card,
.detail-card {
  padding: 24px;
}

.panel-header h2,
.section-title h2,
.section-title h3 {
  margin: 0 0 10px;
  font-size: 22px;
}

.panel-header p,
.section-title p {
  margin: 0;
  color: #6b7280;
}

.form-grid {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  min-height: 170px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #d1d5db;
  resize: vertical;
  font-size: 14px;
  color: #111827;
}

.hint {
  font-size: 13px;
  color: #6b7280;
}

.hidden-input {
  display: none;
}

.file-card,
.upload-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.upload-card:hover,
.file-card:hover {
  background: #f8fafc;
}

.upload-icon {
  font-size: 32px;
  margin-right: 14px;
}

.text-button {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
}

.primary-button,
.secondary-button,
.ghost-button {
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button {
  background: #2563eb;
  color: white;
  padding: 12px 18px;
}

.primary-button:hover {
  background: #1d4ed8;
}

.secondary-button {
  background: #f3f4f6;
  color: #111827;
  padding: 12px 18px;
}

.ghost-button {
  background: #ffffff;
  color: #2563eb;
  padding: 12px 18px;
  border: 1px solid #c7d2fe;
}

.full-width {
  width: 100%;
}

.action-footer {
  margin-top: 18px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.timeline {
  position: relative;
  padding-left: 24px;
  border-left: 2px solid #dbeafe;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 22px;
  cursor: pointer;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -13px;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #93c5fd;
}

.timeline-item.completed .timeline-dot {
  background: #34d399;
}

.timeline-item.active .timeline-dot {
  background: #2563eb;
}

.timeline-item.locked .timeline-dot {
  background: #a78bfa;
}

.timeline-content {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 18px;
  padding: 18px;
}

.timeline-item.active .timeline-content {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #4b5563;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
}

.status-tag.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-tag.locked {
  background: #ede9fe;
  color: #5b21b6;
}

.timeline-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.timeline-content p {
  margin: 0;
  color: #4b5563;
}

.locked-text {
  color: #6b7280;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #374151;
}

.detail-text {
  margin: 0;
  color: #4b5563;
  line-height: 1.75;
}

.empty-state {
  color: #6b7280;
  padding: 26px 0;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.recommendation-card {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.recommendation-card h4 {
  margin: 0 0 12px;
}

.recommendation-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.recommendation-card li {
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.recommendation-card li strong {
  display: block;
  margin-bottom: 6px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-panel {
  width: min(100%, 520px);
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18);
}

.modal-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-panel header h3 {
  margin: 0;
}

.modal-content {
  padding: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.history-list {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.history-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
}

.history-item strong {
  display: block;
  margin-bottom: 6px;
}

@media (max-width: 960px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
