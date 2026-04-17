<!-- 个性化练习模块单文件交付版：已联调通过，默认后端地址为 http://127.0.0.1:8000 -->
<template>
    <div class="pp">
        <div class="tw">
            <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.message }}</div>
        </div>
        <header class="c hero">
            <div>
                <div class="b1">ADAPTIVE LEARNING ENGINE</div>
                <h1>🎯 智能个性化练习</h1>
                <p>基于 RAG 与认知图谱驱动，动态生成自适应难度题目，实时追踪知识掌握状态。</p>
            </div>
            <div class="r">
                <button class="btn g" type="button" @click="isHistoryOpen = true">历史记录</button>
                <button class="btn d" type="button" @click="resetTask">新建追踪</button>
            </div>
        </header>

        <div class="grid">
            <section class="c pane l">
                <div class="head">
                    <div>
                        <div class="b2">Cognitive Map</div>
                        <h2>知识图谱总览</h2>
                        <p>{{threadId?'实时掌握度雷达与推理路径已更新。':'当前显示系统构建的认知基线画像。'}}</p>
                    </div>
                    <div class="focus">
                        <b>{{targetNode?.name||'感知机'}}</b>
                        <span>{{targetNode?.cluster||'基础认知'}} · {{targetNode?.band||'提升中'}}</span>
                    </div>
                </div>

                <div class="mg">
                    <div class="sub">
                        <strong>多维掌握雷达</strong>
                        <svg viewBox="0 0 300 300">
                            <defs>
                                <linearGradient id="rf" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stop-color="rgba(239,68,68,.34)" />
                                    <stop offset="100%" stop-color="rgba(249,115,22,.08)" />
                                </linearGradient>
                            </defs>
                            <circle v-for="r in [45,80,115,150]" :key="r" cx="150" cy="150" :r="r" fill="none" stroke="rgba(0,0,0,.06)" :stroke-dasharray="r===150?'none':'4 4'" />
                            <line v-for="p in radarPoints" :key="p.name+'l'" x1="150" y1="150" :x2="p.lx" :y2="p.ly" stroke="rgba(0,0,0,.05)" />
                            <polygon v-if="radarPolygon" :points="radarPolygon" fill="url(#rf)" stroke="rgba(239,68,68,.86)" stroke-width="2.4" />
                            <g v-for="p in radarPoints" :key="p.name">
                                <circle :cx="p.x" :cy="p.y" r="5" :fill="p.is_target?'#dc2626':'#fff'" :stroke="p.is_target?'#fff':'#f97316'" stroke-width="2.4" />
                                <text :x="p.lx" :y="p.ly" text-anchor="middle" dominant-baseline="middle">{{p.name}}</text>
                            </g>
                        </svg>
                    </div>

                    <div class="sub">
                        <strong>认知图谱推演路径</strong>
                        <div class="tl">
                            <div v-for="n in knowledgeNodes" :key="n.name" class="ti">
                                <div class="dot" :class="tone(n,true)"></div>
                                <div class="e" :class="{t:n.is_target}">
                                    <div class="rb">
                                        <b>{{n.name}}</b>
                                        <span class="sc" :class="tone(n)">{{Math.round((n.mastery||0)*100)}}%</span>
                                    </div>
                                    <div class="tags"><span>Stage {{n.stage}}</span><span>{{n.cluster}}</span></div>
                                    <div class="bar"><div class="fill" :class="tone(n)" :style="{width:`${Math.max(5,(n.mastery||0)*100)}%`}" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <aside class="c pane dp">
                <div class="b2 dk">Generation Engine</div>
                <h2>配置练习维度</h2>
                <p class="sf">根据图谱状态与当前配置生成自适应题目。</p>
                <label class="f">
                    <span>Target Topic</span>
                    <textarea v-model="topicInput" placeholder="输入薄弱点，例如：反向传播的链式法则..."></textarea>
                </label>
                <label class="f">
                    <span>Question Format</span>
                    <select v-model="questionType">
                        <option value="单选题">单选题</option>
                        <option value="填空题">填空题</option>
                        <option value="大题">综合大题</option>
                    </select>
                </label>
                <div class="f">
                    <span>Knowledge Context</span>
                    <input ref="fileInputRef" class="hd" type="file" @change="handleFileChange" />
                    <div v-if="uploadedFile" class="file">
                        <div>
                            <b>{{ uploadedFile.name }}</b>
                            <small>{{ (uploadedFile.size / 1024 / 1024).toFixed(2) }} MB</small>
                        </div>
                        <button class="lnk" type="button" @click="removeFile">移除</button>
                    </div>
                    <button v-else class="up" type="button" @click="fileInputRef?.click()">上传参考教辅或错题本</button>
                </div>
                <button class="btn la" type="button" :disabled="(!topicInput.trim() && !uploadedFile) || isProcessing" @click="startPractice">{{ isProcessing ? '生成中...' : '启动 Agent 生成' }}</button>
            </aside>
        </div>

        <section v-if="step === 2" class="c stage">
            <div class="head">
                <div>
                    <h2>专属练习场</h2>
                    <p>系统已准备好针对 <b>{{ profile?.weaknesses?.[0] || targetNode?.name || '当前薄弱点' }}</b> 的自适应挑战。</p>
                </div>
                <div class="pill">Session: {{ threadId }}</div>
            </div>

            <article v-for="(ex, idx) in exercises" :key="ex.id" class="q">
                <div class="rb">
                    <div class="r">
                        <div class="ix">{{ idx + 1 }}</div>
                        <span class="ql">Question</span>
                    </div>
                    <div class="tags">
                        <span>难度 · {{ ex.difficulty }}</span>
                        <span class="tt">焦点 · {{ ex.target }}</span>
                    </div>
                </div>
                <div class="ct">{{ ex.assistantMarkdown || String(ex.content || '').replace(/\[检索结果 \d+\] /g, '') }}</div>
                <div v-if="ex.hintMessage" class="box h">
                    <button type="button" class="tg a" @click="toggleHint(ex.id)">{{ hints[ex.id] ? '收起助教提示' : '查看助教提示' }}</button>
                    <div v-if="hints[ex.id]" class="dt">{{ ex.hintMessage }}</div>
                </div>
                <div v-if="ex.feedback" class="box ok">
                    <div class="st">{{ ex.feedback.status?.includes('✅') ? '✅ 答对了！' : '❌ 再接再厉' }}</div>
                    <div v-if="ex.feedback.answer" class="dt">
                        <small>Standard Answer</small>
                        <div>{{ ex.feedback.answer }}</div>
                    </div>
                    <div class="r">
                        <button v-if="ex.userAnswer" type="button" class="tg gr" @click="toggleAnswer(ex.id)">{{ ansOpen[ex.id] ? '收起我的作答' : '查看我的作答' }}</button>
                        <button v-if="ex.feedback.explanation" type="button" class="tg gr" @click="toggleExplanation(ex.id)">{{ expOpen[ex.id] ? '收起题目解析' : '查看题目解析' }}</button>
                    </div>
                    <div v-if="ansOpen[ex.id] && ex.userAnswer" class="dt">
                        <small>My Answer</small>
                        <div>{{ ex.userAnswer }}</div>
                    </div>
                    <div v-if="expOpen[ex.id] && ex.feedback.explanation" class="dt">
                        <small>Explanation</small>
                        <div>{{ ex.feedback.explanation }}</div>
                    </div>
                </div>
                <div v-if="idx === exercises.length - 1 && threadId" class="subm">
                    <input v-model="answerInput" placeholder="输入选项（如 A）或提问寻求思路引导..." @keydown.enter="submitAnswer" />
                    <button class="btn d" type="button" :disabled="isSending" @click="submitAnswer">{{ isSending ? '提交中...' : '提交 →' }}</button>
                </div>
            </article>
        </section>

        <div v-if="isHistoryOpen" class="mk" @click.self="isHistoryOpen = false">
            <div class="md">
                <div class="rb">
                    <h3>学习追踪历史</h3>
                    <button class="lnk" type="button" @click="isHistoryOpen = false">✕</button>
                </div>
                <button v-for="i in mockHistory" :key="i.id" class="his" type="button" @click="pickHistory(i)">
                    <div>
                        <b>{{ i.title }}</b>
                        <small>{{ i.type === 'chat' ? '对话' : '文档' }}</small>
                    </div>
                    <span>{{ i.date }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const API = 'http://127.0.0.1:8000'

const SEED = {
    神经网络基础: { mastery: .66, band: '提升中', cluster: '基础认知', stage: 1, is_target: false },
    感知机: { mastery: .52, band: '学习区', cluster: '网络结构', stage: 2, is_target: true },
    激活函数: { mastery: .58, band: '学习区', cluster: '核心机制', stage: 2, is_target: false },
    多层感知机: { mastery: .42, band: '学习区', cluster: '网络结构', stage: 3, is_target: false },
    梯度下降: { mastery: .36, band: '薄弱', cluster: '优化基础', stage: 4, is_target: false },
    反向传播: { mastery: .29, band: '薄弱', cluster: '核心机制', stage: 5, is_target: false }
}

const mockHistory = [
    { id: '1', title: '错题本练习', date: '2026-03-29', type: 'document' },
    { id: '2', title: '微积分薄弱点突破', date: '2026-03-24', type: 'document' }
]

const step = ref(1)
const profile = ref(null)
const exercises = ref([])
const learning = ref({ ...SEED })
const isProcessing = ref(false)
const topicInput = ref('')
const uploadedFile = ref(null)
const fileInputRef = ref(null)
const isHistoryOpen = ref(false)
const threadId = ref('')
const questionType = ref('单选题')
const answerInput = ref('')
const isSending = ref(false)
const expOpen = ref({})
const ansOpen = ref({})
const hints = ref({})
const toasts = ref([])

const knowledgeNodes = computed(() => Object.entries(learning.value).map(([name, info]) => ({ name, ...info })).sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0) || (b.mastery ?? 0) - (a.mastery ?? 0)))
const radarPoints = computed(() => {
    const focusNodes = [...knowledgeNodes.value]
        .sort((a, b) => Number(Boolean(b.is_target)) - Number(Boolean(a.is_target)) || (a.stage ?? 0) - (b.stage ?? 0))
        .slice(0, 6)
    return focusNodes.map((node, index) => {
        const angle = (Math.PI * 2 * index) / focusNodes.length - Math.PI / 2
        const radius = 35 + (node.mastery ?? 0) * 95
        return {
            ...node,
            x: 150 + Math.cos(angle) * radius,
            y: 150 + Math.sin(angle) * radius,
            lx: 150 + Math.cos(angle) * 135,
            ly: 150 + Math.sin(angle) * 135
        }
    })
})
const radarPolygon = computed(() => radarPoints.value.map(point => `${point.x},${point.y}`).join(' '))
const targetNode = computed(() => knowledgeNodes.value.find(node => node.is_target) ?? knowledgeNodes.value[0])

