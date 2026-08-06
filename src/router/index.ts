import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteRecordSingleView } from 'vue-router'
import { getToken } from '@/utils/request'

const modules = import.meta.glob('@/views/**/*.vue')

const titleMap: Record<string, string> = {
  '/home': '首页',
  '/login': '登录',
  '/student': '学生信息',
  '/personnel': '人员信息',
  '/test/test': '测试页面',
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
    return getToken() ? '/home' : true
  }

  if (!getToken()) {
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
