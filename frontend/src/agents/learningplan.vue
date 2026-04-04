<template>
  <div class="agent-panel">
    <div class="agent-top">
      <h2>学习路径规划</h2>
      <p>为你设计学习节奏、难度与知识点衔接，保持高效进度。</p>
    </div>

    <div class="plan-card">
      <div class="plan-step" v-for="step in planSteps" :key="step.title">
        <div class="step-index">{{ step.index }}</div>
        <div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const planSteps = [
  {
    index: '1',
    title: '目标确认',
    description: '先了解你的学习目标、课程进度以及想达成的能力。'
  },
  {
    index: '2',
    title: '知识拆解',
    description: '把目标内容拆成知识模块，安排阶段性任务。'
  },
  {
    index: '3',
    title: '实践打磨',
    description: '结合练习题与项目练习巩固学习成果。'
  }
]
</script>

<style scoped>
.agent-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.agent-top h2 {
  margin-bottom: 8px;
  font-size: 24px;
}

.agent-top p {
  color: #556179;
}

.plan-card {
  padding: 20px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e9f0ff;
}

.plan-step {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #e6eef8;
}

.plan-step:last-child {
  border-bottom: none;
}

.step-index {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4f6cff;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.plan-step h3 {
  margin-bottom: 6px;
}

.plan-step p {
  color: #6d7d96;
  line-height: 1.75;
}
</style>
