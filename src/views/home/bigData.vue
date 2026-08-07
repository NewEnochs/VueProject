<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import {
  AlertOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

const dashboardRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
const resourceChartRef = ref<HTMLElement>()
const satisfactionChartRef = ref<HTMLElement>()
const currentTime = ref('')
const refreshing = ref(false)
const refreshSeed = ref(0)

const overviewItems = computed(() => [
  { label: '今日服务量', value: (3842 + refreshSeed.value * 7).toLocaleString(), unit: '人次', color: '#2f80ed' },
  { label: '在线医生', value: 186 + refreshSeed.value, unit: '人', color: '#12a594' },
  { label: '床位使用率', value: '86.4', unit: '%', color: '#f59e0b' },
  { label: '平台请求量', value: '28.6', unit: '万次', color: '#7c5ce7' },
])

const appointments = [
  { time: '10:32', patient: '李**', department: '心血管内科', doctor: '张医生', status: '候诊中', type: 'warning' },
  { time: '10:28', patient: '王**', department: '儿科', doctor: '周医生', status: '已接诊', type: 'success' },
  { time: '10:24', patient: '陈**', department: '骨科', doctor: '赵医生', status: '候诊中', type: 'warning' },
  { time: '10:18', patient: '刘**', department: '妇产科', doctor: '孙医生', status: '已完成', type: 'info' },
  { time: '10:12', patient: '杨**', department: '呼吸内科', doctor: '吴医生', status: '已接诊', type: 'success' },
] as const

const departmentRanking = [
  { rank: 1, name: '心血管内科', visits: 682, rate: 92 },
  { rank: 2, name: '呼吸内科', visits: 614, rate: 84 },
  { rank: 3, name: '骨科', visits: 578, rate: 78 },
  { rank: 4, name: '儿科', visits: 526, rate: 69 },
  { rank: 5, name: '妇产科', visits: 468, rate: 61 },
]

const alerts = [
  { level: '高', title: '急诊候诊人数超过阈值', detail: '当前候诊 46 人，建议增派医护人员', time: '3分钟前' },
  { level: '中', title: '3号检查设备负载较高', detail: '连续运行 7.2 小时，请关注设备状态', time: '12分钟前' },
  { level: '低', title: '药品库存即将补货', detail: '2类常用药品低于安全库存', time: '28分钟前' },
  { level: '低', title: '数据同步任务延迟', detail: '影像系统同步延迟约 36 秒', time: '41分钟前' },
] as const

const chartInstances: ECharts[] = []
let resizeObserver: ResizeObserver | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined

function chartBase(): Pick<EChartsOption, 'textStyle' | 'animationDuration'> {
  return {
    textStyle: { fontFamily: 'Arial, sans-serif', color: '#697c7a' },
    animationDuration: 700,
  }
}

function initChart(element: HTMLElement | undefined, option: EChartsOption) {
  if (!element) return
  const instance = echarts.init(element)
  instance.setOption(option)
  chartInstances.push(instance)
}

function trendOption(): EChartsOption {
  const offset = refreshSeed.value * 4
  return {
    ...chartBase(),
    color: ['#2f80ed', '#12a594'],
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { color: '#788987', fontSize: 11 } },
    grid: { left: 4, right: 8, top: 34, bottom: 2, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe8e7' } },
      axisLabel: { color: '#899997', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#899997', fontSize: 10 },
      splitLine: { lineStyle: { color: '#edf2f2', type: 'dashed' } },
    },
    series: [
      {
        name: '门诊',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(47,128,237,.10)' },
        data: [186, 428, 516, 582, 646, 720].map((value) => value + offset),
      },
      {
        name: '住院',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        data: [92, 166, 218, 286, 314, 358].map((value) => value + offset / 2),
      },
    ],
  }
}

function distributionOption(): EChartsOption {
  return {
    ...chartBase(),
    color: ['#2f80ed', '#12a594', '#f59e0b', '#7c5ce7', '#20a9c7'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c}人次 · {d}%' },
    legend: { bottom: 0, left: 'center', itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 10, color: '#788987' } },
    series: [
      {
        type: 'pie',
        center: ['50%', '43%'],
        radius: ['46%', '69%'],
        itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 3 },
        label: { show: false },
        data: [
          { value: 1086, name: '内科' },
          { value: 826, name: '外科' },
          { value: 684, name: '儿科' },
          { value: 576, name: '妇产科' },
          { value: 412, name: '其他' },
        ],
      },
    ],
  }
}

