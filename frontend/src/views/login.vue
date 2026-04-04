<template>
  <div class="container">
    <el-card class="box-card" style="width: 400px; margin: 50px auto;">
      <template #header>
        <div class="card-header">
          <span>{{ isLogin ? '用户登录' : '用户注册' }}</span>
          <el-button
            type="text"
            @click="toggleMode"
            style="float: right; padding: 3px 0"
          >
            {{ isLogin ? '去注册' : '去登录' }}
          </el-button>
        </div>
      </template>

      <!-- 登录表单 -->
      <div v-if="isLogin">
        <!-- 登录方式切换 -->
        <el-radio-group v-model="loginType" style="margin-bottom: 20px;">
          <el-radio-button label="password">密码登录</el-radio-button>
          <el-radio-button label="sms">验证码登录</el-radio-button>
        </el-radio-group>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" :label-width="80">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 密码登录 -->
        <el-form-item v-if="loginType === 'password'" label="密码" :label-width="80">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <!-- 验证码登录 -->
        <el-form-item v-if="loginType === 'sms'" label="验证码" :label-width="80">
          <el-input v-model="loginForm.code" placeholder="请输入验证码" style="width: 60%;" />
          <el-button
            :disabled="countdown > 0"
            @click="sendEmailCode('login')"
            style="margin-left: 10px;"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </el-button>
        </el-form-item>

        <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
      </div>

      <!-- 注册表单 -->
      <div v-else>
        <el-form-item label="邮箱" :label-width="80">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" :label-width="80">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（6-20位）"
            show-password
          />
        </el-form-item>

        <el-form-item label="验证码" :label-width="80">
          <el-input v-model="registerForm.code" placeholder="请输入验证码" style="width: 60%;" />
          <el-button
            :disabled="countdown > 0"
            @click="sendEmailCode('register')"
            style="margin-left: 10px;"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </el-button>
        </el-form-item>

        <el-button type="primary" @click="handleRegister" style="width: 100%;">注册</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '../utils/request'

// 路由实例
const router = useRouter()

// 状态
const isLogin = ref(true)
const loginType = ref('password')
const countdown = ref(0)

// 表单数据
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

// 切换模式
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

// 邮箱格式验证
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 发送验证码（GET请求）
const sendEmailCode = async (type) => {
  const email = type === 'login' ? loginForm.email : registerForm.email
  if (!validateEmail(email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    // 调用获取验证码接口 - GET方式，参数通过params传递
    await request.get('/auth/get-code', {
      params: { email }
    })
    ElMessage.success(`验证码已发送至 ${email}`)
    startCountdown()
  } catch (error) {
    // 错误已在拦截器中处理，这里可不做额外处理
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

    // ✅ 假设后端返回 { token: "xxx" }
    const { token } = response
    localStorage.setItem('access_token', token)
    ElMessage.success('登录成功！')
    await router.push('/index')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 注册
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
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>