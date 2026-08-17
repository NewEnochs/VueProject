<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import type { UploadFile } from 'ant-design-vue'
import {
  DeleteOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()

const form = reactive<Record<string, any>>({
  username: '',
  password: '',
  age: 25,
  remark: '',
  gender: 'male',
  hobbies: [],
  city: undefined,
  region: undefined,
  date: undefined as Dayjs | undefined,
  month: undefined as Dayjs | undefined,
  year: undefined as Dayjs | undefined,
  time: undefined as Dayjs | undefined,
  enabled: true,
  progress: 60,
  score: 4,
  department: undefined,
  imageFiles: [] as string[],
  docFiles: [] as string[],
})

const hobbiesOptions = ['阅读', '运动', '音乐', '旅行', '摄影', '美食']
const cityOptions = ['北京', '上海', '广州', '深圳', '重庆', '成都']
const regionOptions = [
  { value: 'southwest', label: '西南', children: [{ value: 'cq', label: '重庆' }, { value: 'cd', label: '成都' }] },
  { value: 'east', label: '华东', children: [{ value: 'sh', label: '上海' }, { value: 'hz', label: '杭州' }] },
  { value: 'north', label: '华北', children: [{ value: 'bj', label: '北京' }, { value: 'tj', label: '天津' }] },
]
const treeData = [
  {
    title: '总公司',
    value: 'corp',
    children: [
      { title: '研发中心', value: 'rd', children: [{ title: '前端组', value: 'fe' }, { title: '后端组', value: 'be' }] },
      { title: '产品部', value: 'pd' },
      { title: '市场部', value: 'mk' },
    ],
  },
]

const formRef = ref()

// 弹层挂载到触发元素父容器，避免滚动容器内下拉面板定位错位
function getPopupContainer(trigger: any): HTMLElement {
  return trigger?.parentElement || document.body
}

const rules: Record<string, any[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度需在 2-20 个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度需在 8-20 个字符之间', trigger: 'blur' },
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'change' },
    { type: 'number', min: 1, max: 120, message: '年龄需在 1-120 之间', trigger: 'change' },
  ],
  remark: [
    { required: true, message: '请输入备注', trigger: 'blur' },
    { min: 2, max: 200, message: '备注长度需在 2-200 个字符之间', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  hobbies: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个兴趣爱好', trigger: 'change' },
  ],
  city: [{ required: true, message: '请选择所在城市', trigger: 'change' }],
  region: [
    { required: true, type: 'array', min: 1, message: '请选择所属区域', trigger: 'change' },
  ],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  time: [{ required: true, message: '请选择上班时间', trigger: 'change' }],
  enabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
  progress: [{ required: true, message: '请设置进度', trigger: 'change' }],
  score: [{ required: true, message: '请设置评分', trigger: 'change' }],
  department: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  imageFiles: [
    { required: true, type: 'array', min: 1, message: '请至少上传一张图片', trigger: 'change' },
  ],
  docFiles: [
    { required: true, type: 'array', min: 1, message: '请至少上传一个文档', trigger: 'change' },
  ],
}

// ---------- 上传相关 ----------
const imageFileList = ref<UploadFile[]>([])
const docFileList = ref<UploadFile[]>([])

const imagePreviewOpen = ref(false)
const previewImageUrl = ref('')

const docPreviewOpen = ref(false)
const previewDoc = ref<{ name: string; url: string; ext: string } | null>(null)
const previewDocText = ref('')

const textExts = ['txt', 'md', 'json', 'log', 'js', 'ts', 'vue', 'html', 'css', 'xml', 'yaml', 'yml']

function fileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isTextDoc(ext: string) {
  return textExts.includes(ext)
}

