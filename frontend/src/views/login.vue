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

        <!-- 手机号 -->
        <el-form-item label="手机号" :label-width="80">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" />
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
            @click="sendSmsCode('login')"
            style="margin-left: 10px;"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </el-button>
        </el-form-item>

        <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
      </div>

      <!-- 注册表单 -->
      <div v-else>
        <el-form-item label="手机号" :label-width="80">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
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
            @click="sendSmsCode('register')"
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

// 状态
const isLogin = ref(true)
const loginType = ref('password') // 'password' 或 'sms'
const countdown = ref(0)

// 表单数据
const loginForm = reactive({
  phone: '',
  password: '',
  code: ''
})

const registerForm = reactive({
  phone: '',
  password: '',
  code: ''
})

// 切换登录/注册
const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForms()
}

const resetForms = () => {
  loginForm.phone = ''
  loginForm.password = ''
  loginForm.code = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.code = ''
  loginType.value = 'password'
}

// 模拟发送验证码（实际应调用后端接口）
const sendSmsCode = (type) => {
  const phone = type === 'login' ? loginForm.phone : registerForm.phone
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  // 模拟发送成功
  ElMessage.success(`验证码已发送至 ${phone}（模拟）`)
  startCountdown()
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

// 登录处理
const handleLogin = () => {
  const { phone, password, code } = loginForm

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('手机号格式错误')
    return
  }

  if (loginType.value === 'password') {
    if (!password || password.length < 6) {
      ElMessage.error('密码至少6位')
      return
    }
    // 模拟登录
    ElMessage.success('密码登录成功！')
  } else {
    if (!code) {
      ElMessage.error('请输入验证码')
      return
    }
    // 模拟验证码登录
    ElMessage.success('验证码登录成功！')
  }
}

// 注册处理
const handleRegister = () => {
  const { phone, password, code } = registerForm

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('手机号格式错误')
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

  // 模拟注册
  ElMessage.success('注册成功！')
  isLogin.value = true
  resetForms()
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