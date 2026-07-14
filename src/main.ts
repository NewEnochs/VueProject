import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// ECharts
import * as echarts from 'echarts'

const app = createApp(App)

app.use(createPinia())

// 注册路由
app.use(router)

// 全局注册 Ant Design Vue
app.use(Antd)

// 全局注册 Element Plus
app.use(ElementPlus)

// 全局挂载 ECharts
app.config.globalProperties.$echarts = echarts

app.mount('#app')
