<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { login } from '@/api/user'
import { setToken } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import medicalMark from '@/assets/medical-mark.svg'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const captchaCanvas = ref<HTMLCanvasElement | null>(null)
const captchaInput = ref('')
const captchaCode = ref('')
const shouldAutoFillCaptcha = import.meta.env.VITE_AUTO_FILL_CAPTCHA === 'true'
const formState = ref({
  Account: '',
  Password: '',
})

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomColor(alpha = 1) {
  return `rgba(${randomInt(18, 90)}, ${randomInt(92, 160)}, ${randomInt(120, 190)}, ${alpha})`
}

function createCaptchaCode() {
  const source = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () => source[randomInt(0, source.length - 1)]).join('')
}

function drawCaptcha() {
  const canvas = captchaCanvas.value
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#e8f6f3')
  gradient.addColorStop(1, '#cce7e3')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  for (let index = 0; index < 8; index += 1) {
    ctx.beginPath()
    ctx.moveTo(randomInt(-10, width), randomInt(0, height))
    ctx.bezierCurveTo(
      randomInt(0, width),
      randomInt(0, height),
      randomInt(0, width),
      randomInt(0, height),
      randomInt(0, width + 10),
      randomInt(0, height),
    )
    ctx.strokeStyle = randomColor(0.45)
    ctx.lineWidth = randomInt(1, 2)
    ctx.stroke()
  }

  for (let index = 0; index < 90; index += 1) {
    ctx.beginPath()
    ctx.arc(randomInt(0, width), randomInt(0, height), Math.random() * 1.8 + 0.5, 0, Math.PI * 2)
    ctx.fillStyle = randomColor(0.5)
    ctx.fill()
  }

  captchaCode.value.split('').forEach((char, index) => {
    ctx.save()
    const x = 16 + index * 24 + randomInt(-2, 2)
    const y = randomInt(28, 38)
    ctx.translate(x, y)
    ctx.rotate((Math.PI / 180) * randomInt(-18, 18))
    ctx.font = `${randomInt(24, 30)}px Arial`
    ctx.fillStyle = randomColor(0.95)
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'
    ctx.shadowBlur = 2
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })
}

function refreshCaptcha() {
  let nextCode = createCaptchaCode()
  while (nextCode === captchaCode.value) {
    nextCode = createCaptchaCode()
  }

  captchaCode.value = nextCode
  captchaInput.value = shouldAutoFillCaptcha ? nextCode : ''
  window.requestAnimationFrame(drawCaptcha)
}

function getPayload(response: unknown) {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: unknown }).data
  }

  return response
}

function getTokenFromResponse(response: unknown) {
  const payload = getPayload(response)

  if (typeof payload === 'string') {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>
    return data.token || data.Token || data.accessToken || data.AccessToken
  }

  return null
}

