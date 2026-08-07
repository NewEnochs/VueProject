<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BarChartOutlined,
  ClearOutlined,
  CloseOutlined,
  DashboardOutlined,
  DownOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue'
import { logout } from '@/api/user'
import { useUserStore } from '@/stores/user'
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal.vue'
import type { AppTab, MenuGroup, MenuLeaf, TabContextMenu } from './app-layout'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collapsed = ref(false)
const leaving = ref(false)
const changePasswordRef = ref()
const HOME_TAB: AppTab = { path: '/home', title: '首页' }
const tabs = ref<AppTab[]>([HOME_TAB])
const openKeys = ref<string[]>([])
const tabMenu = ref<TabContextMenu>({
  visible: false,
  x: 0,
  y: 0,
  path: '',
})

const menus: MenuGroup[] = [
  {
    key: 'workspace',
    title: '工作台',
    icon: DashboardOutlined,
    children: [{ path: '/home', title: '首页', icon: HomeOutlined }],
  },
  {
    key: 'data',
    title: '基础信息',
    icon: FolderOpenOutlined,
    children: [
      { path: '/personnel', title: '人员信息', icon: TeamOutlined },
      { path: '/student', title: '学生信息', icon: FileSearchOutlined },
    ],
  },
  {
    key: 'tools',
    title: '系统工具',
    icon: ToolOutlined,
    children: [
      { path: '/menu', title: '菜单管理', icon: MenuOutlined },
      { path: '/dataView', title: '数据概览', icon: BarChartOutlined },
      { path: '/bigData', title: '大数据看板', icon: FundProjectionScreenOutlined },
      { path: '/test/test', title: '测试页面', icon: ExperimentOutlined },
    ],
  },
]

const flatMenus = computed(() => menus.flatMap((item) => item.children))
const selectedKeys = computed(() => [route.path])

function findMenu(path: string): MenuLeaf | undefined {
  return flatMenus.value.find((item) => item.path === path)
}

function findParentKey(path: string) {
  return menus.find((item) => item.children.some((child) => child.path === path))?.key
}

function getRouteTitle(path: string) {
  return findMenu(path)?.title || String(route.meta.title || '页面')
}

function addTab(path: string) {
  // 首页固定在第一个标签，无需重复添加
  if (path === HOME_TAB.path) {
    return
  }

  const menu = findMenu(path)
  if (!menu) {
    return
  }

  if (!tabs.value.some((item) => item.path === path)) {
    tabs.value.push({
      path,
      title: menu.title,
    })
  }
}

function goPage(path: string) {
  hideTabMenu()
  // 大数据看板：直接新窗口打开，不进入标签页
  if (path === '/bigData') {
    window.open('/bigData', '_blank')
    return
  }
  router.push(path)
}

function handleMenuClick(event: { key: string | number }) {
  goPage(String(event.key))
}

function closeTab(path: string) {
  // 首页标签不允许关闭
  if (path === HOME_TAB.path) {
    hideTabMenu()
    return
  }

  if (tabs.value.length <= 1) {
    hideTabMenu()
    return
  }

  const currentIndex = tabs.value.findIndex((item) => item.path === path)
  tabs.value = tabs.value.filter((item) => item.path !== path)

  if (route.path === path) {
    const nextTab = tabs.value[currentIndex] || tabs.value[currentIndex - 1] || tabs.value[0]
    router.push(nextTab?.path || '/home')
  }
}

function closeLeftTabs(path: string) {
  const index = tabs.value.findIndex((item) => item.path === path)
  if (index <= 1) {
    return
  }

  // 关闭左侧时保留首页在第一个位置
  tabs.value = [HOME_TAB, ...tabs.value.slice(index)]
  if (!tabs.value.some((item) => item.path === route.path)) {
    router.push(path)
  }
}

function closeRightTabs(path: string) {
  const index = tabs.value.findIndex((item) => item.path === path)
  if (index < 0 || index === tabs.value.length - 1) {
    return
  }

  tabs.value = tabs.value.slice(0, index + 1)
  if (!tabs.value.some((item) => item.path === route.path)) {
    router.push(path)
  }
}

function showTabMenu(event: MouseEvent, path: string) {
  // 首页标签不显示右键菜单（不可关闭）
  if (path === HOME_TAB.path) {
    return
  }

  event.preventDefault()
  tabMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    path,
  }
}

function hideTabMenu() {
  tabMenu.value.visible = false
}

function handleTabMenuAction(action: 'close' | 'left' | 'right') {
  const path = tabMenu.value.path
  hideTabMenu()

  if (action === 'close') {
    closeTab(path)
  }
  if (action === 'left') {
    closeLeftTabs(path)
  }
  if (action === 'right') {
    closeRightTabs(path)
  }
}

async function handleLogout(clearAll = false) {
  leaving.value = true

  try {
    await logout()
  } catch (error) {
    console.warn('logout error:', error)
  } finally {
    userStore.clearSession(clearAll)
    tabs.value = []
    leaving.value = false
    router.replace('/login')
  }
}

const userDisplayName = computed(() => userStore.userInfo?.studentName || 'User')
const userAvatarText = computed(() => {
  const name = userDisplayName.value
  return name ? name.charAt(0).toUpperCase() : 'U'
})

function handleAccountMenuClick({ key }: { key: string | number }) {
  if (key === 'changePassword') {
    changePasswordRef.value?.open()
  }
  if (key === 'logout') {
    handleLogout(false)
  }
  if (key === 'logoutClear') {
    handleLogout(true)
  }
}

