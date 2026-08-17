<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import TestUserEditModal, { type TestUserRow } from '@/components/TestUserEditModal/TestUserEditModal.vue'

const departments = ['研发部', '产品部', '设计部', '市场部', '运营部', '人事部']
const roles = ['管理员', '开发工程师', '产品经理', '设计师', '运营专员', '测试工程师']
const statuses = ['在职', '离职', '休假']

const rows = ref<TestUserRow[]>(
  Array.from({ length: 40 }, (_, index) => {
    const id = index + 1
    return {
      id,
      name: `用户${String(id).padStart(2, '0')}`,
      email: `user${id}@example.com`,
      phone: `138${String(10000000 + id * 137).slice(0, 8)}`,
      department: departments[index % departments.length] ?? '研发部',
      role: roles[index % roles.length] ?? '开发工程师',
      status: statuses[index % statuses.length] ?? '在职',
      createdAt: `2026-0${(index % 8) + 1}-${String((index % 27) + 1).padStart(2, '0')} 09:${String(index % 60).padStart(2, '0')}:00`,
    }
  }),
)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 64 },
  { title: '姓名', dataIndex: 'name', width: 100 },
  { title: '邮箱', dataIndex: 'email', width: 200 },
  { title: '手机号', dataIndex: 'phone', width: 140 },
  { title: '部门', dataIndex: 'department', width: 110 },
  { title: '角色', dataIndex: 'role', width: 120 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' as const },
]

const editOpen = ref(false)
const editingRow = ref<TestUserRow | null>(null)

function openEdit(row: TestUserRow) {
  editingRow.value = row
  editOpen.value = true
}

function handleSaved(saved: TestUserRow) {
  const index = rows.value.findIndex((item) => item.id === saved.id)
  if (index >= 0) {
    rows.value[index] = saved
  }
  message.success('保存成功')
}

function handleDelete(row: TestUserRow) {
  rows.value = rows.value.filter((item) => item.id !== row.id)
  message.success(`已删除「${row.name}」`)
}

const pagination = computed(() => ({
  current: 1,
  pageSize: 8,
  showSizeChanger: true,
  pageSizeOptions: ['8', '15', '30'],
  showTotal: (total: number) => `共 ${total} 条`,
}))
</script>

<template>
  <section class="table-antd-page">
    <div class="page-heading">
      <h1>测试表格（Ant Design Vue）</h1>
      <p>a-table + 分页 + 独立编辑弹窗组件 + 删除确认，共 {{ rows.length }} 条模拟数据。</p>
    </div>

    <div class="table-panel">
      <a-table
        :data-source="rows"
        :columns="columns"
        :pagination="pagination"
        :scroll="{ x: 1050 }"
        row-key="id"
        size="middle"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定删除该用户吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <TestUserEditModal
      v-model:open="editOpen"
      :record="editingRow"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped>
.table-antd-page {
  display: grid;
  gap: 16px;
}

.page-heading h1,
.page-heading p {
  margin: 0;
}

.page-heading h1 {
  font-size: 22px;
}

.page-heading p {
  margin-top: 6px;
  color: #718582;
}

.table-panel {
  padding: 16px;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}
</style>
