<template>
  <div class="structuring-container">
    <header class="header">
      <h1>🧠 文本梳理智能体 - 异步处理中台</h1>
      <p>支持多模态数据接入，工业级 Map-Reduce 并发调度与实时状态监控</p>
    </header>

    <main class="content">
      <section class="input-panel card">
        <h3>1. 数据输入配置</h3>
        
        <div class="form-group">
          <label>领域模型 (Domain):</label>
          <input v-model="form.domain" type="text" placeholder="如：管理科学与工程、运筹学" :disabled="isLoading" />
        </div>

        <div class="form-group">
          <label>数据源格式:</label>
          <div class="radio-group" :class="{ 'disabled-group': isLoading }">
            <label><input type="radio" value="text" v-model="form.sourceType" :disabled="isLoading" /> 纯文本直传</label>
            <label><input type="radio" value="file" v-model="form.sourceType" :disabled="isLoading" /> 文档上传 (PDF/Word)</label>
            <label><input type="radio" value="image" v-model="form.sourceType" :disabled="isLoading" /> 图片截图 (OCR)</label>
          </div>
        </div>

        <div class="form-group" v-if="form.sourceType === 'text'">
          <label>原始内容:</label>
          <textarea v-model="form.text" rows="8" placeholder="请粘贴需要处理的长文本..." :disabled="isLoading"></textarea>
        </div>

        <div class="form-group" v-else>
          <label>上传{{ form.sourceType === 'image' ? '图片' : '文档' }}:</label>
          
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="handleFileUpload" 
            :accept="form.sourceType === 'image' ? '.jpg,.jpeg,.png' : '.pdf,.docx'" 
            style="display: none;" 
          />

          <div 
            v-if="!form.file" 
            class="upload-trigger" 
            :class="{ 'is-loading': isLoading }"
            @click="!isLoading && $refs.fileInputRef.click()"
          >
            <div class="upload-icon">{{ form.sourceType === 'image' ? '🖼️' : '📁' }}</div>
            <p class="upload-text">点击选择文件</p>
            <p class="upload-hint">支持 {{ form.sourceType === 'image' ? 'JPG, PNG' : 'PDF, Word' }} 格式</p>
          </div>

          <div v-else class="file-selected-card">
            <div class="file-info">
              <span class="file-icon">{{ form.sourceType === 'image' ? '🖼️' : '📄' }}</span>
              <span class="file-name" :title="form.file.name">{{ form.file.name }}</span>
            </div>
            <button class="clear-file-btn" @click="clearFile" title="移除文件" :disabled="isLoading">✖</button>
          </div>
        </div>

        <button class="submit-btn" :disabled="isLoading" @click="submitTask">
          {{ isLoading ? '处理中，请稍候...' : '开始结构化分析' }}
        </button>

        <div v-if="errorMsg" class="error-box">
          <h4>❌ 任务异常</h4>
          <pre>{{ errorMsg }}</pre>
        </div>
      </section>

      <section class="result-panel card loading-panel" v-if="isLoading">
        <div class="progress-dashboard">
          <div class="pulse-ring"></div>
          <h2 class="status-title">{{ progressData.message }}</h2>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressData.percent + '%' }"></div>
          </div>
          <p class="percent-text">{{ progressData.percent }}%</p>
        </div>
      </section>

      <section class="result-panel card" v-if="resultData && !isLoading">
        <h2>📚 {{ resultData.document_title }}</h2>
        
        <div class="summary-box">
          <h4>💡 全局摘要 (Summary)</h4>
          <p>{{ resultData.summary }}</p>
        </div>

        <div class="split-view">
          <div class="mindmap-container">
            <h4>🗺️ 全局知识拓扑图</h4>
            <div ref="mindmapChartRef" class="echarts-box"></div>
          </div>

          <div class="hierarchy-container">
            <h4>📖 层级知识讲义</h4>
            <div class="hierarchy-list">
              <div 
                v-for="(item, index) in resultData.hierarchy" 
                :key="item.id || index"
                class="hierarchy-item"
                :class="'level-' + item.level"
              >
                <div class="item-title">
                  <span class="level-badge">L{{ item.level }}</span> 
                  {{ item.title }}
                </div>
                <div class="item-content markdown-body" v-html="renderMarkdown(item.content)"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
