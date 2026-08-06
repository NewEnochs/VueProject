import dayjs from 'dayjs'

export const studentColumns = [
  { title: '姓名', dataIndex: 'xm', ellipsis: true, align: 'center', width: 90 },
  { title: '性别', dataIndex: 'xb', ellipsis: true, align: 'center', width: 80 },
  { title: '年龄/岁', dataIndex: 'age', ellipsis: true, align: 'center', width: 80 },
  { title: '身份证号', dataIndex: 'sfzh', ellipsis: true, align: 'center', width: 160 },
  { title: '联系电话', dataIndex: 'brdh', ellipsis: true, align: 'center', width: 120 },
  { title: '现住址', dataIndex: 'xzzqm', ellipsis: true, align: 'center', width: 300 },
  { title: '档案管理情况', dataIndex: 'glzt', ellipsis: true, align: 'center', width: 120 },
  { title: '重点人群', dataIndex: 'zdrqmcs', ellipsis: true, align: 'center', width: 180 },
  { title: '管理级别', dataIndex: 'gljb', ellipsis: true, align: 'center', width: 150 },
  { title: '责任医生', dataIndex: 'zrysmc', ellipsis: true, align: 'center', width: 100 },
  { title: '签约信息', dataIndex: 'qyztmc', ellipsis: true, align: 'center', width: 100 },
  { title: '家庭医生', dataIndex: 'jtysmc', ellipsis: true, align: 'center', width: 100 },
  { title: '小程序绑定信息', dataIndex: 'xcxbdztmc', ellipsis: true, align: 'center', width: 120 },
  { title: '最后更新时间', dataIndex: 'gxsj', ellipsis: true, align: 'center', width: 120 },
  { title: '建档人', dataIndex: 'jdrmc', ellipsis: true, align: 'center', width: 90 },
  { title: '建档机构', dataIndex: 'jdjgmc', ellipsis: true, align: 'center', width: 200 },
  { title: '备注', dataIndex: 'zbglyy', ellipsis: true, align: 'center', width: 200 },
  { title: '操作', dataIndex: 'action', fixed: 'right', align: 'center', width: 120 },
]

export function createDefaultQuery() {
  return {
    leftFilterType: 3,
    ZT: 1,
    glzt: -1,
    searchValue: '',
    gljb: '',
    PageNo: 1,
    pageSize: 20,
    nextPage: true,
    prevPage: false,
    pageNo: 1,
  }
}

export function extractStudentPageData(response) {
  const root = response && typeof response === 'object' ? response : {}
  const firstLayer = Object.prototype.hasOwnProperty.call(root, 'data') ? root.data : root
  const secondLayer =
    firstLayer && typeof firstLayer === 'object' && Object.prototype.hasOwnProperty.call(firstLayer, 'data')
      ? firstLayer.data
      : firstLayer

  return secondLayer && typeof secondLayer === 'object' ? secondLayer : {}
}

export function getGenderText(value) {
  if (value === 1) {
    return '男'
  }
  if (value === 2) {
    return '女'
  }
  return ''
}

export function getStatusText(value) {
  const map = {
    1: '启用',
    2: '停用',
  }

  return value ? map[value] || String(value) : ''
}

export function getTagItems(value) {
  if (!value) {
    return []
  }

  return String(value)
    .split(/[，,、;；\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD') : ''
}