function sourceOption(): EChartsOption {
  return {
    ...chartBase(),
    color: ['#2f80ed'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 4, right: 16, top: 8, bottom: 4, containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#edf2f2', type: 'dashed' } },
      axisLabel: { color: '#899997', fontSize: 10 },
    },
    yAxis: {
      type: 'category',
      data: ['转诊', '现场', '电话', '公众号', '小程序'],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#697c7a', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 13,
        data: [286, 512, 638, 846, 1028].map((value, index) => ({
          value,
          itemStyle: { color: ['#a7c8f5', '#7eb8a8', '#f4c777', '#9b88df', '#2f80ed'][index], borderRadius: [0, 4, 4, 0] },
        })),
      },
    ],
  }
}

function resourceOption(): EChartsOption {
  return {
    ...chartBase(),
    color: ['#12a594'],
    tooltip: {},
    radar: {
      center: ['50%', '51%'],
      radius: '66%',
      splitNumber: 4,
      axisName: { color: '#697c7a', fontSize: 11 },
      axisLine: { lineStyle: { color: '#dae5e3' } },
      splitLine: { lineStyle: { color: '#dae5e3' } },
      splitArea: { areaStyle: { color: ['#fbfdfd', '#f4f8f7'] } },
      indicator: [
        { name: '医生', max: 100 },
        { name: '护士', max: 100 },
        { name: '床位', max: 100 },
        { name: '设备', max: 100 },
        { name: '药品', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [{ value: [88, 76, 86, 69, 92], name: '资源使用率' }],
        symbolSize: 5,
        lineStyle: { width: 2 },
        areaStyle: { color: 'rgba(18,165,148,.22)' },
      },
    ],
  }
}

function satisfactionOption(): EChartsOption {
  return {
    ...chartBase(),
    series: [
      {
        type: 'gauge',
        center: ['50%', '58%'],
        radius: '88%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 5,
        progress: { show: true, width: 14, itemStyle: { color: '#12a594' } },
        axisLine: { lineStyle: { width: 14, color: [[1, '#e7efee']] } },
        axisTick: { show: false },
        splitLine: { distance: -20, length: 5, lineStyle: { color: '#a7b7b5', width: 1 } },
        axisLabel: { distance: 4, color: '#899997', fontSize: 9 },
        pointer: { width: 4, length: '58%', itemStyle: { color: '#2c5551' } },
        anchor: { show: true, size: 8, itemStyle: { color: '#2c5551' } },
        title: { offsetCenter: [0, '73%'], color: '#788987', fontSize: 11 },
        detail: { valueAnimation: true, offsetCenter: [0, '35%'], formatter: '{value}%', color: '#183b37', fontSize: 24, fontWeight: 700 },
        data: [{ value: 96.8, name: '综合满意度' }],
      },
    ],
  }
}

function renderCharts() {
  chartInstances.splice(0).forEach((chart) => chart.dispose())
  initChart(trendChartRef.value, trendOption())
  initChart(distributionChartRef.value, distributionOption())
  initChart(sourceChartRef.value, sourceOption())
  initChart(resourceChartRef.value, resourceOption())
  initChart(satisfactionChartRef.value, satisfactionOption())
}

function updateClock() {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

async function refreshDashboard() {
  refreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 450))
  refreshSeed.value += 1
  renderCharts()
  refreshing.value = false
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  renderCharts()

  if (dashboardRef.value) {
    resizeObserver = new ResizeObserver(() => chartInstances.forEach((chart) => chart.resize()))
    resizeObserver.observe(dashboardRef.value)
  }
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  resizeObserver?.disconnect()
  chartInstances.forEach((chart) => chart.dispose())
})
</script>

