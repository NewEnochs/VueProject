<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { updatePassWord } from '@/api/api'

const visible = ref(false)
const formRef = ref()
const submitting = ref(false)

const formState = reactive({
  passWord: '',
  newPassWord: '',
  confirmPassword: '',
})

const rules = {
  passWord: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassWord: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '新密码长度不能少于 8 位', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string) => {
        if (!value) {
          return Promise.resolve()
        }
        if (/^\d+$/.test(value)) {
          return Promise.reject(new Error('新密码不能为纯数字'))
        }
        if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(value)) {
          return Promise.reject(new Error('新密码必须同时包含数字和英文'))
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string) => {
        if (!value) {
          return Promise.resolve()
        }
        if (value !== formState.newPassWord) {
          return Promise.reject(new Error('两次输入的密码不一致'))
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

function open() {
  formState.passWord = ''
  formState.newPassWord = ''
  formState.confirmPassword = ''
  visible.value = true
  formRef.value?.clearValidate()
}

async function handleOk() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await updatePassWord({
      passWord: formState.passWord,
      newPassWord: formState.newPassWord,
    })
    message.success('密码修改成功')
    visible.value = false
  } catch (error) {
    console.warn('update password error:', error)
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  visible.value = false
}

defineExpose({ open })
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="修改密码"
    :confirm-loading="submitting"
    :destroy-on-close="true"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
      <a-form-item label="原密码" name="passWord">
        <a-input-password
          v-model:value="formState.passWord"
          placeholder="请输入原密码"
          autocomplete="current-password"
        />
      </a-form-item>

      <a-form-item label="新密码" name="newPassWord">
        <a-input-password
          v-model:value="formState.newPassWord"
          placeholder="请输入新密码（不少于 8 位，数字+英文）"
          autocomplete="new-password"
        />
      </a-form-item>

      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password
          v-model:value="formState.confirmPassword"
          placeholder="请再次输入新密码"
          autocomplete="new-password"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
