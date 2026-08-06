<script setup>
import { onMounted } from 'vue'
import { getGradeList } from '@/api/api'

const loadOrgInfo = async () => {
  try {
    const res = await getGradeList({})
    console.log('getGradeList:', res)
  } catch (error) {
    console.log('getGradeList error:', error)
  }
}

onMounted(() => {
  loadOrgInfo()
})
</script>

<template>
  <section class="test-page">
    <div class="page-heading">
      <h1>测试页面</h1>
      <p>打开页面会自动调用 /sysOrg/getGradeList，并在控制台打印结果。</p>
    </div>

    <div class="test-panel">
      <a-button type="primary" @click="loadOrgInfo">调用组织接口</a-button>
    </div>
    <div></div>
  </section>
</template>

<style scoped>
.test-page {
  display: grid;
  gap: 18px;
}

.page-heading h1,
.page-heading p {
  margin: 0;
}

.page-heading h1 {
  font-size: 22px;
  letter-spacing: 0;
}

.page-heading p {
  margin-top: 6px;
  color: #718582;
}

.test-panel {
  padding: 22px;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}
</style>