async function handleLogin() {
  if (loading.value) {
    return
  }

  if (!formState.value.Account.trim() || !formState.value.Password) {
    message.error('请输入账号和密码')
    return
  }

  if (formState.value.Account.trim().length < 3) {
    message.error('账号不能少于 3 位字符')
    return
  }

  if (captchaInput.value.trim().toUpperCase() !== captchaCode.value) {
    message.error('验证码不正确')
    refreshCaptcha()
    return
  }

  loading.value = true

  try {
    const response = await login({
      Account: formState.value.Account.trim(),
      Password: formState.value.Password,
    })
    const token = getTokenFromResponse(response)

    if (!token) {
      message.error('登录失败，未获取到登录令牌')
      return
    }

    setToken(String(token))
    await userStore.fetchUserInfo()
    message.success('登录成功')

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    router.replace(redirect)
  } catch (error) {
    console.error('login error:', error)
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <main class="login-page">
    <section class="brand-panel" aria-label="Platform information">
      <div class="brand-lockup">
        <img :src="medicalMark" alt="" class="brand-mark" />
        <div>
          <p class="brand-name">医事通</p>
          <p class="brand-subtitle">HEALTHCARE OPERATIONS PLATFORM</p>
        </div>
      </div>

      <div class="brand-copy">
        <p class="eyebrow">SECURE ACCESS</p>
        <h1>医疗服务协同平台</h1>
        <p>统一管理组织、用户与服务数据。</p>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-form-wrap">
        <div class="login-heading">
          <p class="eyebrow">WELCOME BACK</p>
          <h2>账号登录</h2>
          <p>请输入账号信息以继续。</p>
        </div>

        <a-form layout="vertical" @keyup.enter="handleLogin">
          <a-form-item label="账号">
            <a-input v-model:value="formState.Account" size="large" autocomplete="username">
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>

          <a-form-item label="密码">
            <a-input-password
              v-model:value="formState.Password"
              size="large"
              autocomplete="current-password"
            >
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>

          <a-form-item label="验证码">
            <div class="captcha-row">
              <a-input
                v-model:value="captchaInput"
                size="large"
                :maxlength="4"
                autocomplete="off"
              >
                <template #prefix><SafetyCertificateOutlined /></template>
              </a-input>
              <button type="button" class="captcha-button" @click="refreshCaptcha">
                <canvas ref="captchaCanvas" width="120" height="40" class="captcha-canvas"></canvas>
              </button>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              html-type="button"
              type="primary"
              size="large"
              block
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <footer class="company-footer">
        <img :src="medicalMark" alt="" />
        <span>重庆医事通科技有限公司</span>
        <span class="footer-divider">|</span>
        <span>医疗信息服务平台</span>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(420px, 0.86fr);
  background: #f7faf9;
}

.brand-panel {
  position: relative;
  min-height: 100%;
  padding: 56px clamp(40px, 8vw, 128px);
  color: #f6fffe;
  background-color: #0b766e;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 46px;
  height: 46px;
}

.brand-name,
.brand-subtitle,
.brand-copy p {
  margin: 0;
}

.brand-name {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0;
}

.brand-subtitle,
.eyebrow {
  font-size: 11px;
  letter-spacing: 0;
}

.brand-subtitle {
  margin-top: 3px;
  opacity: 0.7;
}

.brand-copy {
  max-width: 500px;
  margin-top: clamp(128px, 24vh, 240px);
}

.brand-copy .eyebrow,
.login-heading .eyebrow {
  font-weight: 700;
  color: #8ae4d8;
}

.brand-copy h1 {
  margin: 18px 0 16px;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.12;
  letter-spacing: 0;
}

.brand-copy p:last-child {
  font-size: 16px;
  color: rgba(246, 255, 254, 0.78);
}

.login-panel {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px clamp(32px, 7vw, 112px) 28px;
  background: #f7faf9;
}

.login-form-wrap {
  width: min(100%, 390px);
  margin: 0 auto;
}

.login-heading {
  margin-bottom: 30px;
}

.login-heading .eyebrow {
  margin: 0 0 10px;
  color: #0b766e;
}

.login-heading h2 {
  margin: 0;
  color: #163936;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: 0;
}

.login-heading p:last-child {
  margin: 10px 0 0;
  color: #6b7f7d;
  font-size: 14px;
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 10px;
}

.captcha-button {
  width: 120px;
  height: 40px;
  padding: 0;
  overflow: hidden;
  border: 1px solid #bdd2ce;
  border-radius: 6px;
  background: #e8f6f3;
  cursor: pointer;
}

.captcha-canvas {
  display: block;
  width: 120px;
  height: 40px;
}

.company-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 48px;
  color: #7f918f;
  font-size: 12px;
  text-align: center;
}

.company-footer img {
  width: 18px;
  height: 18px;
}

.footer-divider {
  color: #c4d0ce;
}

@media (max-width: 760px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: auto;
    padding: 28px 24px 32px;
  }

  .brand-copy {
    margin-top: 44px;
  }

  .brand-copy h1 {
    font-size: 32px;
  }

  .login-panel {
    min-height: calc(100vh - 240px);
    padding: 44px 24px 24px;
  }

  .company-footer {
    flex-wrap: wrap;
    padding-top: 36px;
  }
}
</style>
