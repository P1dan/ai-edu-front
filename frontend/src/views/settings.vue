<template>
    <div class="settings-container">
        <!-- 侧边栏导航 -->
        <div class="settings-sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <el-icon>
                        <Setting />
                    </el-icon>
                    <span>个人中心</span>
                </div>
            </div>
            <div class="sidebar-menu">
                <div v-for="item in menuItems" :key="item.key" class="menu-item"
                    :class="{ active: activeMenu === item.key }" @click="activeMenu = item.key">
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.label }}</span>
                </div>
            </div>
            <div class="sidebar-footer">
                <div class="menu-item logout" @click="handleLogout">
                    <el-icon>
                        <SwitchButton />
                    </el-icon>
                    <span>退出登录</span>
                </div>
            </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="settings-content">
            <!-- 账户信息 -->
            <div v-if="activeMenu === 'account'" class="content-panel">
                <div class="panel-header">
                    <h2>账户信息</h2>
                    <p class="subtitle">管理您的个人资料和账户信息</p>
                </div>

                <div class="info-card">
                    <div class="avatar-section">
                        <div class="avatar-wrapper">
                            <el-avatar :size="120" :src="userInfo.avatar" class="avatar">
                                {{ userInfo.nickname?.charAt(0) || 'U' }}
                            </el-avatar>
                            <div class="avatar-upload" @click="handleChangeAvatar">
                                <el-icon>
                                    <Camera />
                                </el-icon>
                                <span>更换头像</span>
                            </div>
                        </div>
                    </div>

                    <el-form :model="userInfo" label-width="100px" class="info-form">
                        <el-form-item label="昵称">
                            <el-input v-model="userInfo.nickname" placeholder="请输入昵称" class="custom-input" />
                        </el-form-item>

                        <el-form-item label="邮箱">
                            <div class="form-item-with-action">
                                <el-input v-model="userInfo.email" placeholder="请输入邮箱" disabled class="custom-input" />
                                <el-button type="primary" plain @click="handleChangeEmail">修改</el-button>
                            </div>
                        </el-form-item>

                        <el-form-item label="手机号">
                            <div class="form-item-with-action">
                                <el-input v-model="userInfo.phone" placeholder="请绑定手机号" class="custom-input" />
                                <el-button type="primary" plain @click="handleBindPhone">绑定</el-button>
                            </div>
                        </el-form-item>

                        <el-form-item label="注册时间">
                            <el-input v-model="userInfo.regTime" disabled class="custom-input" />
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" size="large" @click="handleSave" class="save-btn">
                                保存修改
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeMenu === 'security'" class="content-panel">
                <div class="panel-header">
                    <h2>安全设置</h2>
                    <p class="subtitle">保护您的账户安全，建议定期更新密码</p>
                </div>

                <div class="security-card">
                    <div class="security-item">
                        <div class="security-icon">
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </div>
                        <div class="security-info">
                            <div class="security-title">登录密码</div>
                            <div class="security-desc">建议使用字母、数字和特殊字符组合的复杂密码</div>
                        </div>
                        <el-button type="primary" plain @click="handleChangePassword">修改密码</el-button>
                    </div>

                    <el-divider />

                    <div class="security-item">
                        <div class="security-icon">
                            <el-icon>
                                <Message />
                            </el-icon>
                        </div>
                        <div class="security-info">
                            <div class="security-title">邮箱验证</div>
                            <div class="security-desc">已验证 · 用于账户安全和找回密码</div>
                        </div>
                        <el-button type="primary" plain @click="handleVerifyEmail">管理</el-button>
                    </div>

                    <el-divider />

                    <div class="security-item">
                        <div class="security-icon">
                            <el-icon>
                                <Cellphone />
                            </el-icon>
                        </div>
                        <div class="security-info">
                            <div class="security-title">手机绑定</div>
                            <div class="security-desc">未绑定 · 绑定手机号可提升账户安全等级</div>
                        </div>
                        <el-button type="primary" plain @click="handleBindPhone">立即绑定</el-button>
                    </div>
                </div>

                <div class="danger-zone">
                    <div class="danger-header">
                        <el-icon>
                            <WarningFilled />
                        </el-icon>
                        <span>危险操作区</span>
                    </div>
                    <div class="danger-item">
                        <div class="danger-info">
                            <div class="danger-title">注销账户</div>
                            <div class="danger-desc">账户注销后，所有数据将被清空，且无法恢复</div>
                        </div>
                        <el-button type="danger" plain @click="handleDeleteAccount">注销账户</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Setting, User, Lock, SwitchButton, Camera,
    Message, Cellphone, WarningFilled
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 菜单项
const menuItems = [
    { key: 'account', label: '账户信息', icon: User },
    { key: 'security', label: '安全设置', icon: Lock }
]

// 当前选中的菜单
const activeMenu = ref('account')

// 用户信息
const userInfo = reactive({
    nickname: '用户名',
    email: 'user@example.com',
    phone: '',
    avatar: '',
    regTime: '2024-01-01'
})

