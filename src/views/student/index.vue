<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { studentPage } from '@/api/api'
import type { StudentItem, StudentQuery } from './student'
import {
  createDefaultQuery,
  extractStudentPageData,
  formatDate,
  getGenderText,
  getStatusText,
  getTagItems,
  studentColumns,
} from './student'

const loading = ref(false)
const tableData = ref<StudentItem[]>([])
const total = ref(0)
const queryForm = reactive<StudentQuery>(createDefaultQuery())

const pagination = computed(() => ({
  current: queryForm.pageNo,
  pageSize: queryForm.pageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (count: number) => `共 ${count} 条`,
}))

async function loadData() {
  loading.value = true

  try {
    queryForm.PageNo = queryForm.pageNo
    const response = await studentPage({ ...queryForm })
    const pageData = extractStudentPageData(response)
    tableData.value = pageData.items || []
    total.value = pageData.totalCount || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNo = 1
  loadData()
}

function handleReset() {
  Object.assign(queryForm, createDefaultQuery())
  loadData()
}

function handleTableChange(page: { current?: number; pageSize?: number }) {
  const nextPageNo = page.current || 1
  queryForm.nextPage = nextPageNo > queryForm.pageNo
  queryForm.prevPage = nextPageNo < queryForm.pageNo
  queryForm.pageNo = nextPageNo
  queryForm.PageNo = nextPageNo
  queryForm.pageSize = page.pageSize || queryForm.pageSize
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <section class="student-page">
    <section class="filter-panel">
      <a-form layout="inline" @keyup.enter="handleSearch">
        <a-form-item label="状态">
          <a-select v-model:value="queryForm.ZT" style="width: 120px">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="2">停用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="管理状态">
          <a-select v-model:value="queryForm.glzt" style="width: 140px">
            <a-select-option :value="-1">全部</a-select-option>
            <a-select-option :value="1">已管理</a-select-option>
            <a-select-option :value="2">未管理</a-select-option>
            <a-select-option :value="3">暂不管理</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="管理级别">
          <a-select v-model:value="queryForm.gljb" style="width: 140px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="红色">红色</a-select-option>
            <a-select-option value="黄色">黄色</a-select-option>
            <a-select-option value="绿色">绿色</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="关键字">
          <a-input
            v-model:value="queryForm.searchValue"
            placeholder="姓名 / 身份证号"
            allow-clear
            style="width: 220px"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </section>

    <section class="table-panel">
      <a-table
        :columns="studentColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1830, y: 'calc(100vh - 300px)' }"
        row-key="guid"
        size="middle"
        table-layout="fixed"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'xm'">
            <a-button type="link">{{ text || '-' }}</a-button>
          </template>

          <template v-else-if="column.dataIndex === 'xb'">
            {{ getGenderText(record.xb) || '-' }}
          </template>

          <template v-else-if="column.dataIndex === 'glzt'">
            <a-tag :color="record.glzt === 2 ? 'orange' : 'green'">
              {{ getStatusText(record.glzt) || '-' }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'zdrqmcs'">
            <div class="tag-ellipsis-cell" :title="getTagItems(record.zdrqmcs).join('、')">
              <template v-if="record.zdrqmcs">
                <a-tag v-for="item in getTagItems(record.zdrqmcs)" :key="item" color="blue">
                  {{ item }}
                </a-tag>
              </template>
              <span v-else>-</span>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'gljb'">
            <a-tag v-if="record.gljb" color="cyan">{{ record.gljb }}</a-tag>
            <span v-else>-</span>
          </template>

          <template v-else-if="column.dataIndex === 'qyztmc'">
            <a-tag :color="record.qyztmc === '已签约' ? 'green' : 'default'">
              {{ record.qyztmc || '-' }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'xcxbdztmc'">
            <a-tag :color="record.xcxbdztmc === '已绑定' ? 'green' : 'default'">
              {{ record.xcxbdztmc || '-' }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'gxsj'">
            {{ formatDate(record.gxsj) }}
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link">查看</a-button>
          </template>
        </template>
      </a-table>
    </section>
  </section>
</template>

<style scoped>
.student-page {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.filter-panel,
.table-panel {
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}

.filter-panel {
  padding: 16px;
}

.filter-panel :deep(.ant-form-item) {
  margin-bottom: 10px;
}

.filter-panel :deep(.ant-btn + .ant-btn) {
  margin-left: 8px;
}

.table-panel {
  min-height: 0;
  overflow: hidden;
}

.tag-ellipsis-cell {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-ellipsis-cell :deep(.ant-tag) {
  max-width: 100%;
  margin-inline-end: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