// ⚠️ 注意：需要 npm install markdown-it markdown-it-katex
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import 'katex/dist/katex.min.css'

// 初始化 Markdown 解析器并挂载 KaTeX 数学公式插件
const md = new MarkdownIt({ html: true, breaks: true }).use(markdownItKatex)

// --- 状态管理 ---
const form = reactive({ domain: '管理科学与工程', sourceType: 'text', text: '', file: null })
const isLoading = ref(false)
const errorMsg = ref('')
const resultData = ref(null)

const progressData = reactive({ taskId: '', percent: 0, message: '正在初始化系统调度...' })
let pollingTimer = null 

const mindmapChartRef = ref(null)
const fileInputRef = ref(null)
let myChart = null

// --- 文件操作逻辑 ---
const handleFileUpload = (e) => {
  form.file = e.target.files[0]
}

const clearFile = () => {
  form.file = null
  if (fileInputRef.value) {
    fileInputRef.value.value = '' // 清除 input 内部缓存，允许重复选同一个文件
  }
}

// 监听数据源切换：如果离开文件/图片模式，自动清空已选文件
watch(() => form.sourceType, (newVal) => {
  if (newVal !== 'text') {
    clearFile()
  }
})

// Markdown 渲染包装函数
const renderMarkdown = (text) => text ? md.render(text) : ''

// --- 核心提交流程 ---
const submitTask = async () => {
  if (form.sourceType === 'text' && !form.text.trim()) return alert("请输入内容！")
  if (form.sourceType !== 'text' && !form.file) return alert("请选择文件！")

  isLoading.value = true
  errorMsg.value = ''
  resultData.value = null
  progressData.percent = 0
  progressData.message = '正在请求后台分配计算资源...'
  if (myChart) { myChart.dispose(); myChart = null }

  const formData = new FormData()
  formData.append('source_type', form.sourceType)
  formData.append('domain', form.domain)
  
  if (form.sourceType === 'text') {
    formData.append('text', form.text)
  } else { 
    formData.append('text', '')
    formData.append('file', form.file) 
  }

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/v1/text/process', formData)
    progressData.taskId = response.data.task_id
    
    if (!progressData.taskId) {
       errorMsg.value = "后台未返回任务凭证"
       return
    }
    startPolling(progressData.taskId)
  } catch (error) {
    isLoading.value = false
    errorMsg.value = "任务调度失败：" + (error.response?.data?.detail || error.message)
  }
}

