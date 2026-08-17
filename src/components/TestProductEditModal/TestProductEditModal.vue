<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface TestProductRow {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
  updatedAt: string
}

const props = defineProps<{
  open: boolean
  record: TestProductRow | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', record: TestProductRow): void
}>()

const formRef = ref<FormInstance>()

const form = reactive<TestProductRow>({
  id: 0,
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: '',
  updatedAt: '',
})

const categories = ['数码产品', '家用电器', '食品生鲜', '服饰鞋包', '美妆个护', '图书文具']
const statuses = ['在售', '下架', '预售']

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

watch(
  () => props.open,
  (open) => {
    if (open && props.record) {
      Object.assign(form, props.record)
    }
  },
)

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  emit('saved', { ...form })
  emit('update:open', false)
}
</script>

<template>
  <el-dialog
    :model-value="open"
    title="编辑商品"
    width="520px"
    @update:model-value="emit('update:open', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" style="width: 100%" />
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" :step="5" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="item in statuses" :key="item" :value="item">{{ item }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:open', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>
