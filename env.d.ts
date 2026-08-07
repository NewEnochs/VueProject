/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { MessageApi } from 'ant-design-vue/es/message'
import type * as echarts from 'echarts'

declare module 'vue' {
  interface ComponentCustomProperties {
    $echarts: typeof echarts
    $message: MessageApi
  }
}

export {}
