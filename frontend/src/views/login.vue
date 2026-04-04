<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="auth-card__head">
        <div class="auth-card__brand">
          <el-icon class="auth-card__brand-icon" :size="22">
            <UserFilled />
          </el-icon>
          <div class="auth-card__brand-text">
            <h1 class="auth-card__title">
              {{ isLogin ? '用户登录' : '用户注册' }}
            </h1>
            <p class="auth-card__hint">
              {{ isLogin ? '使用邮箱登录 AI 教育平台' : '填写信息完成注册' }}
            </p>
          </div>
        </div>
        <el-button link type="primary" class="auth-card__switch" @click="toggleMode">
          {{ isLogin ? '去注册' : '去登录' }}
        </el-button>
      </header>

      <div v-if="isLogin" class="auth-card__body">
        <el-radio-group v-model="loginType" class="auth-tabs">
          <el-radio-button label="password">密码登录</el-radio-button>
          <el-radio-button label="sms">验证码登录</el-radio-button>
        </el-radio-group>

        <el-form :model="loginForm" label-position="top" class="auth-form" @submit.prevent>
          <el-form-item label="邮箱">
            <el-input v-model="loginForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>

          <el-form-item v-if="loginType === 'password'" label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item v-if="loginType === 'sms'" label="验证码">
            <div class="auth-code-row">
              <el-input v-model="loginForm.code" placeholder="请输入验证码" class="auth-code-row__input" />
              <el-button :disabled="countdown > 0" @click="sendEmailCode('login')">
                {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-button type="primary" class="auth-submit" @click="handleLogin">登录</el-button>
        </el-form>
      </div>

      <div v-else class="auth-card__body">
        <el-form :model="registerForm" label-position="top" class="auth-form" @submit.prevent>
          <el-form-item label="邮箱">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20 位）"
              show-password
            />
          </el-form-item>

          <el-form-item label="验证码">
            <div class="auth-code-row">
              <el-input v-model="registerForm.code" placeholder="请输入验证码" class="auth-code-row__input" />
              <el-button :disabled="countdown > 0" @click="sendEmailCode('register')">
                {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-button type="primary" class="auth-submit" @click="handleRegister">注册</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()

const isLogin = ref(true)
const loginType = ref('password')
const countdown = ref(0)

const loginForm = reactive({
  email: '',
  password: '',
  code: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  code: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForms()
}

const resetForms = () => {
  loginForm.email = ''
  loginForm.password = ''
  loginForm.code = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.code = ''
  loginType.value = 'password'
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const sendEmailCode = async (type) => {
  const email = type === 'login' ? loginForm.email : registerForm.email
  if (!validateEmail(email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    await request.get('/auth/get-code', {
      params: { email }
    })
    ElMessage.success(`验证码已发送至 ${email}`)
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = async () => {
  const { email, password, code } = loginForm

  if (!validateEmail(email)) {
    ElMessage.error('邮箱格式错误')
    return
  }

  try {
    let response

    if (loginType.value === 'password') {
      if (!password || password.length < 6) {
        ElMessage.error('密码至少6位')
        return
      }
      response = await request.post('/auth/login', { email, password })
    } else {
      if (!code) {
        ElMessage.error('请输入验证码')
        return
      }
      response = await request.post('/auth/code-login', { email, code })
    }

    const { token } = response
    localStorage.setItem('access_token', token)
    ElMessage.success('登录成功！')
    await router.push('/index')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

const handleRegister = async () => {
  const { email, password, code } = registerForm

  if (!validateEmail(email)) {
    ElMessage.error('邮箱格式错误')
    return
  }
  if (!password || password.length < 6 || password.length > 20) {
    ElMessage.error('密码需为6-20位')
    return
  }
  if (!code) {
    ElMessage.error('请输入验证码')
    return
  }

  try {
    const response = await request.post('/auth/register', {
      email,
      password,
      code
    })
    const { token } = response
    localStorage.setItem('access_token', token)
    ElMessage.success('注册成功！')
  } catch (error) {
    console.error('注册失败:', error)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  box-sizing: border-box;
  background: #f5f7fa;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 28px 28px 32px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.auth-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.auth-card__brand {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.auth-card__brand-icon {
  flex-shrink: 0;
  color: #409eff;
  margin-top: 2px;
}

.auth-card__brand-text {
  min-width: 0;
}

.auth-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.35;
}

.auth-card__hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.auth-card__switch {
  flex-shrink: 0;
  font-weight: 500;
  padding: 0;
}

.auth-card__body {
  padding-top: 0;
}

.auth-tabs {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.auth-tabs :deep(.el-radio-button) {
  flex: 1;
}

.auth-tabs :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 8px !important;
  border: 1px solid #e4e7ed !important;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: none !important;
}

.auth-tabs :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.auth-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px;
}

.auth-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #ecf5ff;
  border-color: #b3d8ff !important;
  color: #409eff;
  font-weight: 500;
}

.auth-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  padding-bottom: 6px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.auth-code-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: 100%;
}

.auth-code-row__input {
  flex: 1;
  min-width: 0;
}

.auth-code-row :deep(.el-button) {
  flex-shrink: 0;
  border-radius: 10px;
}

.auth-submit {
  width: 100%;
  margin-top: 8px;
  height: 40px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
}
</style>
