<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive<Record<string, any>>({
  username: '',
  password: '',
  age: 25,
  remark: '',
  gender: 'male',
  hobbies: [] as string[],
  city: '',
  region: [] as string[],
  date: '',
  time: '',
  enabled: true,
  progress: 60,
  score: 4,
  department: '',
})

const hobbiesOptions = [
  { label: '阅读', value: '阅读' },
  { label: '运动', value: '运动' },
  { label: '音乐', value: '音乐' },
  { label: '旅行', value: '旅行' },
  { label: '摄影', value: '摄影' },
  { label: '美食', value: '美食' },
]
const cityOptions = ['北京', '上海', '广州', '深圳', '重庆', '成都']
const regionOptions = [
  { value: 'southwest', label: '西南', children: [{ value: 'cq', label: '重庆' }, { value: 'cd', label: '成都' }] },
  { value: 'east', label: '华东', children: [{ value: 'sh', label: '上海' }, { value: 'hz', label: '杭州' }] },
  { value: 'north', label: '华北', children: [{ value: 'bj', label: '北京' }, { value: 'tj', label: '天津' }] },
]
const treeData = [
  {
    label: '总公司',
    children: [
      { label: '研发中心', children: [{ label: '前端组' }, { label: '后端组' }] },
      { label: '产品部' },
      { label: '市场部' },
    ],
  },
]
const treeProps = { label: 'label', children: 'children' }

const jsonOutput = ref('')
const savedAt = ref('')

function handleSave() {
  jsonOutput.value = JSON.stringify({ ...form }, null, 2)
  savedAt.value = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.success('已生成表单 JSON')
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <section class="form-element-page">
    <div class="page-heading">
      <h1>测试表单（Element Plus）</h1>
      <p>el-form 展示基础表单控件，保存后底部输出 JSON，取消返回上一页。</p>
    </div>

    <div class="form-panel">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="0" :max="120" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="兴趣爱好">
          <el-checkbox-group v-model="form.hobbies">
            <el-checkbox v-for="item in hobbiesOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="所在城市">
          <el-select v-model="form.city" placeholder="请选择城市" clearable style="width: 240px">
            <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属区域">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            placeholder="请选择区域"
            clearable
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="入职日期">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="上班时间">
          <el-time-picker
            v-model="form.time"
            placeholder="请选择时间"
            value-format="HH:mm:ss"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="form.enabled" active-text="开" inactive-text="关" />
        </el-form-item>

        <el-form-item label="进度">
          <el-slider v-model="form.progress" :min="0" :max="100" style="width: 300px" />
        </el-form-item>

        <el-form-item label="评分">
          <el-rate v-model="form.score" />
        </el-form-item>

        <el-form-item label="所属部门">
          <el-tree-select
            v-model="form.department"
            :data="treeData"
            :props="treeProps"
            node-key="label"
            default-expand-all
            placeholder="请选择部门"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="jsonOutput" class="json-panel">
      <div class="json-heading">
        <strong>表单 JSON（{{ savedAt }}）</strong>
      </div>
      <pre>{{ jsonOutput }}</pre>
    </div>
  </section>
</template>

<style scoped>
.form-element-page {
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

.form-panel,
.json-panel {
  padding: 22px;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}

.json-panel pre {
  margin: 10px 0 0;
  padding: 14px;
  overflow: auto;
  border-radius: 6px;
  color: #dcefea;
  background: #12312e;
  font-size: 12px;
  line-height: 1.6;
}

.json-heading strong {
  color: #315e59;
}
</style>
