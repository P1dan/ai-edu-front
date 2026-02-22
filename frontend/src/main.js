import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入路由
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/atom-one-light.css' // 代码高亮主题

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')