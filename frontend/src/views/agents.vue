<template>
  <div class="agents-page scrollable-page">
    <div class="agents-layout">
      <aside class="agents-menu">
        <div
          v-for="agent in agents"
          :key="agent.id"
          class="agent-menu-item"
          :class="{ active: currentAgentId === agent.id }"
          @click="selectAgent(agent.id)">
          <div class="agent-title">{{ agent.title }}</div>
          <div class="agent-desc">{{ agent.description }}</div>
        </div>
      </aside>

      <main class="agents-content">
        <component v-if="currentAgent" :is="currentAgent.component" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChatAgent from '../agents/chat.vue'
import RecommendAgent from '../agents/recommend.vue'
import LearningPlanAgent from '../agents/learningplan.vue'
import PptAgent from '../agents/ppt.vue'

const currentAgentId = ref('qa')

const agents = [
  {
    id: 'qa',
    title: 'AI智能问答',
    description: '快速获取问题答案、知识解析和学习建议。',
    component: ChatAgent
  },
  {
    id: 'recommend',
    title: '个性化推荐',
    description: '基于你的学习画像推荐课程与练习内容。',
    component: RecommendAgent
  },
  {
    id: 'learningplan',
    title: '学习路径规划',
    description: '生成定制化学习计划，帮助你系统化进步。',
    component: LearningPlanAgent
  },
  {
    id: 'ppt',
    title: 'AI PPT生成',
    description: '自动生成教学或学习汇报所需幻灯片内容。',
    component: PptAgent
  }
]

const currentAgent = computed(() => agents.find((item) => item.id === currentAgentId.value))

const selectAgent = (id) => {
  currentAgentId.value = id
}
</script>

<style scoped>
.agents-page {
  padding: 24px;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.agents-layout {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 48px);
  align-items: stretch;
  height: 100%;
}

.agents-menu {
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.agent-menu-item {
  padding: 18px 16px;
  border-radius: 16px;
  background: #f7f9ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-menu-item:hover {
  transform: translateX(2px);
  background: #eef2ff;
}

.agent-menu-item.active {
  border: 1px solid #4f6cff;
  background: #ffffff;
}

.agent-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.agent-desc {
  color: #6d7d96;
  font-size: 14px;
}

.agents-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 10px 32px rgba(53, 87, 170, 0.08);
  display: flex;
  flex-direction: column;
}

.agents-content > * {
  flex: 1;
  min-height: 0;
}

.agent-menu-item {
  padding: 18px 16px;
  border-radius: 16px;
  background: #f7f9ff;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 96px;
}
</style>
