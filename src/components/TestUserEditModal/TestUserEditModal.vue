<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'

export interface TestUserRow {
  id: number
  name: string
  email: string
  phone: string
  department: string
  role: string
  status: string
  createdAt: string
}

const props = defineProps<{
  open: boolean
  record: TestUserRow | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', record: TestUserRow): void
}>()

const formRef = ref<FormInstance>()

const form = reactive<TestUserRow>({
  id: 0,
  name: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  status: '',
  createdAt: '',
})

const departments = ['研发部', '产品部', '设计部', '市场部', '运营部', '人事部']
const roles = ['管理员', '开发工程师', '产品经理', '设计师', '运营专员', '测试工程师']
const statuses = ['在职', '离职', '休假']

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
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

function handleOk() {
  formRef.value?.validate().then(() => {
    emit('saved', { ...form })
    emit('update:open', false)
  })
}
</script>

<template>
  <a-modal
    :open="open"
    title="编辑用户"
    :confirm-loading="false"
    @ok="handleOk"
    @cancel="emit('update:open', false)"
  >
    <a-form-model
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-model-item label="姓名" prop="name">
        <a-input v-model:value="form.name" placeholder="请输入姓名" />
      </a-form-model-item>
      <a-form-model-item label="邮箱" prop="email">
        <a-input v-model:value="form.email" placeholder="请输入邮箱" />
      </a-form-model-item>
      <a-form-model-item label="手机号" prop="phone">
        <a-input v-model:value="form.phone" placeholder="请输入手机号" />
      </a-form-model-item>
      <a-form-model-item label="部门" prop="department">
        <a-select v-model:value="form.department" placeholder="请选择部门">
          <a-select-option v-for="item in departments" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="角色" prop="role">
        <a-select v-model:value="form.role" placeholder="请选择角色">
          <a-select-option v-for="item in roles" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="状态" prop="status">
        <a-radio-group v-model:value="form.status">
          <a-radio v-for="item in statuses" :key="item" :value="item">
            {{ item }}
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
