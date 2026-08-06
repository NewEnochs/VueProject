<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ClockCircleOutlined, DesktopOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const now = ref(new Date())
let timer: number | undefined

const currentTime = computed(() => {
  return now.value.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
})

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <section class="home-dashboard">
    <div class="welcome-band">
      <div>
        <p class="eyebrow">WELCOME</p>
        <h1>欢迎，{{ userStore.displayName }}</h1>
        <p>这里是重庆医事通科技有限公司后台工作台。</p>
      </div>
      <div class="time-panel">
        <ClockCircleOutlined />
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <div class="summary-grid">
      <article class="summary-item">
        <DesktopOutlined />
        <div>
          <h2>显示器信息</h2>
          <p>当前页面运行在浏览器工作区，适配桌面与移动端布局。</p>
        </div>
      </article>

      <article class="summary-item">
        <LinkOutlined />
        <div>
          <h2>登录地址</h2>
          <p>http://localhost:8963/login</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-dashboard {
  display: grid;
  gap: 18px;
}

.welcome-band {
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid #d9e8e6;
  border-radius: 8px;
  color: #ffffff;
  background: #0b766e;
}

.eyebrow,
.welcome-band h1,
.welcome-band p,
.summary-item h2,
.summary-item p {
  margin: 0;
}

.eyebrow {
  color: #9be7dd;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.welcome-band h1 {
  margin-top: 12px;
  font-size: clamp(28px, 4vw, 46px);
  line-height: 1.15;
  letter-spacing: 0;
}

.welcome-band p {
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
}

.time-panel {
  min-width: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 18px;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.summary-item {
  display: flex;
  gap: 16px;
  padding: 22px;
  border: 1px solid #dce8e8;
  border-radius: 8px;
  background: #ffffff;
}

.summary-item > span {
  color: #0b766e;
  font-size: 28px;
}

.summary-item h2 {
  font-size: 17px;
  letter-spacing: 0;
}

.summary-item p {
  margin-top: 8px;
  color: #6f8482;
}

@media (max-width: 760px) {
  .welcome-band {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .time-panel {
    min-width: 0;
    width: 100%;
  }
}
</style>
