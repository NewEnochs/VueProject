<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BarChartOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  FileSearchOutlined,
  FundProjectionScreenOutlined,
  LinkOutlined,
  MenuOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const now = ref(new Date())
let timer: number | undefined

const shortcuts = [
  { key: 'menu', title: '菜单管理', desc: '维护系统菜单与权限', icon: MenuOutlined, path: '/menu' },
  {
    key: 'dataView',
    title: '数据概览',
    desc: '关键业务指标与运营趋势',
    icon: BarChartOutlined,
    path: '/dataView',
  },
  {
    key: 'bigData',
    title: '大数据看板',
    desc: '医疗运营数据实时看板',
    icon: FundProjectionScreenOutlined,
    path: '/bigData',
    external: true,
  },
  {
    key: 'student',
    title: '学生信息',
    desc: '查看学生档案信息',
    icon: FileSearchOutlined,
    path: '/student',
  },
]

function openShortcut(item: { path: string; external?: boolean }) {
  if (item.external) {
    window.open(item.path, '_blank')
    return
  }

  router.push(item.path)
}

// console.log(userStore.userInfo, 'userStore')

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
        <h1>欢迎，{{ userStore.userInfo.studentName }}</h1>
        <p>这里是重庆医事通科技有限公司后台工作台。</p>
      </div>
      <div class="time-panel">
        <ClockCircleOutlined />
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <section class="shortcut-section">
      <div class="shortcut-head">
        <h2>快捷入口</h2>
        <span>常用功能一键直达</span>
      </div>
      <div class="shortcut-grid">
        <button
          v-for="item in shortcuts"
          :key="item.key"
          type="button"
          class="shortcut-card"
          @click="openShortcut(item)"
        >
          <span class="shortcut-icon" :class="`icon-${item.key}`">
            <component :is="item.icon" />
          </span>
          <span class="shortcut-info">
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </span>
          <span v-if="item.external" class="shortcut-badge">新窗口</span>
        </button>
      </div>
    </section>

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

.shortcut-section {
  padding: 22px;
  border: 1px solid #dce8e8;
  border-radius: 8px;
  background: #ffffff;
}

.shortcut-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}

.shortcut-head h2 {
  margin: 0;
  font-size: 17px;
}

.shortcut-head span {
  color: #6f8482;
  font-size: 12px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e1e9e8;
  border-radius: 8px;
  color: inherit;
  background: #f8fbfb;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.shortcut-card:hover {
  border-color: #12a594;
  box-shadow: 0 8px 22px rgba(18, 165, 148, 0.14);
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 8px;
  font-size: 19px;
}

.icon-menu {
  color: #2f80ed;
  background: #eaf3ff;
}

.icon-dataView {
  color: #12a594;
  background: #e7f8f2;
}

.icon-bigData {
  color: #7c5ce7;
  background: #f1edff;
}

.icon-student {
  color: #f59e0b;
  background: #fff3df;
}

.shortcut-info {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.shortcut-info strong {
  color: #274341;
  font-size: 14px;
}

.shortcut-info small {
  color: #849592;
  font-size: 11px;
}

.shortcut-badge {
  margin-left: auto;
  flex: 0 0 auto;
  padding: 2px 7px;
  border-radius: 4px;
  color: #7c5ce7;
  background: #f1edff;
  font-size: 10px;
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

@media (max-width: 960px) {
  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .welcome-band {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .shortcut-grid {
    grid-template-columns: 1fr;
  }

  .time-panel {
    min-width: 0;
    width: 100%;
  }
}
</style>
