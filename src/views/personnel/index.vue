<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PersonItem } from './types'

const dataSource = ref<PersonItem[]>([
  { ID: 1, XM: '张三', XB: '男', SFZH: '110101199001011234', ADDRESS: '北京市东城区', AGE: 35 },
  { ID: 2, XM: '李四', XB: '女', SFZH: '310101199202022345', ADDRESS: '上海市黄浦区', AGE: 33 },
  { ID: 3, XM: '王五', XB: '男', SFZH: '440101198803033456', ADDRESS: '广州市越秀区', AGE: 37 },
  { ID: 4, XM: '赵六', XB: '男', SFZH: '510101199504044567', ADDRESS: '成都市锦江区', AGE: 30 },
])

const searchForm = ref({
  XM: '',
  SFZH: '',
})

const filteredData = computed(() => {
  return dataSource.value.filter((item) => {
    const matchXM = searchForm.value.XM ? item.XM.includes(searchForm.value.XM.trim()) : true
    const matchSFZH = searchForm.value.SFZH
      ? item.SFZH.includes(searchForm.value.SFZH.trim())
      : true
    return matchXM && matchSFZH
  })
})

const columns = [
  { title: 'ID', dataIndex: 'ID', key: 'ID', width: 80 },
  { title: '姓名', dataIndex: 'XM', key: 'XM', width: 120 },
  { title: '性别', dataIndex: 'XB', key: 'XB', width: 100 },
  { title: '身份证号', dataIndex: 'SFZH', key: 'SFZH', width: 200 },
  { title: '地址', dataIndex: 'ADDRESS', key: 'ADDRESS', width: 200 },
  { title: '年龄', dataIndex: 'AGE', key: 'AGE', width: 80 },
]

function handleReset() {
  searchForm.value.XM = ''
  searchForm.value.SFZH = ''
}
</script>

<template>
  <section class="personnel-page">
    <div class="toolbar">
      <div>
        <h1>人员信息</h1>
        <p>用于查看和筛选人员基础信息。</p>
      </div>
      <div class="filters">
        <a-input v-model:value="searchForm.XM" placeholder="姓名" allow-clear />
        <a-input v-model:value="searchForm.SFZH" placeholder="身份证号" allow-clear />
        <a-button @click="handleReset">重置</a-button>
      </div>
    </div>

    <div class="table-area">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="{ pageSize: 10, showSizeChanger: true }"
        row-key="ID"
      />
    </div>
  </section>
</template>

<style scoped>
.personnel-page {
  display: grid;
  gap: 18px;
}

.toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}

.toolbar h1,
.toolbar p {
  margin: 0;
}

.toolbar h1 {
  font-size: 22px;
  letter-spacing: 0;
}

.toolbar p {
  margin-top: 6px;
  color: #718582;
}

.filters {
  display: flex;
  gap: 8px;
}

.filters :deep(.ant-input-affix-wrapper),
.filters :deep(.ant-input) {
  width: 180px;
}

.table-area {
  overflow: hidden;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}

@media (max-width: 760px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .filters :deep(.ant-input-affix-wrapper),
  .filters :deep(.ant-input) {
    width: calc(50% - 4px);
  }
}
</style>
