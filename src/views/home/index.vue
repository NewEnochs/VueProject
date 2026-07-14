<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'

interface Person {
  ID: number
  XM: string
  XB: string
  SFZH: string
  ADDRESS: string
  AGE: number
}

// 假数据
const dataSource = ref<Person[]>([
  { ID: 1, XM: '张三', XB: '男', SFZH: '110101199001011234', ADDRESS: '北京市东城区', AGE: 35 },
  { ID: 2, XM: '李四', XB: '女', SFZH: '310101199202022345', ADDRESS: '上海市黄浦区', AGE: 33 },
  { ID: 3, XM: '王五', XB: '男', SFZH: '440101198803033456', ADDRESS: '广州市越秀区', AGE: 37 },
  { ID: 4, XM: '赵六', XB: '男', SFZH: '510101199504044567', ADDRESS: '成都市锦江区', AGE: 30 },
  { ID: 5, XM: '钱七', XB: '女', SFZH: '320101199705055678', ADDRESS: '南京市玄武区', AGE: 28 },
  { ID: 6, XM: '孙八', XB: '男', SFZH: '420101198906066789', ADDRESS: '武汉市江岸区', AGE: 36 },
  { ID: 7, XM: '周九', XB: '女', SFZH: '330101199607077890', ADDRESS: '杭州市拱墅区', AGE: 29 },
  { ID: 8, XM: '吴十', XB: '男', SFZH: '610101199308088901', ADDRESS: '西安市碑林区', AGE: 32 },
])

// 查询条件
const searchForm = ref({
  XM: '',
  SFZH: '',
})

// 过滤后的数据
const filteredData = computed<Person[]>(() => {
  return dataSource.value.filter((item) => {
    const matchXM = searchForm.value.XM ? item.XM.includes(searchForm.value.XM.trim()) : true
    const matchSFZH = searchForm.value.SFZH
      ? item.SFZH.includes(searchForm.value.SFZH.trim())
      : true
    return matchXM && matchSFZH
  })
})

// 表格列配置
const columns = [
  { title: 'ID', dataIndex: 'ID', key: 'ID', width: 80 },
  { title: '姓名', dataIndex: 'XM', key: 'XM', width: 120 },
  { title: '性别', dataIndex: 'XB', key: 'XB', width: 100 },
  { title: '身份证号', dataIndex: 'SFZH', key: 'SFZH', width: 200 },
  { title: '地址', dataIndex: 'ADDRESS', key: 'ADDRESS', width: 200 },
  { title: '年龄', dataIndex: 'AGE', key: 'AGE', width: 80 },
]

// 查询方法
const handleSearch = () => {
  // filteredData 为 computed，会自动响应 searchForm 变化
}

// 重置方法
const handleReset = () => {
  searchForm.value.XM = ''
  searchForm.value.SFZH = ''
}
</script>

<template>
  <div class="home-container">
    <!-- 查询条件 -->
    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" @keyup.enter="handleSearch">
        <a-form-item label="姓名">
          <a-input
            v-model:value="searchForm.XM"
            placeholder="请输入姓名"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="身份证号">
          <a-input
            v-model:value="searchForm.SFZH"
            placeholder="请输入身份证号"
            allow-clear
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number, range: number[]) =>
            `共 ${total} 条记录，第 ${Math.ceil(total / 10)} 页`,
        }"
        row-key="ID"
        bordered
      />
    </a-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 16px;
}

.search-card {
  margin-bottom: 0;
}
</style>
