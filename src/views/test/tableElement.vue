<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import TestProductEditModal, { type TestProductRow } from '@/components/TestProductEditModal/TestProductEditModal.vue'

const categories = ['数码产品', '家用电器', '食品生鲜', '服饰鞋包', '美妆个护', '图书文具']
const statuses = ['在售', '下架', '预售']

const rows = ref<TestProductRow[]>(
  Array.from({ length: 36 }, (_, index) => {
    const id = index + 1
    return {
      id,
      name: `商品${String(id).padStart(2, '0')}`,
      category: categories[index % categories.length] ?? '数码产品',
      price: Number((99 + index * 37.5).toFixed(2)),
      stock: (index * 17) % 500,
      status: statuses[index % statuses.length] ?? '在售',
      updatedAt: `2026-0${(index % 8) + 1}-${String((index % 27) + 1).padStart(2, '0')} 14:${String(index % 60).padStart(2, '0')}:00`,
    }
  }),
)

const columns = [
  { prop: 'id', label: 'ID', width: 64 },
  { prop: 'name', label: '商品名称', minWidth: 140 },
  { prop: 'category', label: '分类', width: 110 },
  { prop: 'price', label: '价格（元）', width: 110 },
  { prop: 'stock', label: '库存', width: 100 },
  { prop: 'status', label: '状态', width: 90 },
  { prop: 'updatedAt', label: '更新时间', width: 160 },
  { prop: 'action', label: '操作', width: 130, fixed: 'right' as const },
]

const editOpen = ref(false)
const editingRow = ref<TestProductRow | null>(null)

function openEdit(row: TestProductRow) {
  editingRow.value = row
  editOpen.value = true
}

function handleSaved(saved: TestProductRow) {
  const index = rows.value.findIndex((item) => item.id === saved.id)
  if (index >= 0) {
    rows.value[index] = saved
  }
  ElMessage.success('保存成功')
}

function handleDelete(row: TestProductRow) {
  rows.value = rows.value.filter((item) => item.id !== row.id)
  ElMessage.success(`已删除「${row.name}」`)
}

const page = ref(1)
const pageSize = ref(8)

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

const total = computed(() => rows.value.length)

function handlePageChange(current: number) {
  page.value = current
}

function handleSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
}
</script>

<template>
  <section class="table-element-page">
    <div class="page-heading">
      <h1>测试表格（Element Plus）</h1>
      <p>el-table + el-pagination + 独立编辑弹窗组件 + 删除确认，共 {{ rows.length }} 条模拟数据。</p>
    </div>

    <div class="table-panel">
      <el-table :data="pagedRows" border stripe>
        <el-table-column v-for="col in columns" :key="col.prop" v-bind="col">
          <template v-if="col.prop === 'action'" #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除该商品吗？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[8, 15, 30]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <TestProductEditModal
      v-model:open="editOpen"
      :record="editingRow"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped>
.table-element-page {
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

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