<template>
  <section ref="dashboardRef" class="big-data-page">
    <header class="dashboard-heading">
      <div>
        <div class="heading-title">
          <span class="live-indicator"></span>
          <h1>医疗运营大数据看板</h1>
        </div>
        <p>汇聚门诊、住院、资源与服务质量数据</p>
      </div>
      <div class="heading-actions">
        <span class="dashboard-time">{{ currentTime }}</span>
        <el-button :icon="ReloadOutlined" :loading="refreshing" @click="refreshDashboard">刷新数据</el-button>
      </div>
    </header>

    <div class="dashboard-grid">
      <article class="dashboard-panel overview-panel">
        <div class="panel-heading">
          <div><RiseOutlined /><strong>核心指标</strong></div>
          <el-tag type="success" effect="plain" size="small">实时</el-tag>
        </div>
        <div class="overview-grid">
          <div v-for="item in overviewItems" :key="item.label" class="overview-item">
            <span>{{ item.label }}</span>
            <div><strong :style="{ color: item.color }">{{ item.value }}</strong><small>{{ item.unit }}</small></div>
          </div>
        </div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <div><ArrowUpOutlined /><strong>服务量实时趋势</strong></div>
          <span>单位：人次</span>
        </div>
        <div ref="trendChartRef" class="panel-chart" aria-label="服务量实时趋势折线图"></div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <div><TeamOutlined /><strong>科室服务分布</strong></div>
          <span>今日累计</span>
        </div>
        <div ref="distributionChartRef" class="panel-chart" aria-label="科室服务分布饼图"></div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <div><RiseOutlined /><strong>预约来源分析</strong></div>
          <span>五大渠道</span>
        </div>
        <div ref="sourceChartRef" class="panel-chart" aria-label="预约来源柱形图"></div>
      </article>

      <article class="dashboard-panel appointment-panel">
        <div class="panel-heading">
          <div><ClockCircleOutlined /><strong>实时预约动态</strong></div>
          <span class="live-text">持续更新</span>
        </div>
        <div class="list-header appointment-row">
          <span>时间 / 患者</span><span>科室</span><span>接诊医生</span><span>状态</span>
        </div>
        <div class="appointment-list">
          <div v-for="item in appointments" :key="`${item.time}-${item.patient}`" class="appointment-row">
            <span><small>{{ item.time }}</small>{{ item.patient }}</span>
            <span>{{ item.department }}</span>
            <span>{{ item.doctor }}</span>
            <span><el-tag :type="item.type" effect="light" size="small">{{ item.status }}</el-tag></span>
          </div>
        </div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <div><CheckCircleOutlined /><strong>医疗资源使用率</strong></div>
          <span>综合分析</span>
        </div>
        <div ref="resourceChartRef" class="panel-chart" aria-label="医疗资源使用率雷达图"></div>
      </article>

      <article class="dashboard-panel ranking-panel">
        <div class="panel-heading">
          <div><TeamOutlined /><strong>科室接诊排行</strong></div>
          <span>TOP 5</span>
        </div>
        <div class="ranking-list">
          <div v-for="item in departmentRanking" :key="item.rank" class="ranking-row">
            <span class="rank" :class="{ top: item.rank <= 3 }">{{ item.rank }}</span>
            <div class="ranking-info">
              <div><strong>{{ item.name }}</strong><span>{{ item.visits }} 人次</span></div>
              <el-progress :percentage="item.rate" :show-text="false" :stroke-width="6" />
            </div>
          </div>
        </div>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <div><CheckCircleOutlined /><strong>患者满意度</strong></div>
          <el-tag type="success" effect="plain" size="small">优秀</el-tag>
        </div>
        <div ref="satisfactionChartRef" class="panel-chart" aria-label="患者满意度仪表盘"></div>
      </article>

      <article class="dashboard-panel alert-panel">
        <div class="panel-heading">
          <div><AlertOutlined /><strong>智能预警中心</strong></div>
          <a-badge :count="alerts.length" :overflow-count="9" />
        </div>
        <div class="alert-list">
          <div v-for="item in alerts" :key="item.title" class="alert-row">
            <span class="alert-level" :class="`level-${item.level}`">{{ item.level }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.detail }}</p>
            </div>
            <time>{{ item.time }}</time>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.big-data-page {
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 16px 18px 20px;
  color: #183b37;
  background: #f4f8f7;
}

.dashboard-heading {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
  padding: 0 4px;
}

.heading-title,
.heading-actions,
.panel-heading,
.panel-heading > div {
  display: flex;
  align-items: center;
}

.heading-title {
  gap: 9px;
}

.heading-title h1,
.dashboard-heading p {
  margin: 0;
}

.heading-title h1 {
  font-size: 23px;
  line-height: 1.35;
}

.dashboard-heading p {
  margin-top: 4px;
  color: #778987;
  font-size: 12px;
}

.live-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #12a594;
  box-shadow: 0 0 0 5px rgba(18, 165, 148, 0.12);
}

.heading-actions {
  gap: 12px;
}

.dashboard-time {
  color: #54706d;
  font-family: Consolas, monospace;
  font-size: 13px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, 278px);
  gap: 14px;
}

.dashboard-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #dfe9e7;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(30, 67, 63, 0.055);
}

