<template>
  <div class="home-page">
    <section class="hero">
      <div>
        <h1>欢迎来到AI教育智能体</h1>
        <p>智能推荐学习内容，实时消息提醒，助你高效完成学习任务。</p>
      </div>
      <router-link to="/chat" class="primary-button">开始与AI助手对话</router-link>
    </section>

    <section class="cards-row">
      <div class="card">
        <h2>推荐课程</h2>
        <ul>
          <li>AI基础入门</li>
          <li>自然语言处理实战</li>
          <li>教育场景智能应用</li>
        </ul>
      </div>
      <div class="card">
        <h2>最新消息</h2>
        <ul>
          <li>系统已更新为更智能的学习推荐引擎。</li>
          <li>新增“知识点测试”功能，快来体验。</li>
          <li>优化了对话速度，学习更加流畅。</li>
        </ul>
      </div>
      <div class="card">
        <h2>快速入口</h2>
        <ul>
          <li>智能问答</li>
          <li>学习记录</li>
          <li>设置中心</li>
        </ul>
      </div>
    </section>

    <section class="news-panel">
      <h2>今日推荐</h2>
      <div class="news-item">
        <div>
          <h3>AI助教陪练</h3>
          <p>一对一智能问答，帮助你快速理解知识点，巩固学习成果。</p>
        </div>
        <router-link to="/chat">前往体验</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  color: #2c3e50;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: #f5f8ff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(58, 88, 152, 0.08);
  gap: 20px;
  flex-wrap: wrap;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 2rem;
}

.hero p {
  margin: 0;
  color: #4d5f80;
  max-width: 520px;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  padding: 12px 22px;
  background: #4f6cff;
  color: #fff;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 6px 22px rgba(59, 84, 129, 0.08);
}

.card h2 {
  margin: 0 0 14px;
  font-size: 1.15rem;
}

.card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.card li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f3fb;
  color: #475669;
}

.card li:last-child {
  border-bottom: none;
}

.news-panel {
  margin-top: 28px;
}

.news-panel h2 {
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.news-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #eff4ff 0%, #ffffff 100%);
  border: 1px solid #dde8ff;
  border-radius: 16px;
  padding: 22px;
}

.news-item h3 {
  margin: 0 0 8px;
}

.news-item p {
  margin: 0;
  color: #5b6a85;
}

.news-item a {
  color: #4f6cff;
  font-weight: 600;
  text-decoration: none;
}
</style>
