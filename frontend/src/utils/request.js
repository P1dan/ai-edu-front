// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router' // 确保你有 router 实例导出

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 所有请求自动加 /api 前缀，如 '/api/auth/login'
  timeout: 10000,  // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动加 JWT
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误 & 401
request.interceptors.response.use(
  (response) => {
    // 如果后端返回 { code: 200, data: ... } 这种结构，可在这里统一解包
    // 但假设你的接口直接返回 data，所以直接返回 response
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '请求失败'

    if (status === 401) {
      // Token 无效或过期
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('access_token')
      router.push('/') // 跳转到登录页
    } else if (status === 403) {
      ElMessage.error('权限不足')
    } else if (status >= 500) {
      ElMessage.error('服务器开小差了，请稍后再试')
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

export default request