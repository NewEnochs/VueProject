<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { Dayjs } from 'dayjs'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

// 获取组件实例 proxy，等价于 options API 中的 this
const { proxy } = getCurrentInstance()!

const selectedPeriod = ref('近7天')
const selectedDepartment = ref('全部科室')
const selectedDate = ref<Dayjs | null>(null)
const refreshing = ref(false)
const updatedAt = ref('今天 10:28')
const dashboardRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

const periods = ['近7天', '近30天', '本季度']
const departments = ['全部科室', '内科', '外科', '儿科', '妇产科']

const periodFactor = computed(() => {
  if (selectedPeriod.value === '近30天') return 1.16
  if (selectedPeriod.value === '本季度') return 1.32
  return 1
})

const metrics = computed(() => [
  {
    label: '累计服务人次',
    value: Math.round(12860 * periodFactor.value),
    suffix: '人次',
    trend: 12.6,
    positive: true,
    icon: TeamOutlined,
    color: '#1677ff',
    background: '#eaf3ff',
  },
  {
    label: '今日接诊量',
    value: Math.round(846 * periodFactor.value),
    suffix: '人',
    trend: 8.2,
    positive: true,
    icon: CheckCircleOutlined,
    color: '#0b8f71',
    background: '#e7f8f2',
  },
  {
    label: '平均候诊时长',
    value: 18.6,
    suffix: '分钟',
    trend: 5.4,
    positive: false,
    icon: ClockCircleOutlined,
    color: '#d97706',
    background: '#fff5df',
  },
  {
    label: '患者满意度',
    value: 96.8,
    suffix: '%',
    trend: 2.1,
    positive: true,
    icon: ArrowUpOutlined,
    color: '#7656d6',
    background: '#f1edff',
  },
])

const chartInstances: ECharts[] = []
let resizeObserver: ResizeObserver | undefined

function createChart(element: HTMLElement | undefined, option: EChartsOption) {
  if (!element) return
  const chart = echarts.init(element)
  chart.setOption(option)
  chartInstances.push(chart)
}

