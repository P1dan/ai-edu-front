// utils/markdown.js
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // 或你喜欢的主题

// 配置 marked 支持高亮
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  langPrefix: 'hljs language-' // 确保 class 兼容 hljs
})

export function renderMarkdown(text) {
  return marked.parse(text || '')
}