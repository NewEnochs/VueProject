<template>
  <div>
    <h1>用户信息</h1>
    <p>用户名：{{ userInfo.username }}</p>
    <p>邮箱：{{ userInfo.email }}</p>
    <p>手机号：{{ userInfo.phone }}</p>
    <a-space direction="vertical" align="center">
      <a-qrcode :value="text" />
      <a-input v-model:value="text" placeholder="-" :maxlength="60" />
    </a-space>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// 设置页面标题
onMounted(() => {
  document.title = '用户信息'
})

const userInfo = ref({
  username: '张三',
  email: 'zhangsan@example.com',
  phone: '13800000000',
})

const text = ref('https://www.baidu.com')
</script>
<style scoped></style>
