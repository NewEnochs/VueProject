import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiPrefix = env.VITE_API_PREFIX || '/api'
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8055/'

  return {
    plugins: [vue(), vueJsx(), vueDevTools()],
    server: {
      host: '0.0.0.0',
      port: 8963,
      strictPort: true,
      proxy: {
        [apiPrefix]: {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.slice(apiPrefix.length) || '/',
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