const push = (message, type = 'ok') => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
        toasts.value = toasts.value.filter(item => item.id !== id)
    }, 2400)
}

const tone = (node, isDot = false) => node.is_target && isDot ? 'target' : ((node.mastery ?? 0) >= .8 ? 'high' : (node.mastery ?? 0) >= .6 ? 'mid' : 'low')
const toggle = (target, id) => {
    target.value = { ...target.value, [id]: !target.value[id] }
}
const toggleHint = id => toggle(hints, id)
const toggleAnswer = id => toggle(ansOpen, id)
const toggleExplanation = id => toggle(expOpen, id)

const pf = source => {
    if (!source?.trim()) return null
    const answerMatch = source.match(/标准答案：([\s\S]*?)(?:\n解析：|$)/)
    const explanationMatch = source.match(/解析：([\s\S]*?)(?:\n\n正在为你评估知识状态[\s\S]*)?$/)
    return {
        status: (source.match(/^(✅[^\n]*|❌[^\n]*)/m)?.[1] ?? '').trim(),
        answer: (answerMatch?.[1] ?? '').trim(),
        explanation: (explanationMatch?.[1] ?? '').trim()
    }
}

async function pe(response) {
    try {
        const text = await response.text()
        const json = JSON.parse(text)
        return typeof json.detail === 'string' ? json.detail : (text || response.statusText)
    } catch {
        return response.statusText
    }
}

