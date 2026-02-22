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
// 响应拦截器：统一处理 ApiResponse 结构
request.interceptors.response.use(
  (response) => {
    const res = response.data; // 后端返回的是 { success, code, message, data, timestamp }

    // 如果是业务成功（注意：这里用业务 code 判断，不是 HTTP status）
    if (res.success === true || (typeof res.code === 'number' && res.code >= 200 && res.code < 300)) {
      // 直接返回 data，调用方拿到的就是真正的业务数据
      return res.data;
    } else {
      // 业务逻辑错误，比如参数校验失败、用户不存在等
      ElMessage.error(res.message || '操作失败');
      // 抛出错误，让调用方 catch 处理（如果需要）
      return Promise.reject(new Error(res.message || 'Request failed'));
    }
  },
  (error) => {
    // 网络错误、超时、HTTP 非 2xx（如 500、404）等
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '网络错误';

    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('access_token');
      router.push('/');
    } else if (status === 403) {
      ElMessage.error('权限不足');
    } else if (status >= 500) {
      ElMessage.error('服务器开小差了，请稍后再试');
    } else {
      ElMessage.error(message);
    }

    return Promise.reject(error);
  }
);

export default request