function getLineOption(): EChartsOption {
  const factor = periodFactor.value
  return {
    color: ['#1677ff', '#10a37f'],
    tooltip: { trigger: 'axis' },
    legend: { top: 2, right: 8, itemWidth: 10, itemHeight: 10, textStyle: { color: '#647575' } },
    grid: { left: 12, right: 18, top: 42, bottom: 6, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#dfe8e7' } },
      axisTick: { show: false },
      axisLabel: { color: '#7d8d8c' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#edf2f2', type: 'dashed' } },
      axisLabel: { color: '#7d8d8c' },
    },
    series: [
      {
        name: '接诊人次',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: [520, 612, 578, 760, 815, 690, 846].map((item) => Math.round(item * factor)),
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(22, 119, 255, 0.10)' },
      },
      {
        name: '预约人次',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: [390, 440, 426, 530, 605, 510, 648].map((item) => Math.round(item * factor)),
        lineStyle: { width: 3 },
      },
    ],
  }
}

function getBarOption(): EChartsOption {
  const factor = periodFactor.value
  return {
    color: ['#1677ff'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 12, top: 18, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['内科', '外科', '儿科', '妇产科', '急诊科'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe8e7' } },
      axisLabel: { color: '#7d8d8c' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#edf2f2', type: 'dashed' } },
      axisLabel: { color: '#7d8d8c' },
    },
    series: [
      {
        name: '接诊量',
        type: 'bar',
        barMaxWidth: 34,
        data: [680, 560, 420, 395, 610].map((item, index) => ({
          value: Math.round(item * factor),
          itemStyle: { color: ['#1677ff', '#10a37f', '#f0a33a', '#7656d6', '#27a9c3'][index], borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  }
}

function getPieOption(): EChartsOption {
  return {
    color: ['#1677ff', '#10a37f', '#f0a33a', '#7656d6', '#27a9c3'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c}人 ({d}%)' },
    legend: { orient: 'vertical', right: 4, top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { color: '#647575' } },
    series: [
      {
        name: '患者来源',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['38%', '52%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 4 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 700 } },
        data: [
          { value: 426, name: '线上预约' },
          { value: 318, name: '现场挂号' },
          { value: 164, name: '复诊患者' },
          { value: 108, name: '转诊患者' },
          { value: 72, name: '其他渠道' },
        ],
      },
    ],
  }
}

function renderCharts() {
  chartInstances.splice(0).forEach((chart) => chart.dispose())
  createChart(lineChartRef.value, getLineOption())
  createChart(barChartRef.value, getBarOption())
  createChart(pieChartRef.value, getPieOption())
}

async function refreshData() {
  refreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  updatedAt.value = `今天 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  renderCharts()
  refreshing.value = false
}

// 通过全局方法 this.$message 触发不同消息类型
function showMessage(type: 'success' | 'error' | 'warning' | 'info') {
  const contentMap = {
    success: '操作成功，数据已保存',
    error: '操作失败，请稍后重试',
    warning: '注意：数据存在异常波动',
    info: '提示：页面数据已更新',
  }
  proxy?.$message[type](contentMap[type])
}

function showLoadingMessage() {
  const hide = proxy?.$message.loading('数据加载中...', 0)
  window.setTimeout(() => hide?.(), 2000)
}

function handleDateChange(date: Dayjs | null) {
  if (date) {
    proxy?.$message.success(`已选择日期：${date.format('YYYY-MM-DD')}`)
  }
}

watch([selectedPeriod, selectedDepartment], async () => {
  await nextTick()
  renderCharts()
})

onMounted(() => {
  renderCharts()
  if (dashboardRef.value) {
    resizeObserver = new ResizeObserver(() => chartInstances.forEach((chart) => chart.resize()))
    resizeObserver.observe(dashboardRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chartInstances.forEach((chart) => chart.dispose())
})
</script>

<template>
  <section ref="dashboardRef" class="data-view">
    <header class="page-heading">
      <div>
        <h1>数据概览</h1>
        <p>关键业务指标与服务运营趋势</p>
      </div>

      <div class="filters">
        <a-date-picker v-model:value="selectedDate" placeholder="选择日期" class="date-picker" @change="handleDateChange" />
        <el-select v-model="selectedDepartment" class="department-select" aria-label="选择科室">
          <el-option v-for="item in departments" :key="item" :label="item" :value="item" />
        </el-select>
        <el-segmented v-model="selectedPeriod" :options="periods" />
        <el-button :loading="refreshing" :icon="ReloadOutlined" @click="refreshData">刷新</el-button>
      </div>
    </header>

    <div class="summary-strip">
      <div>
        <span class="status-dot"></span>
        数据服务运行正常
      </div>
      <span>最近更新：{{ updatedAt }}</span>
    </div>

    <a-card class="message-demo-card" :bordered="false">
      <template #title>
        <div class="chart-title">
          <div>
            <strong>消息提示演示</strong>
            <span>通过全局方法 this.$message 触发不同消息类型</span>
          </div>
        </div>
      </template>
      <div class="message-demo-buttons">
        <a-button type="primary" @click="showMessage('success')">成功 Success</a-button>
        <a-button danger @click="showMessage('error')">错误 Error</a-button>
        <a-button @click="showMessage('warning')">警告 Warning</a-button>
        <a-button type="dashed" @click="showMessage('info')">信息 Info</a-button>
        <a-button @click="showLoadingMessage">加载 Loading</a-button>
      </div>
    </a-card>

    <a-row :gutter="[14, 14]" class="metrics-grid">
      <a-col v-for="metric in metrics" :key="metric.label" :xs="24" :sm="12" :xl="6">
        <a-card class="metric-card" :bordered="false">
          <div class="metric-topline">
            <span class="metric-icon" :style="{ color: metric.color, background: metric.background }">
              <component :is="metric.icon" />
            </span>
            <span class="trend" :class="{ decrease: !metric.positive }">
              <ArrowUpOutlined v-if="metric.positive" />
              <ArrowDownOutlined v-else />
              {{ metric.trend }}%
            </span>
          </div>
          <a-statistic :title="metric.label" :value="metric.value" :precision="Number.isInteger(metric.value) ? 0 : 1" :suffix="metric.suffix" />
          <p>较上一统计周期</p>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="chart-card trend-card" :bordered="false">
      <template #title>
        <div class="chart-title">
          <div>
            <strong>服务量趋势</strong>
            <span>每日接诊与预约情况</span>
          </div>
          <a-tag color="blue">折线图</a-tag>
        </div>
      </template>
      <div ref="lineChartRef" class="chart chart-wide" aria-label="服务量趋势折线图"></div>
    </a-card>

    <div class="chart-grid">
      <a-card class="chart-card" :bordered="false">
        <template #title>
          <div class="chart-title">
            <div>
              <strong>科室接诊量</strong>
              <span>各科室服务能力对比</span>
            </div>
            <a-tag color="cyan">柱形图</a-tag>
          </div>
        </template>
        <div ref="barChartRef" class="chart" aria-label="科室接诊量柱形图"></div>
      </a-card>

      <a-card class="chart-card" :bordered="false">
        <template #title>
          <div class="chart-title">
            <div>
              <strong>患者来源分布</strong>
              <span>不同就诊渠道占比</span>
            </div>
            <a-tag color="purple">饼图</a-tag>
          </div>
        </template>
        <div ref="pieChartRef" class="chart" aria-label="患者来源分布饼图"></div>
      </a-card>
    </div>
  </section>
</template>

<style scoped>
.data-view {
  min-width: 0;
  color: #183230;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.page-heading h1,
.page-heading p,
.metric-card p {
  margin: 0;
}

.page-heading h1 {
  font-size: 24px;
  line-height: 1.35;
}

.page-heading p {
  margin-top: 4px;
  color: #748684;
  font-size: 13px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-picker {
  width: 160px;
}

.department-select {
  width: 132px;
}

.message-demo-card {
  margin-bottom: 14px;
  border: 1px solid #e1e9e8;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(29, 65, 62, 0.05);
}

.message-demo-card :deep(.ant-card-body) {
  padding: 14px 18px;
}

.message-demo-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.summary-strip {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 8px 12px;
  border-left: 3px solid #10a37f;
  color: #617472;
  background: #edf8f5;
  font-size: 12px;
}

.summary-strip div {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #176b58;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10a37f;
  box-shadow: 0 0 0 4px rgba(16, 163, 127, 0.12);
}

.metrics-grid {
  margin-bottom: 14px;
}

.metric-card,
.chart-card {
  height: 100%;
  border: 1px solid #e1e9e8;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(29, 65, 62, 0.05);
}

/* 核心指标卡片 hover 高亮：边框高亮 + 阴影 + 轻微上移 */
.metric-card {
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.metric-card:hover {
  border-color: #1677ff;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.16);
  transform: translateY(-2px);
}

.metric-card :deep(.ant-card-body) {
  padding: 18px;
}

.metric-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  font-size: 17px;
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #0b8f71;
  font-size: 12px;
  font-weight: 600;
}

.trend.decrease {
  color: #d97706;
}

.metric-card :deep(.ant-statistic-title) {
  margin-bottom: 5px;
  color: #748684;
  font-size: 13px;
}

.metric-card :deep(.ant-statistic-content) {
  color: #183230;
  font-size: 27px;
  font-weight: 700;
}

.metric-card :deep(.ant-statistic-content-suffix) {
  margin-left: 5px;
  color: #748684;
  font-size: 12px;
  font-weight: 400;
}

.metric-card p {
  margin-top: 8px;
  color: #9aa8a7;
  font-size: 11px;
}

.trend-card {
  margin-bottom: 14px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.chart-card :deep(.ant-card-head) {
  min-height: 58px;
  padding: 0 18px;
  border-bottom-color: #edf2f2;
}

.chart-card :deep(.ant-card-body) {
  padding: 12px 16px 16px;
}

.chart-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart-title > div {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.chart-title strong {
  color: #183230;
  font-size: 15px;
}

.chart-title span {
  color: #879694;
  font-size: 11px;
  font-weight: 400;
}

.chart {
  width: 100%;
  height: 288px;
}

.chart-wide {
  height: 310px;
}

@media (max-width: 960px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .filters > * {
    max-width: 100%;
  }

  .department-select {
    width: 100%;
  }

  .summary-strip {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .chart,
  .chart-wide {
    height: 260px;
  }
}
</style>