// 更换头像
const handleChangeAvatar = () => {
    ElMessage.info('头像功能开发中')
}

// 修改邮箱
const handleChangeEmail = () => {
    ElMessage.info('修改邮箱功能开发中')
}

// 绑定手机号
const handleBindPhone = () => {
    ElMessage.info('绑定手机号功能开发中')
}

// 保存修改
const handleSave = () => {
    ElMessage.success('保存成功')
}

// 修改密码
const handleChangePassword = () => {
    ElMessage.info('修改密码功能开发中')
}

// 邮箱验证
const handleVerifyEmail = () => {
    ElMessage.info('邮箱验证功能开发中')
}

// 注销账户
const handleDeleteAccount = () => {
    ElMessageBox.confirm('确定要注销账户吗？此操作不可逆，所有数据将被永久删除。', '警告', {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'danger-confirm-btn'
    }).then(() => {
        ElMessage.success('账户已注销')
        localStorage.removeItem('access_token')
        router.push('/login')
    }).catch(() => { })
}

// 退出登录
const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        localStorage.removeItem('access_token')
        ElMessage.success('已退出登录')
        router.push('/login')
    }).catch(() => { })
}
</script>

<style scoped>
.settings-container {
    display: flex;
    min-height: 100vh;
    background: #f5f7fa;
}

/* 侧边栏样式 */
.settings-sidebar {
    width: 280px;
    background: white;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.sidebar-header {
    padding: 32px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.logo .el-icon {
    font-size: 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.sidebar-menu {
    flex: 1;
    padding: 24px 16px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    margin: 4px 0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #5a5c69;
    font-weight: 500;
}

.menu-item:hover {
    background: #f5f7fa;
    color: #409eff;
    transform: translateX(4px);
}

.menu-item.active {
    background: #ecf5ff;
    color: #409eff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.menu-item.active .el-icon {
    color: white;
}

.menu-item .el-icon {
    font-size: 20px;
}

.sidebar-footer {
    padding: 24px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.menu-item.logout {
    color: #f56c6c;
}

.menu-item.logout:hover {
    background: #fef0f0;
    color: #f56c6c;
}

/* 右侧内容区 */
.settings-content {
    flex: 1;
    padding: 40px 48px;
    overflow-y: auto;
}

.content-panel {
    max-width: 900px;
    margin: 0 auto;
    animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.panel-header {
    margin-bottom: 32px;
}

.panel-header h2 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 600;
    color: #303133;
}

.subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
}

/* 卡片样式 */
.info-card,
.security-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover,
.security-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
}

/* 头像区域 */
.avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
}

.avatar {
    border: 4px solid white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s;
}

.avatar-wrapper:hover .avatar {
    transform: scale(1.05);
}

.avatar-upload {
    position: absolute;
    bottom: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    color: white;
}

.avatar-upload:hover {
    transform: scale(1.1);
}

.avatar-upload .el-icon {
    font-size: 18px;
}

.avatar-upload span {
    display: none;
}

/* 表单样式 */
.info-form {
    margin-top: 20px;
}

.custom-input :deep(.el-input__wrapper) {
    border-radius: 12px;
    transition: all 0.3s;
    box-shadow: 0 0 0 1px #e4e7ed inset;
}

.custom-input :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #667eea inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2), 0 0 0 1px #667eea inset;
}

.form-item-with-action {
    display: flex;
    gap: 12px;
    width: 100%;
}

.form-item-with-action .custom-input {
    flex: 1;
}

.save-btn {
    width: 100%;
    border-radius: 12px;
    height: 44px;
    font-size: 16px;
    background: #409eff;
    border: none;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

/* 安全设置项 */
.security-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
}

.security-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #667eea;
}

.security-info {
    flex: 1;
}

.security-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
}

.security-desc {
    font-size: 13px;
    color: #7f8c8d;
}

/* 危险区域 */
.danger-zone {
    margin-top: 32px;
    background: white;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #fde2e2;
    background: #fff5f5;
}

.danger-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #fcc;
    color: #f56c6c;
    font-weight: 600;
}

.danger-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
}

.danger-title {
    font-size: 14px;
    font-weight: 600;
    color: #f56c6c;
    margin-bottom: 4px;
}

.danger-desc {
    font-size: 12px;
    color: #f89898;
}

:deep(.el-divider) {
    margin: 0;
}

:deep(.el-button.is-plain) {
    border-radius: 10px;
    transition: all 0.3s;
}

:deep(.el-button--primary.is-plain) {
    color: #667eea;
    border-color: #667eea;
}

:deep(.el-button--primary.is-plain:hover) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
}

:deep(.el-button--danger.is-plain) {
    color: #f56c6c;
    border-color: #fcc;
}

:deep(.el-button--danger.is-plain:hover) {
    background: #f56c6c;
    color: white;
    border-color: #f56c6c;
}
</style>