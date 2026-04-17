<template>
  <div class="agents-page scrollable-page">
    <div class="agents-layout">
      <aside class="agents-sidebar">
        <nav class="agents-nav" aria-label="智能体选择">
          <button
            v-for="agent in agents"
            :key="agent.id"
            type="button"
            class="agent-nav-item"
            :class="{ active: currentAgentId === agent.id }"
            @click="selectAgent(agent.id)"
          >
            <el-icon class="agent-nav-item__icon">
              <component :is="agent.icon" />
            </el-icon>
            <div class="agent-nav-item__body">
              <span class="agent-nav-item__title">{{ agent.title }}</span>
              <span
                v-show="currentAgentId === agent.id"
                class="agent-nav-item__desc"
              >
                {{ agent.description }}
              </span>
            </div>
          </button>
        </nav>
      </aside>

      <main class="agents-content">
        <component v-if="currentAgent" :is="currentAgent.component" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChatDotRound, MagicStick, Guide, Document } from '@element-plus/icons-vue'
import ChatAgent from '../agents/chat.vue'
import LearningPlanAgent from '../agents/learningplan.vue'
import PptAgent from '../agents/ppt.vue'
import PersonalizedPractice from '../agents/PersonalizedPractice.vue'

const currentAgentId = ref('qa')

const agents = [
  {
    id: 'qa',
    title: 'AI 智能问答',
    description: '快速获取问题答案、知识解析和学习建议。',
    icon: ChatDotRound,
    component: ChatAgent
  },
  {
    id: 'recommend',
    title: '个性化练习',
    description: '基于学习画像生成个性化的练习题',
    icon: MagicStick,
    component: PersonalizedPractice
  },
  {
    id: 'learningplan',
    title: '学习路径规划',
    description: '生成定制化学习计划，系统化进步。',
    icon: Guide,
    component: LearningPlanAgent
  },
  {
    id: 'ppt',
    title: 'AI PPT 生成',
    description: '自动生成教学或汇报所需幻灯片内容。',
    icon: Document,
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
  padding: 20px 24px;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  box-sizing: border-box;
}

.agents-layout {
  display: flex;
  gap: 16px;
  min-height: 0;
  flex: 1;
  align-items: stretch;
}

.agents-sidebar {
  width: 228px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.agents-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
}

.agent-nav-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: #909399;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.agent-nav-item:hover {
  background: rgba(64, 158, 255, 0.06);
  color: #606266;
}

.agent-nav-item:hover .agent-nav-item__icon {
  color: #409eff;
}

.agent-nav-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.agent-nav-item.active .agent-nav-item__icon {
  color: #409eff;
}

.agent-nav-item__icon {
  flex-shrink: 0;
  font-size: 20px;
  margin-top: 1px;
  color: inherit;
  transition: color 0.2s ease;
}

.agent-nav-item__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agent-nav-item__title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: inherit;
}

.agent-nav-item.active .agent-nav-item__title {
  font-weight: 600;
  color: #409eff;
}

.agent-nav-item:not(.active) .agent-nav-item__title {
  color: #606266;
}

.agent-nav-item__desc {
  font-size: 12px;
  line-height: 1.45;
  color: #909399;
  font-weight: 400;
}

.agent-nav-item.active .agent-nav-item__desc {
  color: #79bbff;
}

.agents-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.agents-content > * {
  flex: 1;
  min-height: 0;
}

@media (max-width: 720px) {
  .agents-layout {
    flex-direction: column;
  }

  .agents-sidebar {
    width: 100%;
  }

  .agents-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .agent-nav-item {
    flex: 1 1 calc(50% - 4px);
    min-width: 140px;
  }
}
</style>