/* 目标模块面板 hover 高亮：核心指标 / 实时预约动态 / 智能预警中心 */
.overview-panel,
.appointment-panel,
.alert-panel {
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.overview-panel:hover,
.appointment-panel:hover,
.alert-panel:hover {
  border-color: #2f80ed;
  box-shadow: 0 10px 26px rgba(47, 128, 237, 0.16);
  transform: translateY(-2px);
}

/* 核心指标项 hover 高亮 */
.overview-item {
  transition: background-color 0.2s ease;
}

.overview-item:hover {
  background: #f2f8ff;
}

.panel-heading {
  height: 48px;
  justify-content: space-between;
  gap: 12px;
  padding: 0 15px;
  border-bottom: 1px solid #edf2f1;
}

.panel-heading > div {
  min-width: 0;
  gap: 7px;
  color: #315e59;
}

.panel-heading strong {
  color: #244944;
  font-size: 14px;
}

.panel-heading > span {
  flex: 0 0 auto;
  color: #94a3a1;
  font-size: 10px;
}

.panel-heading .live-text {
  color: #12a594;
}

.panel-chart {
  width: 100%;
  height: calc(100% - 48px);
}

.overview-grid {
  height: calc(100% - 48px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
}

.overview-item:nth-child(odd) {
  border-right: 1px solid #edf2f1;
}

.overview-item:nth-child(-n + 2) {
  border-bottom: 1px solid #edf2f1;
}

.overview-item > span {
  color: #778987;
  font-size: 11px;
}

.overview-item div {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.overview-item strong {
  font-size: 24px;
  line-height: 1;
}

.overview-item small {
  color: #94a3a1;
  font-size: 10px;
}

.list-header,
.appointment-row {
  display: grid;
  grid-template-columns: 1.15fr 1.25fr 0.9fr 0.85fr;
  align-items: center;
  column-gap: 8px;
}

.list-header {
  height: 29px;
  padding: 0 13px;
  color: #94a3a1;
  background: #f8fbfa;
  font-size: 10px;
}

.appointment-list {
  padding: 0 13px;
}

.appointment-row:not(.list-header) {
  min-height: 39px;
  border-bottom: 1px solid #f0f4f3;
  color: #5d716e;
  font-size: 11px;
}

/* 实时预约动态行 hover 高亮 */
.appointment-row:not(.list-header) {
  transition: background-color 0.2s ease;
}

.appointment-row:not(.list-header):hover {
  background: #f0f8ff;
}

.appointment-row:last-child {
  border-bottom: 0;
}

.appointment-row > span:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #315e59;
  font-weight: 600;
}

.appointment-row small {
  color: #9aa9a7;
  font-family: Consolas, monospace;
  font-size: 9px;
}

.ranking-list {
  padding: 6px 15px 8px;
}

.ranking-row {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 4px;
  color: #7b8e8b;
  background: #edf2f1;
  font-size: 10px;
  font-weight: 700;
}

.rank.top {
  color: #fff;
  background: #2f80ed;
}

.ranking-info {
  min-width: 0;
  flex: 1;
}

.ranking-info > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}

.ranking-info strong {
  color: #405f5b;
  font-size: 11px;
}

.ranking-info span {
  color: #849592;
  font-size: 10px;
}

.alert-list {
  padding: 5px 14px 7px;
}

.alert-row {
  min-height: 52px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #f0f4f3;
}

/* 智能预警中心行 hover 高亮 */
.alert-row {
  transition: background-color 0.2s ease;
}

.alert-row:hover {
  background: #f6faff;
}

.alert-row:last-child {
  border-bottom: 0;
}

.alert-level {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.level-高 {
  color: #c53c3c;
  background: #ffeded;
}

.level-中 {
  color: #bc7413;
  background: #fff3df;
}

.level-低 {
  color: #2873bc;
  background: #eaf3ff;
}

.alert-row strong,
.alert-row p {
  display: block;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-row strong {
  color: #405f5b;
  font-size: 11px;
}

.alert-row p,
.alert-row time {
  color: #98a6a4;
  font-size: 9px;
}

.alert-row p {
  margin-top: 3px;
}

.alert-row time {
  white-space: nowrap;
}

@media (max-width: 1220px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    grid-auto-rows: 278px;
  }
}

@media (max-width: 760px) {
  .dashboard-heading {
    align-items: flex-start;
    flex-direction: column;
    padding-bottom: 8px;
  }

  .heading-actions {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
