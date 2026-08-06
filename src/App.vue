<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppLayout from '@/components/AppLayout.vue'

dayjs.locale('zh-cn')

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <a-config-provider :locale="zhCN">
    <RouterView v-if="isLoginPage" />
    <AppLayout v-else>
      <RouterView />
    </AppLayout>
  </a-config-provider>
</template>

<style scoped></style>