// --- 轮询逻辑 ---
const startPolling = (taskId) => {
  pollingTimer = setInterval(async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/v1/text/status/${taskId}`)
      const statusInfo = res.data
      
      progressData.percent = statusInfo.progress || 0
      progressData.message = statusInfo.message || '处理中...'

      if (statusInfo.status === 'completed') {
        clearInterval(pollingTimer)
        resultData.value = statusInfo.data
        isLoading.value = false
        nextTick(() => renderMindmap(resultData.value.mindmap))
        clearFile() // 成功后顺手清空输入框
      } else if (statusInfo.status === 'failed') {
        clearInterval(pollingTimer)
        isLoading.value = false
        errorMsg.value = "系统执行异常: \n" + statusInfo.message
      }
    } catch (error) {
      clearInterval(pollingTimer)
      isLoading.value = false
      errorMsg.value = "状态监控连接断开：" + error.message
    }
  }, 1500)
}

// --- ECharts 图表逻辑 ---
const renderMindmap = (mindmapData) => {
  if (!mindmapChartRef.value || !mindmapData) return
  myChart = echarts.init(mindmapChartRef.value)
  myChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'tree', data: [mindmapData], top: '1%', left: '7%', bottom: '1%', right: '20%', symbolSize: 10,
      label: { position: 'left', align: 'right', fontSize: 14, fontWeight: 'bold' },
      expandAndCollapse: true, animationDuration: 550
    }]
  })
}

// 监听窗口缩放，自适应调整脑图尺寸
const handleResize = () => { if (myChart) myChart.resize() }

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pollingTimer) clearInterval(pollingTimer)
})
</script>

<style scoped>
/* =========== 基础布局 =========== */
.structuring-container { max-width: 1400px; margin: 0 auto; padding: 20px; font-family: sans-serif; background-color: #f8f9fa; min-height: 100vh; }
.header { text-align: center; margin-bottom: 30px; color: #2c3e50; }
.content { display: flex; gap: 20px; align-items: flex-start; }
.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.input-panel { flex: 0 0 350px; position: sticky; top: 20px; }
.result-panel { flex: 1; min-width: 0; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 8px; color: #34495e;}
input[type="text"], textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
input:disabled, textarea:disabled { background-color: #f5f5f5; cursor: not-allowed; }
.disabled-group label { color: #95a5a6; cursor: not-allowed; }

/* =========== 按钮与错误 =========== */
.submit-btn { width: 100%; padding: 12px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s; font-weight: bold;}
.submit-btn:disabled { background-color: #95a5a6; cursor: not-allowed; }
.error-box { margin-top: 20px; padding: 15px; background-color: #ffeaa7; color: #d35400; border-radius: 4px; border-left: 4px solid #e74c3c;}

/* =========== 文件上传区现代 UI =========== */
.upload-trigger { border: 2px dashed #bdc3c7; border-radius: 8px; padding: 24px 12px; text-align: center; cursor: pointer; background-color: #fcfcfc; transition: all 0.3s ease; }
.upload-trigger:hover:not(.is-loading) { border-color: #3498db; background-color: #f1f9ff; }
.upload-trigger.is-loading { cursor: not-allowed; opacity: 0.6; }
.upload-icon { font-size: 32px; margin-bottom: 8px; }
.upload-text { color: #34495e; font-weight: bold; margin: 0 0 4px 0; }
.upload-hint { color: #95a5a6; font-size: 12px; margin: 0; }

.file-selected-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: #e8f4f8; border: 1px solid #bce0fd; border-radius: 8px; }
.file-info { display: flex; align-items: center; overflow: hidden; }
.file-icon { font-size: 20px; margin-right: 12px; }
.file-name { color: #2c3e50; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.clear-file-btn { background: none; border: none; color: #e74c3c; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
.clear-file-btn:hover:not(:disabled) { background-color: #fcebe9; }
.clear-file-btn:disabled { color: #ccc; cursor: not-allowed; }

/* =========== 结果展示区 =========== */
.summary-box { background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db; color: #2c3e50; line-height: 1.6;}
.split-view { display: flex; gap: 20px; height: 600px; }
.mindmap-container, .hierarchy-container { flex: 1; border: 1px solid #eee; border-radius: 8px; padding: 15px; overflow-y: auto; background: #fafafa; }
.echarts-box { width: 100%; height: 500px; }

/* 层级扁平化 CSS */
.hierarchy-list { display: flex; flex-direction: column; gap: 12px;}
.hierarchy-item { background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.05);}
.hierarchy-item.level-1 { border-left-color: #2ecc71; margin-left: 0; }
.hierarchy-item.level-2 { border-left-color: #3498db; margin-left: 20px; }
.hierarchy-item.level-3 { border-left-color: #9b59b6; margin-left: 40px; }
.item-title { font-weight: bold; color: #2c3e50; margin-bottom: 10px; font-size: 16px;}
.level-badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #7f8c8d; margin-right: 6px; }
.item-content { color: #555; }

/* 简单的 markdown 内容重置，如果你装了 github-markdown-css，这部分可以删除 */
.markdown-body :deep(p) { margin: 0 0 10px 0; line-height: 1.6; }
.markdown-body :deep(code) { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; color: #e83e8c;}

/* =========== 高光进度条样式 =========== */
.progress-dashboard { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; width: 100%; padding: 40px; }
.status-title { color: #2c3e50; margin-bottom: 30px; font-weight: bold; text-align: center; font-size: 20px; }
.progress-track { width: 80%; height: 20px; background-color: #ecf0f1; border-radius: 10px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); border-radius: 10px; transition: width 0.4s ease-out; position: relative; }
.progress-fill::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient( 45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent ); background-size: 30px 30px; animation: move 2s linear infinite; }
.percent-text { margin-top: 15px; font-size: 24px; font-weight: bold; color: #7f8c8d; }
@keyframes move { 0% { background-position: 0 0; } 100% { background-position: 30px 30px; } }
</style>