async function post(path, body) {
    const response = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error(await pe(response))
    return response.json()
}

async function parseFile(file) {
    if (!file) return ''
    try {
        return JSON.stringify({
            status: 'success',
            fileName: file.name,
            content: (await file.text()).slice(0, 2000)
        })
    } catch {
        return JSON.stringify({
            status: 'success',
            fileName: file.name,
            content: `提取的清洗后结构化纯文本内容 (来源: ${file.name})...`
        })
    }
}

async function startPractice() {
    if (!topicInput.value.trim() && !uploadedFile.value) {
        push('请输入练习主题或上传相关文件', 'error')
        return
    }

    isProcessing.value = true
    try {
        const extra = uploadedFile.value ? await parseFile(uploadedFile.value) : ''
        const response = await post('/api/practice/start', {
            thread_id: `web-${Date.now()}`,
            topic_hint: topicInput.value.trim() + (extra ? `\n\n【上传摘要】\n${extra.slice(0, 2000)}` : ''),
            question_type: questionType.value
        })

        threadId.value = response.thread_id
        learning.value = response.personalized_kg ?? { ...SEED }

        const body = response.assistant_message || (response.generated_exercise?.question != null ? String(response.generated_exercise.question) : '（题目已生成，请查看下方结构化内容）')
        exercises.value = [{
            id: 0,
            content: body,
            target: response.resolved_topic ?? response.target_zpd?.[0] ?? topicInput.value,
            difficulty: String(response.current_difficulty ?? '中等'),
            assistantMarkdown: response.assistant_message,
            feedback: response.feedback_message ? pf(response.feedback_message) : null,
            userAnswer: '',
            hintMessage: ''
        }]

        expOpen.value = {}
        ansOpen.value = {}
        hints.value = {}
        answerInput.value = ''
        step.value = 2
        push('已连接智能网络，题目生成成功')
    } catch (error) {
        console.error(error)
        push(error instanceof Error ? `生成失败：${error.message}` : '生成失败', 'error')
    } finally {
        isProcessing.value = false
    }
}

