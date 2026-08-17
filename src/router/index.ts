import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteRecordSingleView } from 'vue-router'
import { getToken, isTokenExpired, clearToken } from '@/utils/request'

const modules = import.meta.glob('@/views/**/*.vue')

const titleMap: Record<string, string> = {
  '/home': '首页',
  '/login': '登录',
  '/student': '学生信息',
  '/personnel': '人员信息',
  '/menu': '菜单管理',
  '/dataView': '数据概览',
  '/bigData': '大数据看板',
  '/test/test': '测试页面',
  '/test/tableAntd': '测试表格(Antd)',
  '/test/tableElement': '测试表格(Element)',
  '/test/formAntd': '测试表单(Antd)',
  '/test/formElement': '测试表单(Element)',
  '/chat': '视频聊天',
  '/user/userInfo': '用户信息',
  '/user/userList': '用户列表',
}

function generateRoutes(): RouteRecordRaw[] {
  return Object.keys(modules).map((filePath) => {
    let routePath = filePath
      .replace('/src/views', '')
      .replace(/\/index\.vue$/, '')
      .replace(/\.vue$/, '')

    if (routePath === '/login/login') {
      routePath = '/login'
    }

    if (routePath === '/home/menu') {
      routePath = '/menu'
    }

    if (routePath === '/home/dataView') {
      routePath = '/dataView'
    }

    if (routePath === '/home/bigData') {
      routePath = '/bigData'
    }

    return {
      path: routePath || '/',
      name: routePath.replace('/', '').replace(/\//g, '-') || 'home',
      component: modules[filePath] as () => Promise<unknown>,
      meta: {
        title: titleMap[routePath] || '',
      },
    } as RouteRecordSingleView
  })
}

const routes = generateRoutes()

routes.unshift({
  path: '/',
  redirect: '/home',
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - 重庆医事通科技有限公司` : '重庆医事通科技有限公司'

  if (to.path === '/login') {
    const token = getToken()
    if (token && !isTokenExpired()) {
      return '/home'
    }
    if (token && isTokenExpired()) {
      clearToken()
      sessionStorage.clear()
    }
    return true
  }

  if (!getToken() || isTokenExpired()) {
    if (isTokenExpired()) {
      clearToken()
      sessionStorage.clear()
    }
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
})

export default router
