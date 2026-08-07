<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  id: number
  name: string
  path: string
  icon: string
  sort: number
  status: '启用' | '禁用'
  createTime: string
}

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '菜单名称', dataIndex: 'name', width: 160 },
  { title: '路由路径', dataIndex: 'path', width: 200 },
  { title: '图标', dataIndex: 'icon', width: 120 },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
]

const dataSource = ref<MenuItem[]>([
  {
    id: 1,
    name: '工作台',
    path: '/home',
    icon: 'DesktopOutlined',
    sort: 1,
    status: '启用',
    createTime: '2026-01-05 09:12:30',
  },
  {
    id: 2,
    name: '菜单管理',
    path: '/menu',
    icon: 'MenuOutlined',
    sort: 2,
    status: '启用',
    createTime: '2026-01-06 14:20:00',
  },
  {
    id: 3,
    name: '用户管理',
    path: '/system/user',
    icon: 'UserOutlined',
    sort: 3,
    status: '启用',
    createTime: '2026-01-07 10:05:45',
  },
  {
    id: 4,
    name: '角色管理',
    path: '/system/role',
    icon: 'TeamOutlined',
    sort: 4,
    status: '启用',
    createTime: '2026-01-08 16:30:12',
  },
  {
    id: 5,
    name: '权限设置',
    path: '/system/permission',
    icon: 'SafetyOutlined',
    sort: 5,
    status: '禁用',
    createTime: '2026-01-09 11:45:00',
  },
  {
    id: 6,
    name: '日志管理',
    path: '/monitor/log',
    icon: 'FileTextOutlined',
    sort: 6,
    status: '启用',
    createTime: '2026-01-10 08:22:18',
  },
  {
    id: 7,
    name: '系统配置',
    path: '/system/config',
    icon: 'SettingOutlined',
    sort: 7,
    status: '启用',
    createTime: '2026-01-11 17:10:33',
  },
])
</script>

<template>
  <section class="menu-page">
    <header class="page-header">
      <h2>菜单管理</h2>
      <p>维护系统菜单及路由配置</p>
    </header>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="{ pageSize: 10 }"
      row-key="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === '启用' ? 'green' : 'red'">
            {{ record.status }}
          </a-tag>
        </template>
      </template>
    </a-table>
  </section>
</template>

<style scoped>
.menu-page {
  display: grid;
  gap: 16px;
}

.page-header h2,
.page-header p {
  margin: 0;
}

.page-header h2 {
  font-size: 20px;
}

.page-header p {
  margin-top: 6px;
  color: #6f8482;
  font-size: 14px;
}
</style>