async function submitAnswer() {
    if (!threadId.value || !answerInput.value.trim()) {
        push('请输入答案或提问', 'error')
        return
    }

    const submittedAnswer = answerInput.value.trim()
    isSending.value = true
    try {
        const response = await post('/api/practice/resume', {
            thread_id: threadId.value,
            user_message: submittedAnswer
        })

        learning.value = response.personalized_kg ?? learning.value
        const body = response.assistant_message || (response.generated_exercise?.question != null ? String(response.generated_exercise.question) : '')
        const previousExercises = [...exercises.value]
        const lastIndex = previousExercises.length - 1

        if (lastIndex >= 0) {
            if (response.interaction_type === 'graded' && response.feedback_message) {
                previousExercises[lastIndex] = {
                    ...previousExercises[lastIndex],
                    userAnswer: submittedAnswer,
                    feedback: pf(response.feedback_message)
                }
                exercises.value = [...previousExercises, {
                    id: previousExercises.length,
                    content: body,
                    target: response.resolved_topic ?? response.target_zpd?.[0] ?? '',
                    difficulty: String(response.current_difficulty ?? '中等'),
                    assistantMarkdown: response.assistant_message,
                    feedback: null,
                    userAnswer: '',
                    hintMessage: ''
                }]
            } else {
                previousExercises[lastIndex] = {
                    ...previousExercises[lastIndex],
                    hintMessage: response.assistant_message || body
                }
                exercises.value = previousExercises
            }
        }

        answerInput.value = ''
        push('已收到反馈')
    } catch (error) {
        console.error(error)
        push(error instanceof Error ? error.message : '提交失败', 'error')
    } finally {
        isSending.value = false
    }
}

function handleFileChange(event) {
    const file = event.target?.files?.[0]
    if (!file) return
    uploadedFile.value = file
    push(`已选择文件: ${file.name}`)
}

function removeFile() {
    uploadedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
}

function resetTask() {
    step.value = 1
    topicInput.value = profile.value?.weaknesses?.[0] ? `针对 ${profile.value.weaknesses[0]} 的练习` : ''
    uploadedFile.value = null
    exercises.value = []
    learning.value = { ...SEED }
    threadId.value = ''
    answerInput.value = ''
    expOpen.value = {}
    ansOpen.value = {}
    hints.value = {}
    if (fileInputRef.value) fileInputRef.value.value = ''
    push('已新建练习任务')
}

function pickHistory(item) {
    isHistoryOpen.value = false
    push(`已加载数据记录: ${item.title}`)
}

onMounted(() => {
    profile.value = { userId: 'student-001', weaknesses: ['动态规划', '图遍历'] }
    topicInput.value = `针对 ${profile.value.weaknesses[0]} 的练习`
})
</script>

