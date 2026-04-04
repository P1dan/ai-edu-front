<template>
  <div class="agent-panel">
    <div class="agent-top">
      <h2>AI PPT生成</h2>
      <p>智能生成学习汇报、课堂展示和教学材料的幻灯片大纲。</p>
    </div>

    <div class="ppt-card">
      <div class="ppt-item">
        <h3>自动生成大纲</h3>
        <p>输入主题后，AI 会生成一个完整的 PPT 结构与要点。</p>
      </div>
      <div class="ppt-item">
        <h3>适配学习场景</h3>
        <p>支持课程讲解、复习总结和研究报告三种模式。</p>
      </div>
      <div class="ppt-item">
        <h3>一键输出</h3>
        <p>快速导出幻灯片文本内容，可直接用于编辑与展示。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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

.ppt-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.ppt-item {
  padding: 20px;
  border-radius: 18px;
  background: #fff8f6;
  border: 1px solid #ffe5dc;
}

.ppt-item h3 {
  margin-bottom: 10px;
}

.ppt-item p {
  color: #6d7d96;
  line-height: 1.7;
}
</style>