watch(
  () => route.path,
  (path) => {
    addTab(path)
    const parentKey = findParentKey(path)
    if (parentKey && !openKeys.value.includes(parentKey)) {
      openKeys.value = [parentKey]
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-shell" :class="{ collapsed }" @click="hideTabMenu">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">Y</div>
        <div v-if="!collapsed">
          <p>医事通</p>
          <span>Medical Console</span>
        </div>
      </div>

      <a-menu
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="collapsed"
        :selected-keys="selectedKeys"
        @click="handleMenuClick"
      >
        <a-sub-menu v-for="group in menus" :key="group.key">
          <template #icon>
            <component :is="group.icon" />
          </template>
          <template #title>{{ group.title }}</template>

          <a-menu-item v-for="item in group.children" :key="item.path">
            <template #icon>
              <component :is="item.icon" />
            </template>
            <span>{{ item.title }}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </aside>

    <section class="main-shell">
      <header class="topbar">
        <button type="button" class="collapse-button" @click.stop="collapsed = !collapsed">
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </button>

        <div class="topbar-title">
          <p>{{ getRouteTitle(route.path) }}</p>
          <span>重庆医事通科技有限公司</span>
        </div>

        <div class="account-actions">
          <a-dropdown :trigger="['click']">
            <div class="user-profile">
              <a-avatar :size="34" class="user-avatar">
                {{ userAvatarText }}
              </a-avatar>
              <span class="account-name">{{ userDisplayName }}</span>
              <DownOutlined class="user-arrow" />
            </div>
            <template #overlay>
              <a-menu @click="handleAccountMenuClick">
                <a-menu-item key="changePassword">
                  <KeyOutlined />
                  <span>修改密码</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logoutClear" danger>
                  <ClearOutlined />
                  <span>清空缓存并退出</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <ChangePasswordModal ref="changePasswordRef" />
        </div>
      </header>

      <nav class="tabs-bar" aria-label="Open pages">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          type="button"
          class="page-tab"
          :class="{ active: tab.path === route.path }"
          @click.stop="goPage(tab.path)"
          @contextmenu="showTabMenu($event, tab.path)"
        >
          <span>{{ tab.title }}</span>
          <CloseOutlined
            v-if="tab.path !== HOME_TAB.path"
            class="tab-close"
            @click.stop="closeTab(tab.path)"
          />
        </button>
      </nav>

      <div
        v-if="tabMenu.visible"
        class="tab-context-menu"
        :style="{ left: `${tabMenu.x}px`, top: `${tabMenu.y}px` }"
        @click.stop
      >
        <button type="button" @click="handleTabMenuAction('close')">
          <CloseOutlined />
          关闭本页
        </button>
        <button type="button" @click="handleTabMenuAction('left')">关闭左侧</button>
        <button type="button" @click="handleTabMenuAction('right')">关闭右侧</button>
      </div>

      <main class="content">
        <slot />
      </main>
    </section>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  color: #182f31;
  overflow: hidden;
  background: #f3f7f7;
  transition: grid-template-columns 0.2s ease;
}

.app-shell.collapsed {
  grid-template-columns: 80px minmax(0, 1fr);
}

.sidebar {
  min-width: 0;
  overflow: hidden;
  background: #0b2f33;
}

.brand {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 8px;
  background: #12a594;
  font-weight: 800;
}

.brand p,
.brand span,
.topbar-title p,
.topbar-title span {
  margin: 0;
}

.brand p {
  font-size: 16px;
  font-weight: 700;
}

.brand span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
}

.main-shell {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
  padding: 0 20px;
  border-bottom: 1px solid #dce8e8;
  background: #ffffff;
}

.collapse-button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid #d6e4e3;
  border-radius: 6px;
  color: #195c5c;
  background: #ffffff;
  cursor: pointer;
}

.topbar-title {
  min-width: 0;
  flex: 1;
}

.topbar-title p {
  font-size: 15px;
  font-weight: 700;
}

.topbar-title span {
  color: #829493;
  font-size: 11px;
}

.account-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 10px;
  border: 1px solid #dce8e8;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.user-profile:hover {
  border-color: #12a594;
  background: #f6fcfb;
  box-shadow: 0 2px 8px rgba(18, 165, 148, 0.12);
}

.user-avatar {
  background: #12a594;
  color: #ffffff;
  font-weight: 600;
  flex: 0 0 auto;
  user-select: none;
}

.account-name {
  color: #274341;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}

.user-arrow {
  color: #8ca09e;
  font-size: 11px;
  transition: transform 0.2s ease;
}

.user-profile:hover .user-arrow {
  color: #12a594;
}

.tabs-bar {
  height: 42px;
  display: flex;
  align-items: end;
  gap: 6px;
  flex: 0 0 auto;
  padding: 7px 14px 0;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid #dce8e8;
  background: #f8fbfb;
}

.page-tab {
  height: 35px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 0 10px 0 14px;
  border: 1px solid #dce8e8;
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  color: #526a69;
  background: #edf4f3;
  cursor: pointer;
}

.page-tab.active {
  color: #0b766e;
  background: #ffffff;
}

.tab-close {
  color: #8ca09e;
  font-size: 11px;
}

.tab-context-menu {
  position: fixed;
  z-index: 1000;
  width: 138px;
  padding: 6px;
  border: 1px solid #d6e4e3;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 45, 45, 0.16);
}

.tab-context-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  color: #274341;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.tab-context-menu button:hover {
  color: #0b766e;
  background: #eef8f6;
}

.content {
  min-height: 0;
  flex: 1;
  padding: 20px;
  overflow: auto;
}

:deep(.ant-menu-dark) {
  background: transparent;
}
</style>