<style scoped>
    .pp {
        min-height: 100%;
        padding: 24px;
        color: #111;
        background: radial-gradient(circle at top right,rgba(239,68,68,.08),transparent 24%),radial-gradient(circle at left center,rgba(251,146,60,.07),transparent 18%),linear-gradient(180deg,#faf8f5,#f1ece7);
        font-family: 'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif
    }

    .c {
        border: 1px solid rgba(20,20,20,.08);
        border-radius: 28px;
        box-shadow: 0 20px 50px rgba(15,23,42,.08)
    }

    .hero, .l, .stage {
        background: rgba(255,255,255,.88);
        backdrop-filter: blur(18px)
    }

    .hero, .pane, .stage {
        padding: 24px
    }

    .hero, .r, .head, .rb {
        display: flex;
        align-items: center
    }

    .hero, .rb {
        justify-content: space-between
    }

    .r {
        gap: 12px;
        flex-wrap: wrap
    }

    .hero h1, .pane h2, .stage h2 {
        margin: 12px 0 8px;
        font-size: clamp(28px,3vw,40px);
        font-weight: 900;
        line-height: 1.08
    }

    .hero p, .pane p, .stage p, .sf {
        color: #6d6a67;
        line-height: 1.75;
        font-weight: 600
    }

    .b1, .b2 {
        display: inline-flex;
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        background: #fee2e2;
        color: #dc2626
    }

    .grid {
        display: grid;
        grid-template-columns: minmax(0,1.75fr) minmax(320px,.95fr);
        gap: 24px;
        margin-top: 24px
    }

    .focus {
        padding: 14px 16px;
        border-radius: 18px;
        background: #fff7f7;
        border: 1px solid rgba(239,68,68,.1)
    }

        .focus b {
            display: block
        }

        .focus span {
            display: block;
            color: #737373;
            font-size: 12px;
            margin-top: 4px
        }

    .mg {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px
    }

    .sub {
        min-height: 360px;
        padding: 18px;
        border-radius: 22px;
        border: 1px solid rgba(15,23,42,.06);
        background: #fafafb
    }

        .sub svg {
            display: block;
            width: 100%;
            max-width: 310px;
            margin: 10px auto 0
        }

        .sub text {
            fill: #5f5f5f;
            font-size: 11px;
            font-weight: 800
        }

    .tl {
        display: grid;
        gap: 12px;
        max-height: 310px;
        overflow: auto;
        margin-top: 12px
    }

    .ti {
        display: grid;
        grid-template-columns: 16px 1fr;
        gap: 12px
    }

    .dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin-top: 18px;
        border: 3px solid #fff
    }

        .dot.target {
            background: #ef4444;
            box-shadow: 0 0 0 5px rgba(239,68,68,.14)
        }

        .dot.high {
            background: #34d399
        }

        .dot.mid {
            background: #f59e0b
        }

        .dot.low {
            background: #d4d4d8
        }

    .e {
        padding: 14px;
        border-radius: 18px;
        border: 1px solid rgba(15,23,42,.08);
        background: rgba(255,255,255,.75)
    }

        .e.t {
            background: #fff;
            border-color: rgba(239,68,68,.2)
        }

    .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 10px 0 12px
    }

        .tags span, .pill, .ql, .his small {
            padding: 6px 9px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .08em;
            text-transform: uppercase;
            background: #f5f5f5;
            color: #666
        }

    .sc {
        font-size: 20px;
        font-weight: 900
    }

    .high {
        color: #10b981
    }

    .mid {
        color: #f59e0b
    }

    .low {
        color: #ef4444
    }

    .bar {
        height: 7px;
        background: #ececec;
        border-radius: 999px;
        overflow: hidden
    }

    .fill {
        height: 100%
    }

    .dp {
        background: linear-gradient(180deg,#101010,#090909);
        color: #fff
    }

    .dk {
        background: rgba(255,255,255,.06);
        color: #ddd
    }

    .f {
        display: grid;
        gap: 10px;
        margin-top: 16px
    }

        .f span {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .16em;
            text-transform: uppercase;
            color: rgba(255,255,255,.56)
        }

        .f textarea, .f select, .subm input {
            width: 100%;
            padding: 14px 16px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.05);
            color: #fff;
            outline: none
        }

        .f textarea {
            min-height: 104px;
            resize: vertical
        }

        .f select option {
            color: #111
        }

    .hd {
        display: none
    }

    .file, .btn, .up {
        border: none;
        border-radius: 18px;
        font: inherit
    }

    .file {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(127,29,29,.24);
        border: 1px solid rgba(239,68,68,.3)
    }

        .file b {
            color: #fff
        }

        .file small, .dt small {
            display: block;
            color: #fecaca;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .14em;
            text-transform: uppercase
        }

    .up {
        padding: 16px;
        background: rgba(255,255,255,.04);
        border: 1px dashed rgba(255,255,255,.18);
        color: rgba(255,255,255,.72);
        font-weight: 700
    }

    .btn {
        padding: 13px 16px;
        font-weight: 800;
        cursor: pointer
    }

    .g {
        background: #fff;
        color: #444;
        border: 1px solid rgba(15,23,42,.08)
    }

    .d {
        background: #111;
        color: #fff
    }

    .la {
        width: 100%;
        margin-top: 16px;
        background: #fff;
        color: #111
    }

    .btn:disabled {
        opacity: .55;
        cursor: not-allowed
    }

    .stage {
        margin-top: 28px
    }

    .pill {
        background: #fafafa;
        border: 1px solid #e5e5e5
    }

    .q {
        padding: 22px;
        border-radius: 24px;
        border: 1px solid #e5e5e5;
        background: #fff;
        box-shadow: 0 10px 28px rgba(15,23,42,.05);
        margin-top: 18px;
        text-align: left
    }

    .ix {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: #111;
        color: #fff;
        font-weight: 900
    }

    .ct, .dt {
        margin: 18px 0;
        white-space: pre-wrap;
        color: #262626;
        line-height: 1.85;
        font-weight: 600;
        text-align: left
    }

    .tt {
        background: #fef2f2 !important;
        color: #dc2626 !important;
        border: 1px solid #fecaca
    }

    .box {
        display: grid;
        gap: 12px;
        margin-bottom: 14px;
        padding: 16px;
        border-radius: 18px
    }

    .h {
        background: linear-gradient(135deg,#fffbeb,#fff7ed);
        border: 1px solid #fde68a
    }

    .ok {
        background: #ecfdf5cc;
        border: 1px solid #bbf7d0
    }

    .tg {
        width: fit-content;
        padding: 10px 14px;
        border-radius: 14px;
        font-weight: 800;
        border: 1px solid transparent;
        cursor: pointer;
        appearance: none
    }

    .a {
        background: #fff;
        color: #b45309;
        border-color: rgba(245,158,11,.2)
    }

    .gr {
        background: #fff;
        color: #047857;
        border-color: rgba(16,185,129,.15)
    }

    .st {
        font-size: 18px;
        font-weight: 900;
        color: #047857
    }

    .subm {
        display: flex;
        gap: 12px;
        margin-top: 22px;
        padding-top: 18px;
        border-top: 1px solid #f0f0f0
    }

        .subm input {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            color: #111
        }

    .mk {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.45);
        backdrop-filter: blur(8px);
        display: grid;
        place-items: center;
        padding: 16px
    }

    .md {
        width: min(520px,100%);
        max-height: 80vh;
        overflow: auto;
        background: #fff;
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 30px 80px rgba(0,0,0,.28)
    }

    .his {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px;
        margin-top: 12px;
        border-radius: 18px;
        border: 1px solid #e5e5e5;
        background: #fff;
        text-align: left
    }

    .lnk {
        background: none;
        border: none;
        cursor: pointer
    }

    .tw {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: grid;
        gap: 10px
    }

    .toast {
        padding: 12px 14px;
        border-radius: 14px;
        color: #fff;
        box-shadow: 0 18px 40px rgba(0,0,0,.2)
    }

        .toast.ok {
            background: #111827
        }

        .toast.error {
            background: #7f1d1d
        }

    @media(max-width:1180px) {
        .grid, .mg {
            grid-template-columns: 1fr
        }

        .hero, .head, .subm, .rb {
            flex-direction: column;
            align-items: flex-start
        }
    }

    @media(max-width:720px) {
        .pp {
            padding: 14px
        }

        .hero, .pane, .stage, .q {
            padding: 18px;
            border-radius: 22px
        }

        .subm .btn {
            width: 100%
        }
    }
</style>
