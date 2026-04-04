<template>
  <div class="agent-panel">
    <div class="agent-top">
      <h2>个性化推荐</h2>
      <p>基于你的兴趣和学习目标，为你推荐最合适的课程和训练内容。</p>
    </div>

    <section class="recommend-list">
      <div class="recommend-card" v-for="item in recommendItems" :key="item.title">
        <div class="recommend-tag">{{ item.category }}</div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
const recommendItems = [
  {
    category: '强化训练',
    title: '算法能力提升课程',
    description: '推荐结合题目拆解与实战练习，帮助你提高编程解题能力。'
  },
  {
    category: '知识拓展',
    title: 'AI与教育应用专题',
    description: '适合希望了解智能教育系统、推荐算法和个性化学习的用户。'
  },
  {
    category: '技能进阶',
    title: '项目实战与PPT生成',
    description: '通过实战项目和自动化资料产出，提升学习效果与成果展示。'
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

.recommend-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.recommend-card {
  padding: 20px;
  border-radius: 18px;
  border: 1px solid #e8ecff;
  background: #fcfdff;
}

.recommend-tag {
  display: inline-block;
  margin-bottom: 10px;
  padding: 6px 10px;
  color: #3f5ccf;
  background: #eef2ff;
  border-radius: 999px;
  font-size: 12px;
}

.recommend-card h3 {
  margin-bottom: 10px;
}

.recommend-card p {
  color: #6d7d96;
  line-height: 1.7;
}
</style>