function formatSize(size?: number) {
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function toRcFile(file: File) {
  const rc = file as any
  rc.uid = `rc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  rc.lastModifiedDate = new Date(file.lastModified)
  return rc as UploadFile['originFileObj']
}

function beforeImageUpload(file: File) {
  const url = URL.createObjectURL(file)
  imageFileList.value = [
    ...imageFileList.value,
    {
      uid: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      status: 'done',
      url,
      thumbUrl: url,
      originFileObj: toRcFile(file),
    },
  ]
  return false
}

function beforeDocUpload(file: File) {
  const url = URL.createObjectURL(file)
  docFileList.value = [
    ...docFileList.value,
    {
      uid: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      status: 'done',
      url,
      size: file.size,
      originFileObj: toRcFile(file),
    },
  ]
  return false
}

function handleImagePreview(file: UploadFile) {
  previewImageUrl.value = file.url || file.thumbUrl || ''
  imagePreviewOpen.value = true
}

function removeImage(file: UploadFile) {
  imageFileList.value = imageFileList.value.filter((item) => item.uid !== file.uid)
}

function docIcon(name: string) {
  const ext = fileExt(name)
  if (ext === 'pdf') return FilePdfOutlined
  if (['doc', 'docx'].includes(ext)) return FileWordOutlined
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileExcelOutlined
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return FileZipOutlined
  if (isTextDoc(ext)) return FileTextOutlined
  return FileOutlined
}

function handleDocPreview(file: UploadFile) {
  const ext = fileExt(file.name)
  previewDoc.value = { name: file.name, url: file.url || '', ext }
  previewDocText.value = ''
  docPreviewOpen.value = true
  if (isTextDoc(ext) && file.originFileObj) {
    const reader = new FileReader()
    reader.onload = () => {
      previewDocText.value = String(reader.result || '')
    }
    reader.readAsText(file.originFileObj)
  }
}

function removeDoc(file: UploadFile) {
  docFileList.value = docFileList.value.filter((item) => item.uid !== file.uid)
}

// ---------- 保存 / 取消 ----------
const jsonOutput = ref('')
const savedAt = ref('')

async function handleSave() {
  // 同步上传列表到 form，供 rules 校验
  form.imageFiles = imageFileList.value.map((item) => item.name)
  form.docFiles = docFileList.value.map((item) => item.name)
  try {
    await formRef.value?.validate()
  } catch {
    message.warning('请完善表单后再保存')
    return
  }
  const output = {
    ...form,
    date: form.date ? form.date.format('YYYY-MM-DD') : '',
    month: form.month ? form.month.format('YYYY-MM') : '',
    year: form.year ? form.year.format('YYYY') : '',
    time: form.time ? form.time.format('HH:mm:ss') : '',
    imageFiles: form.imageFiles,
    docFiles: form.docFiles,
  }
  jsonOutput.value = JSON.stringify(output, null, 2)
  savedAt.value = new Date().toLocaleString('zh-CN', { hour12: false })
  message.success('已生成表单 JSON')
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <section class="form-antd-page">
    <div class="page-heading">
      <h1>测试表单（Ant Design Vue）</h1>
      <p>a-form 4.x + a-row/a-col 布局，每类控件单独一行；支持日期/月份/年份、级联、树选择与图片/文档上传预览，保存前校验，通过后底部输出 JSON，取消返回上一页。</p>
    </div>

    <div class="form-panel">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
      >
        <a-row class="form-row">
          <a-col :span="5" class="form-label">用户名</a-col>
          <a-col :span="16">
            <a-form-item name="username">
              <a-input v-model:value="form.username" placeholder="请输入用户名" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">密码</a-col>
          <a-col :span="16">
            <a-form-item name="password">
              <a-input-password v-model:value="form.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">年龄</a-col>
          <a-col :span="16">
            <a-form-item name="age">
              <a-input-number v-model:value="form.age" :min="0" :max="120" style="width: 200px" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label form-label-top">备注</a-col>
          <a-col :span="16">
            <a-form-item name="remark">
              <a-textarea v-model:value="form.remark" :rows="3" placeholder="请输入备注信息" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">性别</a-col>
          <a-col :span="16">
            <a-form-item name="gender">
              <a-radio-group v-model:value="form.gender">
                <a-radio value="male">男</a-radio>
                <a-radio value="female">女</a-radio>
                <a-radio value="other">其他</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">兴趣爱好</a-col>
          <a-col :span="16">
            <a-form-item name="hobbies">
              <a-checkbox-group v-model:value="form.hobbies" :options="hobbiesOptions" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">所在城市</a-col>
          <a-col :span="16">
            <a-form-item name="city">
              <a-select
                v-model:value="form.city"
                :get-popup-container="getPopupContainer"
                placeholder="请选择城市"
                allow-clear
                style="width: 240px"
              >
                <a-select-option v-for="item in cityOptions" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">所属区域（级联）</a-col>
          <a-col :span="16">
            <a-form-item name="region">
              <a-cascader
                v-model:value="form.region"
                :get-popup-container="getPopupContainer"
                :options="regionOptions"
                placeholder="请选择区域"
                style="width: 240px"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">日期选择</a-col>
          <a-col :span="16">
            <a-form-item name="date">
              <a-date-picker v-model:value="form.date" :get-popup-container="getPopupContainer" style="width: 240px" placeholder="请选择日期" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">月份选择</a-col>
          <a-col :span="16">
            <a-form-item name="month">
              <a-date-picker v-model:value="form.month" picker="month" :get-popup-container="getPopupContainer" style="width: 240px" placeholder="请选择月份" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">年份选择</a-col>
          <a-col :span="16">
            <a-form-item name="year">
              <a-date-picker v-model:value="form.year" picker="year" :get-popup-container="getPopupContainer" style="width: 240px" placeholder="请选择年份" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">上班时间</a-col>
          <a-col :span="16">
            <a-form-item name="time">
              <a-time-picker v-model:value="form.time" :get-popup-container="getPopupContainer" style="width: 240px" placeholder="请选择时间" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">是否启用</a-col>
          <a-col :span="16">
            <a-form-item name="enabled">
              <a-switch v-model:checked="form.enabled" checked-children="开" un-checked-children="关" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">进度</a-col>
          <a-col :span="16">
            <a-form-item name="progress">
              <a-slider v-model:value="form.progress" :min="0" :max="100" style="width: 300px" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">评分</a-col>
          <a-col :span="16">
            <a-form-item name="score">
              <a-rate v-model:value="form.score" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">所属部门（树选择）</a-col>
          <a-col :span="16">
            <a-form-item name="department">
              <a-tree-select
                v-model:value="form.department"
                :get-popup-container="getPopupContainer"
                :tree-data="treeData"
                tree-default-expand-all
                placeholder="请选择部门"
                style="width: 240px"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label">图片上传</a-col>
          <a-col :span="16">
            <a-form-item name="imageFiles">
              <div class="upload-wrap">
                <a-upload
                  v-model:file-list="imageFileList"
                  list-type="picture-card"
                  accept="image/*"
                  :before-upload="beforeImageUpload"
                >
                  <template #itemRender="{ file, fileList, actions }">
                    <div class="image-item">
                      <a-tooltip :title="file.name">
                        <img
                          class="image-thumb"
                          :src="file.url || file.thumbUrl"
                          alt=""
                          @click="handleImagePreview(file)"
                        />
                      </a-tooltip>
                      <span class="image-actions">
                        <a-button type="link" size="small" class="image-action-btn" @click.stop="handleImagePreview(file)">
                          <EyeOutlined />
                        </a-button>
                        <a-button type="link" size="small" danger class="image-action-btn" @click.stop="actions.remove">
                          <DeleteOutlined />
                        </a-button>
                      </span>
                    </div>
                  </template>
                  <div v-if="imageFileList.length < 9" class="upload-trigger">
                    <PlusOutlined class="upload-trigger-icon" />
                    <div class="upload-trigger-text">上传图片</div>
                  </div>
                </a-upload>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row">
          <a-col :span="5" class="form-label form-label-top">文档上传</a-col>
          <a-col :span="16">
            <a-form-item name="docFiles">
              <div class="upload-wrap">
                <a-upload
                  v-model:file-list="docFileList"
                  :show-upload-list="false"
                  multiple
                  :before-upload="beforeDocUpload"
                >
                  <a-button>
                    <UploadOutlined />
                    选择文件
                  </a-button>
                </a-upload>
                <div v-if="docFileList.length" class="doc-list">
                  <a-tooltip v-for="file in docFileList" :key="file.uid" :title="file.name">
                    <div class="doc-item" @click="handleDocPreview(file)">
                      <component :is="docIcon(file.name)" class="doc-icon" />
                      <span class="doc-name">{{ file.name }}</span>
                      <span class="doc-size">{{ formatSize(file.size) }}</span>
                      <span class="doc-actions">
                        <a-button type="link" size="small" @click.stop="handleDocPreview(file)">
                          <EyeOutlined />
                        </a-button>
                        <a-button type="link" size="small" danger @click.stop="removeDoc(file)">
                          <DeleteOutlined />
                        </a-button>
                      </span>
                    </div>
                  </a-tooltip>
                </div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row class="form-row form-row-actions">
          <a-col :span="5"></a-col>
          <a-col :span="16">
            <a-space>
              <a-button type="primary" @click="handleSave">保存</a-button>
              <a-button @click="handleCancel">取消</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div v-if="jsonOutput" class="json-panel">
      <div class="json-heading">
        <strong>表单 JSON（{{ savedAt }}）</strong>
      </div>
      <pre>{{ jsonOutput }}</pre>
    </div>

    <!-- 图片大图预览 -->
    <a-modal :open="imagePreviewOpen" :footer="null" @cancel="imagePreviewOpen = false">
      <img :src="previewImageUrl" class="image-preview-img" alt="预览图片" />
    </a-modal>

    <!-- 文档内容预览 -->
    <a-modal
      :open="docPreviewOpen"
      :title="previewDoc?.name"
      :footer="null"
      width="760px"
      @cancel="docPreviewOpen = false"
    >
      <iframe
        v-if="previewDoc && previewDoc.ext === 'pdf'"
        :src="previewDoc.url"
        class="doc-preview-frame"
      />
      <pre v-else-if="previewDoc && isTextDoc(previewDoc.ext)" class="doc-preview-text">
{{ previewDocText || '正在加载...' }}
      </pre>
      <div v-else class="doc-preview-unsupported">
        该文件类型暂不支持在线预览，请下载后使用本地软件查看。
      </div>
    </a-modal>
  </section>
</template>

<style scoped>
.form-antd-page {
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

/* 表单区域：控件过多时出现下拉滚动条，保持页面布局正常 */
.form-panel,
.json-panel {
  padding: 22px;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
}

.form-panel {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

/* a-row/a-col 表单行 */
.form-row {
  margin-bottom: 4px;
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  color: #315e59;
  font-size: 14px;
  line-height: 1.6;
}

.form-label::after {
  content: '：';
}

/* 多行控件（备注、文档列表）label 顶部对齐 */
.form-label-top {
  align-items: flex-start;
  padding-top: 8px;
}

/* a-form-item 默认底部留白较大，行内收紧 */
.form-row :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.form-row-actions :deep(.ant-form-item) {
  margin-bottom: 0;
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

/* ---------- 上传 ---------- */
.upload-wrap {
  display: grid;
  gap: 10px;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #94a3a1;
}

.upload-trigger-icon {
  font-size: 20px;
}

.upload-trigger-text {
  margin-top: 4px;
  font-size: 12px;
}

.image-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
}

.image-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  background: rgba(0, 0, 0, 0.45);
  transition: opacity 0.2s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-action-btn {
  color: #fff;
  line-height: 1;
  padding: 0 4px;
}

.image-action-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.2);
}

.doc-list {
  display: grid;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #dce7e5;
  border-radius: 6px;
  background: #f8fbfb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.doc-item:hover {
  border-color: #12a594;
  box-shadow: 0 2px 8px rgba(18, 165, 148, 0.12);
}

.doc-icon {
  font-size: 22px;
  color: #2f80ed;
  flex-shrink: 0;
}

.doc-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #315e59;
  font-size: 13px;
}

.doc-size {
  flex-shrink: 0;
  color: #94a3a1;
  font-size: 11px;
}

.doc-actions {
  flex-shrink: 0;
  display: flex;
  gap: 2px;
}

/* ---------- 预览 ---------- */
.image-preview-img {
  width: 100%;
  border-radius: 6px;
}

.doc-preview-frame {
  width: 100%;
  height: 60vh;
  border: 0;
  border-radius: 6px;
}

.doc-preview-text {
  margin: 0;
  padding: 14px;
  max-height: 60vh;
  overflow: auto;
  border-radius: 6px;
  background: #12312e;
  color: #dcefea;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.doc-preview-unsupported {
  padding: 40px;
  text-align: center;
  color: #94a3a1;
}
</style>
