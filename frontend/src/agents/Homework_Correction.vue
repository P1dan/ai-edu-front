<template>
  <div class="homework-grader-container">
    <div class="header">
      <h2 class="text-2xl font-bold mb-2 text-gray-800 flex items-center">
        <span class="text-orange-500 mr-2">✓</span>
        AI作业批改
      </h2>
      <p class="text-sm text-gray-600 mb-6">上传作业以获取即时的 OCR 识别、批改和反馈。</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 标准答案上传 -->
      <div class="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span class="text-blue-500 text-xl">✓</span>
          </div>
        </div>
        <h3 class="text-lg font-medium text-center text-gray-800 mb-2">上传标准答案 (可选)</h3>
        <p class="text-sm text-gray-600 mb-6 text-center">上传老师的正确答案，系统将基于此进行比对批改。若不上传，则由 AI 自动批改。</p>
        <div class="flex justify-center">
          <div v-if="!answerKeyFile" class="cursor-pointer" @click="answerKeyInputRef?.click()">
            <div class="border-2 border-dashed border-blue-400 rounded-lg p-4 inline-block">
              <span class="text-blue-500 mb-2 block text-center">📋</span>
              <p class="text-blue-600 font-medium text-center">点击上传标准答案</p>
              <input
                ref="answerKeyInputRef"
                type="file"
                class="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                @change="handleUploadAnswerKey"
              />
            </div>
          </div>
          <div v-else-if="isUploadingAnswerKey" class="border-2 border-dashed border-blue-400 rounded-lg p-4 inline-block">
            <span class="text-blue-500 mb-2 block text-center">⌛</span>
            <p class="text-blue-600 font-medium text-center">正在上传...</p>
          </div>
          <div v-else class="border-2 border-dashed border-blue-400 rounded-lg p-4 inline-block">
            <span class="text-blue-500 mb-2 block text-center">✓</span>
            <p class="text-blue-600 font-medium text-center">{{ answerKeyFile.name }}</p>
          </div>
        </div>
      </div>
      
      <!-- 学生作业上传 -->
      <div class="border-2 border-dashed border-orange-300 rounded-lg p-6 bg-yellow-50">
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span class="text-orange-500 text-xl">☁️</span>
          </div>
        </div>
        <h3 class="text-lg font-medium text-center text-gray-800 mb-2">上传学生作业</h3>
        <p class="text-sm text-gray-600 mb-6 text-center">支持图片、PDF 和 Word 文档。使用统一文档解析处理中心进行 OCR。</p>
        <div class="flex justify-center">
          <div v-if="!isGrading" class="cursor-pointer" @click="homeworkInputRef?.click()">
            <div class="border-2 border-dashed border-orange-400 rounded-lg p-4 inline-block">
              <span class="text-orange-500 mb-2 block text-center">+</span>
              <p class="text-orange-600 font-medium text-center">点击上传学生作业</p>
              <input
                ref="homeworkInputRef"
                type="file"
                class="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                @change="handleGrade"
              />
            </div>
          </div>
          <div v-else class="border-2 border-dashed border-orange-400 rounded-lg p-4 inline-block">
            <span class="text-orange-500 mb-2 block text-center">⌛</span>
            <p class="text-orange-600 font-medium text-center">正在批改...</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文本输入区域和提交按钮 -->
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-800 mb-4 text-center">或直接输入作业内容</h3>
      <textarea
        v-model="homeworkContent"
        class="w-full p-4 border border-gray-300 rounded-lg mb-6"
        rows="6"
        placeholder="输入作业内容，例如：\n1. 计算1+2×3=？\n答：7\n\n2. 什么是人工智能？\n答：人工智能是研究、开发用于模拟、延伸和扩展人的智能的理论、方法、技术及应用系统的一门新的技术科学。"
      ></textarea>
      <div class="flex justify-center">
        <button
          @click="handleTextSubmit"
          :disabled="isGrading"
          class="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isGrading ? '批改中...' : '提交批改' }}
        </button>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      作业批改失败: {{ error }}
    </div>
    
    <!-- 批改结果 -->
    <div v-if="result" class="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 class="text-xl font-bold text-green-800 mb-4">批改结果</h3>
      <div v-html="result" class="result-content"></div>
      <div v-if="avgScore" class="mt-4 text-lg font-medium text-green-800">
        平均分: {{ avgScore }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const HOMEWORK_API_BASE = 'http://127.0.0.1:8000';

const isGrading = ref(false);
const isUploadingAnswerKey = ref(false);
const answerKeyInputRef = ref(null);
const homeworkInputRef = ref(null);
const result = ref(null);
const avgScore = ref(null);
const error = ref(null);
const homeworkContent = ref('');
const answerKeyFile = ref(null);

function toastSuccess(message) {
  alert(`成功: ${message}`);
}

function toastErr(message) {
  alert(`错误: ${message}`);
}

const handleUploadAnswerKey = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  isUploadingAnswerKey.value = true;
  try {
    answerKeyFile.value = file;
    toastSuccess(`标准答案 ${file.name} 已选择，将在批改时一并提交`);
  } catch (err) {
    console.error(err);
    toastErr('标准答案上传失败');
  } finally {
    isUploadingAnswerKey.value = false;
    if (answerKeyInputRef.value) answerKeyInputRef.value.value = '';
  }
};

