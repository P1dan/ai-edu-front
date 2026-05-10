<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 py-8 px-4">
        <div class="max-w-6xl mx-auto space-y-8">
            <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="p-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-md">
                            <FileText class="text-white" size="28" />
                        </div>
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                            AI教案生成
                        </h1>
                    </div>
                    <p class="text-neutral-600 text-lg max-w-2xl">
                        输入教学主题或上传教材，智能生成结构化教案与教学资源
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="isHistoryOpen = true"
                            class="flex items-center gap-2 px-4 py-2 text-neutral-700 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                        <History size="18" />
                        历史记录
                    </button>
                    <button @click="handleNewTask"
                            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                        <Plus size="18" />
                        新建教案
                    </button>
                </div>
            </header>

            <!-- 步骤条（纯模板，不用JSX） -->
            <div class="flex items-center justify-between mb-10 px-4">
                <div class="flex items-center gap-2">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300', step > 1 ? 'bg-teal-600 text-white shadow-md' : step === 1 ? 'bg-teal-100 text-teal-700 border-2 border-teal-400' : 'bg-neutral-100 text-neutral-400']">
                        <Check v-if="step > 1" size="18" /><span v-else>1</span>
                    </div>
                    <span :class="step === 1 ? 'text-teal-700' : step > 1 ? 'text-teal-600' : 'text-neutral-400'">输入主题/材料</span>
                </div>
                <div class="h-0.5 flex-1 mx-4 rounded-full bg-gradient-to-r from-teal-200 to-emerald-200" />
                <div class="flex items-center gap-2">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300', step > 2 ? 'bg-teal-600 text-white shadow-md' : step === 2 ? 'bg-teal-100 text-teal-700 border-2 border-teal-400' : 'bg-neutral-100 text-neutral-400']">
                        <Check v-if="step > 2" size="18" /><span v-else>2</span>
                    </div>
                    <span :class="step === 2 ? 'text-teal-700' : step > 2 ? 'text-teal-600' : 'text-neutral-400'">生成教案与资源</span>
                </div>
                <div class="h-0.5 flex-1 mx-4 rounded-full bg-gradient-to-r from-teal-200 to-emerald-200" />
                <div class="flex items-center gap-2">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300', step === 3 ? 'bg-teal-100 text-teal-700 border-2 border-teal-400' : step > 3 ? 'bg-teal-600 text-white shadow-md' : 'bg-neutral-100 text-neutral-400']">
                        <Check v-if="step > 3" size="18" /><span v-else>3</span>
                    </div>
                    <span :class="step === 3 ? 'text-teal-700' : step > 3 ? 'text-teal-600' : 'text-neutral-400'">导出教案</span>
                </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden transition-all duration-300">
                <!-- 步骤1：输入 -->
                <div v-if="step === 1" class="p-8 md:p-12">
                    <h2 class="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                        <div class="p-1.5 bg-teal-100 rounded-lg">
                            <FileText class="text-teal-600" size="20" />
                        </div>
                        创建教学教案
                    </h2>

                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label class="block text-sm font-semibold text-neutral-700 mb-1.5">年级</label>
                                <select v-model="form.grade" class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all">
                                    <option>小学</option>
                                    <option>初中</option>
                                    <option>高中</option>
                                    <option>大学</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-neutral-700 mb-1.5">学科</label>
                                <input v-model="form.subject" type="text" placeholder="数学" class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-neutral-700 mb-1.5">课程类型</label>
                                <select v-model="form.course_type" class="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all">
                                    <option>新授课</option>
                                    <option>复习课</option>
                                    <option>习题课</option>
                                    <option>实验课</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-neutral-700 mb-1.5">教学主题 / 内容要求</label>
                            <textarea v-model="form.description"
                                      rows="4"
                                      placeholder="例如：高中物理 - 牛顿第二定律的应用..."
                                      class="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition-all"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-neutral-700 mb-1.5">上传教材/大纲（可选）</label>
                            <p class="text-xs text-neutral-500 mb-3">支持 PDF、Word、PPT、TXT 等格式，AI 将解析文件内容辅助生成教案</p>
                            <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" accept=".pdf,.docx,.pptx,.txt,.md" />
                            <div v-if="uploadedFile" class="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-teal-100 rounded-lg">
                                        <FileText class="text-teal-700" size="20" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-teal-900">{{ uploadedFile.name }}</p>
                                        <p class="text-xs text-teal-600">{{ (uploadedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                                    </div>
                                </div>
                                <button @click="removeFile" class="text-sm text-teal-700 hover:text-teal-800 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-all">移除</button>
                            </div>
                            <div v-else @click="triggerFileInput" class="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 transition-all duration-200 group">
                                <Upload size="32" class="text-neutral-400 group-hover:text-teal-500 transition-all" />
                                <div class="text-center">
                                    <span class="text-neutral-600 font-medium">点击或拖拽上传文档</span>
                                    <p class="text-neutral-400 text-xs mt-1">支持 .pdf, .docx, .pptx, .txt</p>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4">
                            <button @click="handleGenerate"
                                    :disabled="(!form.description.trim() && !uploadedFile) || isProcessing"
                                    class="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                                <Loader2 v-if="isProcessing" size="20" class="animate-spin" />
                                <Sparkles v-else size="20" />
                                {{ isProcessing ? '正在生成教案，请稍候...' : '生成教案' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 步骤2：教案预览 -->
                <div v-if="step === 2 && lessonPlan" class="p-8">
                    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h3 class="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                            <LayoutTemplate class="text-teal-600" size="24" />
                            教案结构预览
                        </h3>
                        <span class="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                            <Sparkles size="12" />
                            基于 LangGraph + RAG 智能生成
                        </span>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2 space-y-5">
                            <div class="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                                <h4 class="text-xl font-bold text-neutral-800 mb-5 pb-2 border-b border-neutral-200">{{ lessonPlan.title }}</h4>
                                <div class="space-y-4">
                                    <div v-for="(section, idx) in lessonPlan.sections" :key="idx" class="bg-white p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                                        <h5 class="font-semibold text-neutral-800 flex items-start gap-3">
                                            <span class="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                                            <span class="text-lg">{{ section.title }}</span>
                                        </h5>
                                        <p class="text-neutral-600 mt-3 ml-10 leading-relaxed">{{ section.content }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-5">
                            <div class="bg-gradient-to-br from-amber-50/50 to-white rounded-xl p-6 border border-amber-100 shadow-sm">
                                <h4 class="text-md font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                    <BookOpen class="text-amber-500" size="20" />
                                    推荐教学资源
                                </h4>
                                <div class="space-y-3">
                                    <div v-for="(rec, idx) in resources" :key="idx" class="p-3 bg-white rounded-lg border border-neutral-100 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer group">
                                        <p class="text-sm font-medium text-neutral-800 group-hover:text-teal-700">{{ rec.title }}</p>
                                        <div class="flex items-center justify-between mt-2">
                                            <span class="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{{ rec.type }}</span>
                                            <span class="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{{ rec.match }} 匹配</span>
                                        </div>
                                        <p v-if="rec.search_keyword" class="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                                            <span>🔍</span> 搜索：{{ rec.search_keyword }}
                                        </p>
                                    </div>
                                </div>
                                <div class="mt-5 pt-3 text-center border-t border-neutral-100">
                                    <span class="text-[11px] text-neutral-400">由知识库检索 + 学情适配引擎推荐</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-100">
                        <button @click="step = 1" class="px-6 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 font-medium transition-all">重新生成</button>
                        <button @click="step = 3" class="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 font-medium">
                            确认并导出 <ChevronRight size="18" />
                        </button>
                    </div>
                </div>

                <!-- 步骤3：导出 -->
                <div v-if="step === 3" class="p-12 text-center">
                    <div class="w-28 h-28 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle2 size="52" class="text-green-600" />
                    </div>
                    <h3 class="text-2xl font-bold text-neutral-800 mb-3">教案已生成！</h3>
                    <p class="text-neutral-500 mb-8 max-w-md mx-auto">
                        您的结构化教案及配套教学资源已准备就绪，可选择格式下载。
                    </p>
                    <div class="flex justify-center gap-5 flex-wrap items-end">
                        <div>
                            <label class="block text-sm text-neutral-600 mb-2">导出格式</label>
                            <select v-model="exportFormat" class="px-4 py-2 border border-neutral-300 rounded-lg bg-white">
                                <option value="md">Markdown (.md)</option>
                                <option value="pdf">PDF (.pdf)</option>
                                <option value="docx">Word (.docx)</option>
                            </select>
                        </div>
                        <button @click="handleExport(exportFormat)" class="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 font-semibold">
                            <Download size="20" /> 下载教案
                        </button>
                        <button @click="handleNewTask" class="px-8 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:shadow-md transition-all font-medium">
                            创建新教案
                        </button>
                    </div>
                </div>
            </div>

            <!-- 历史记录弹窗（简化实现） -->
            <div v-if="isHistoryOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl p-6 w-96">
                    <h3 class="text-xl font-bold mb-4">历史记录</h3>
                    <ul class="space-y-2">
                        <li v-for="item in mockHistory" :key="item.id" @click="() => { toast.success(`已加载历史记录: ${item.title}`); isHistoryOpen = false; }" class="p-2 hover:bg-neutral-100 rounded cursor-pointer">
                            {{ item.title }} ({{ item.date }})
                        </li>
                    </ul>
                    <button @click="isHistoryOpen = false" class="mt-4 px-4 py-2 bg-teal-600 text-white rounded w-full">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { FileText, Upload, Loader2, LayoutTemplate, Sparkles, BookOpen, CheckCircle2, Download, History, Plus, ChevronRight, Check } from 'lucide-vue-next'
    import { toast } from 'vue-sonner'
    import axios from 'axios'

    const API_BASE = '/api/lesson-plan'

    const step = ref(1)
    const isProcessing = ref(false)
    const uploadedFile = ref(null)
    const lessonPlan = ref(null)
    const resources = ref([])
    const markdownContent = ref('')
    const fileInput = ref(null)
    const isHistoryOpen = ref(false)
    const exportFormat = ref('md')

    const form = reactive({
        grade: '高中',
        subject: '数学',
        course_type: '新授课',
        description: ''
    })

    const mockHistory = ref([
        { id: '1', title: '牛顿第二定律教案', date: '2026-03-29', type: 'document' },
        { id: '2', title: '唐诗三百首赏析', date: '2026-03-25', type: 'document' }
    ])

    const triggerFileInput = () => fileInput.value?.click()
    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadedFile.value = file
            toast.success(`已选择文件: ${file.name}`)
        }
    }
    const removeFile = () => {
        uploadedFile.value = null
        if (fileInput.value) fileInput.value.value = ''
    }

    const handleGenerate = async () => {
        if (!form.description.trim() && !uploadedFile.value) {
            toast.error('请输入教学主题或上传相关文件')
            return
        }
        isProcessing.value = true
        try {
            const formData = new FormData()
            formData.append('grade', form.grade)
            formData.append('subject', form.subject)
            formData.append('course_type', form.course_type)
            formData.append('description', form.description)
            if (uploadedFile.value) formData.append('file', uploadedFile.value)

            const response = await axios.post(`${API_BASE}/upload_and_generate`, formData, { timeout: 120000 })
            if (response.data.success) {
                const result = response.data.data
                lessonPlan.value = {
                    title: `${result.subject} ${result.grade} 教案`,
                    sections: (result.teaching_flow || []).map((step, idx) => ({
                        title: step.step,
                        content: `${step.content}\n⏱️ ${step.duration}分钟 | 活动类型：${step.activity_type}`
                    }))
                }
                resources.value = (result.resources || []).map(res => ({
                    title: res.name,
                    type: res.type,
                    match: '高',
                    search_keyword: res.search_keyword
                }))
                markdownContent.value = response.data.markdown || ''
                step.value = 2
                toast.success('教案生成成功')
            } else {
                toast.error('教案生成失败')
            }
        } catch (error) {
            console.error(error)
            toast.error('教案生成失败，请检查后端服务')
        } finally {
            isProcessing.value = false
        }
    }

    const handleExport = async (format) => {
        if (format === 'md') {
            const blob = new Blob([markdownContent.value], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `教案_${new Date().toISOString().slice(0, 19)}.md`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Markdown 教案下载成功')
        } else {
            try {
                const response = await axios.post(`${API_BASE}/export_${format}`, markdownContent.value, {
                    headers: { 'Content-Type': 'text/plain' },
                    responseType: 'blob',
                    timeout: 60000
                })
                const url = URL.createObjectURL(response.data)
                const a = document.createElement('a')
                a.href = url
                a.download = `教案_${new Date().toISOString().slice(0, 19)}.${format === 'pdf' ? 'pdf' : 'docx'}`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(`${format.toUpperCase()} 教案下载成功`)
            } catch (error) {
                console.error(error)
                toast.error(`导出 ${format.toUpperCase()} 失败，请检查后端服务`)
            }
        }
    }

    const handleNewTask = () => {
        step.value = 1
        form.description = ''
        uploadedFile.value = null
        lessonPlan.value = null
        resources.value = []
        markdownContent.value = ''
        if (fileInput.value) fileInput.value.value = ''
        toast.success('已新建教案任务')
    }
</script>

<style scoped>
    /* 如果需要额外样式，可在此添加；Tailwind 已足够 */
</style>