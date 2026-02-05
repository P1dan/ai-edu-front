<template>
  <div class="task-manager">
    <h1>Jupyter Notebook 任务管理器</h1>
    
    <!-- 环境选择 -->
    <div class="env-section">
      <label for="python-env">Python环境：</label>
      <select id="python-env" v-model="selectedEnv" class="env-select">
        <option value="python">python（系统默认）</option>
        <option value="custom">自定义路径</option>
      </select>
      
      <div v-if="selectedEnv === 'custom'" class="custom-env-input">
        <input 
          type="text" 
          v-model="customEnvPath" 
          placeholder="输入Python解释器路径，如：/path/to/venv/bin/python"
          class="path-input"
        />
      </div>
    </div>
    
    <div class="action-buttons">
      <button @click="createNewTask" class="btn btn-primary" :disabled="isStarting">
        {{ isStarting ? '创建中...' : '新建任务' }}
      </button>
      
      <button @click="importNotebook" class="btn btn-secondary">
        导入已有 Notebook 文件
      </button>
    </div>
    
    <!-- 状态显示区域 -->
    <div v-if="statusMessage" class="status-message" :class="statusType">
      {{ statusMessage }}
    </div>
    
    <!-- 当前任务信息 -->
    <div v-if="currentTask" class="current-task">
      <h3>当前运行的任务</h3>
      <p><strong>任务ID:</strong> {{ currentTask.taskId }}</p>
      <p><strong>Token:</strong> {{ currentTask.token }}</p>
      <p><strong>端口:</strong> {{ currentTask.port }}</p>
      <p><strong>Python环境:</strong> {{ currentTask.pythonEnv }}</p>
      <p><strong>创建时间:</strong> {{ formatDate(currentTask.createdAt) }}</p>
      
      <!-- 执行命令的提示 -->
      <div class="command-box">
        <h4>需要在终端执行的命令：</h4>
        <pre class="command-code">{{ currentTask.command }}</pre>
        <button @click="copyCommand" class="btn-copy">复制命令</button>
      </div>
      
      <!-- 执行指引 -->
      <div class="instructions">
        <h4>如何执行：</h4>
        <ol>
          <li>打开终端（命令行）</li>
          <li>粘贴并执行上面的命令</li>
          <li>Jupyter Notebook将在浏览器中打开</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const currentTask = ref(null)
const statusMessage = ref('')
const statusType = ref('info')
const isStarting = ref(false)
const selectedEnv = ref('python') // 默认选择
const customEnvPath = ref('')



// 新建任务
const createNewTask = async () => {
  try {
    isStarting.value = true
    showStatus('正在创建新任务...', 'info')
    
    // 准备请求数据
    const requestData = {
      python_env: selectedEnv.value === 'custom' ? customEnvPath.value : selectedEnv.value
    }
    
    // 调用后端API
    const response = await fetch('http://localhost:8000/api/tasks/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`请求失败: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    console.log('API响应:', result)
    
    // 使用后端返回的数据更新界面
    currentTask.value = {
      token: result.token,
      port: result.port,
      status: '已创建',
      createdAt: new Date().toISOString(),
      command: result.command,
      taskId: result.task_id,
      pythonEnv: result.python_env || selectedEnv.value,
      message: result.message
    }
    
    showStatus(result.message, 'success')
    
  } catch (error) {
    console.error('API调用失败:', error)
    showStatus('创建任务失败: ' + error.message, 'error')
  } finally {
    isStarting.value = false
  }
}

// 导入已有文件
const importNotebook = () => {
  showStatus('导入功能待实现', 'info')
}

// 显示状态消息
const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  
  // 3秒后自动清除成功/信息类消息
  if (type !== 'error') {
    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 复制命令到剪贴板
const copyCommand = async () => {
  if (!currentTask.value?.command) return
  
  try {
    await navigator.clipboard.writeText(currentTask.value.command)
    showStatus('命令已复制到剪贴板！', 'success')
  } catch (error) {
    showStatus('复制失败，请手动复制', 'error')
  }
}
</script>

<style scoped>
/* 添加环境选择样式 */
.env-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.env-section label {
  font-weight: 600;
  margin-right: 10px;
  color: #495057;
}

.env-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.custom-env-input {
  margin-top: 15px;
}

.path-input {
  width: 100%;
  max-width: 500px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 8px;
}

.path-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.command-code {
  background-color: #2d2d2d;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 10px 0;
}

.instructions {
  background-color: #e8f4fd;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #3498db;
}

.instructions h4 {
  margin-top: 0;
  color: #2c3e50;
}

.instructions ol {
  margin: 10px 0;
  padding-left: 20px;
}

.instructions li {
  margin: 8px 0;
  color: #34495e;
}
</style>