const handleGrade = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  isGrading.value = true;
  error.value = null;
  result.value = null;
  avgScore.value = null;
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (answerKeyFile.value) formData.append('answer_key_file', answerKeyFile.value);

    const response = await fetch(`${HOMEWORK_API_BASE}/api/grade`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.ok) {
      error.value = data.error || '批改失败';
      toastErr('作业批改失败');
      return;
    }
    if (data.final_result) {
      result.value = data.final_result;
      avgScore.value = typeof data.avg_score === 'number' ? data.avg_score : null;
      toastSuccess(`作业 ${file.name} 批改完成`);
    } else {
      error.value = '未找到批改结果';
      toastErr('作业批改失败');
    }
  } catch (err) {
    console.error(err);
    error.value = `作业批改失败: ${err instanceof Error ? err.message : '未知错误'}`;
    toastErr('作业批改失败');
  } finally {
    isGrading.value = false;
    if (homeworkInputRef.value) homeworkInputRef.value.value = '';
  }
};

const handleTextSubmit = async () => {
  if (!homeworkContent.value.trim()) {
    toastErr('请输入作业内容');
    return;
  }

  isGrading.value = true;
  error.value = null;
  result.value = null;
  avgScore.value = null;
  
  try {
    const formData = new FormData();
    formData.append('homework', homeworkContent.value.trim());
    if (answerKeyFile.value) formData.append('answer_key_file', answerKeyFile.value);

    const response = await fetch(`${HOMEWORK_API_BASE}/api/grade`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.ok) {
      error.value = data.error || '批改失败';
      toastErr('作业批改失败');
      return;
    }
    if (data.final_result) {
      result.value = data.final_result;
      avgScore.value = typeof data.avg_score === 'number' ? data.avg_score : null;
      toastSuccess('作业批改完成');
    } else {
      error.value = '未找到批改结果';
      toastErr('作业批改失败');
    }
  } catch (err) {
    console.error(err);
    error.value = `作业批改失败: ${err instanceof Error ? err.message : '未知错误'}`;
    toastErr('作业批改失败');
  } finally {
    isGrading.value = false;
  }
};

const resetForm = () => {
  result.value = null;
  error.value = null;
  homeworkContent.value = '';
  answerKeyFile.value = null;
  avgScore.value = null;
};
</script>

<style scoped>
.homework-grader-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.header {
  margin-bottom: 20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* 结果内容样式 */
.result-content h3 {
  color: #2d3748;
  margin-bottom: 10px;
}

.result-content p {
  color: #4a5568;
  margin-bottom: 10px;
}

.result-content ul {
  margin-left: 20px;
  margin-bottom: 10px;
}

.result-content li {
  margin-bottom: 5px;
  color: #4a5568;
}

/* 分数样式 */
.score-summary {
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 15px;
}

.score-summary p {
  color: #155724;
  margin: 5px 0;
  font-size: 14px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
}

/* 问题结果样式 */
.question-result {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.question-result h3 {
  color: #333;
  font-size: 15px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.question-result p {
  margin: 6px 0;
  font-size: 13px;
  color: #555;
}

.question-result .score {
  font-weight: bold;
  color: #28a745;
  font-size: 16px;
}

.question-result .feedback {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  padding: 8px 12px;
  margin-top: 8px;
  border-radius: 0 4px 4px 0;
  color: #856404;
}
</style>