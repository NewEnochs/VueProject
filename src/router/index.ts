import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteRecordSingleView } from 'vue-router'

// 自动扫描 views 目录下的所有 .vue 文件作为路由
const modules = import.meta.glob('@/views/**/*.vue')

// 页面标题映射
const titleMap: Record<string, string> = {
  '/home': '首页',
  '/user/userInfo': '用户信息',
  '/user/userList': '用户列表',
}

function generateRoutes(): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  Object.keys(modules).forEach((filePath) => {
    // 路径示例:
    // /src/views/home/index.vue -> /home
    // /src/views/user/userInfo.vue -> /user/userInfo
    const routePath = filePath
      .replace('/src/views', '')
      .replace(/\/index\.vue$/, '')
      .replace(/\.vue$/, '')

    const route: RouteRecordSingleView = {
      path: routePath || '/',
      name: routePath.replace('/', '').replace(/\//g, '-') || 'home',
      component: modules[filePath] as () => Promise<any>,
      meta: {
        title: titleMap[routePath] || '',
      },
    }
    routes.push(route)
  })

  return routes
}

const routes = generateRoutes()

// 添加根路径重定向到 /home
routes.unshift({
  path: '/',
  redirect: '/home',
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫：设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - 后台管理系统` : '后台管理系统'
  next()
})

export default router
