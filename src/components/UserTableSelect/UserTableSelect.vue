<template>
  <a-select
    v-model="selectedValue"
    :options="displayOptions"
    show-search
    :placeholder="placeholder"
    :disabled="disabled"
    :filterOption="false"
    :loading="loading"
    allowClear
    @popupScroll="handlePopupScroll"
    @search="handleSearch"
    @change="handleChange"
  >
    <a-select-option v-if="loading" value="loading" disabled>
      <a-spin size="small" /> 加载中...
    </a-select-option>
  </a-select>
</template>

<script>
export default {
  name: 'ResponsibleDoctorSelect',
  props: {
    // v-model 绑定的值
    value: {
      type: [String, Number],
      default: null,
    },
    // 机构ID
    orgId: {
      type: [String, Number],
      required: true,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 占位文本
    placeholder: {
      type: String,
      default: '请选择接收机构责任医生',
    },
    // 每页加载数量
    pageSize: {
      type: Number,
      default: 100,
    },
    // 获取用户列表的API方法
    fetchUserApi: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      // 所有用户数据（缓存）
      allUserData: [],
      // 当前显示的数据
      displayOptions: [],
      // 当前页码
      currentPage: 1,
      // 搜索关键字
      searchVal: '',
      // 加载状态
      loading: false,
      // 是否已初始化
      initialized: false,
      // 选中的值
      selectedValue: null,
      // 当前选中的用户对象（用于回显）
      selectedUser: null,
    }
  },
  watch: {
    // 监听机构ID变化，重新加载数据
    orgId: {
      handler(newVal) {
        if (newVal) {
          this.initData()
        }
      },
      immediate: true,
    },
    // 监听value变化，同步到selectedValue
    value: {
      handler(newVal) {
        this.selectedValue = newVal
        // 如果值发生变化，确保该用户显示在列表中
        if (newVal && this.initialized) {
          this.ensureSelectedUserInList(newVal)
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.selectedValue = this.value
  },
  methods: {
    /**
     * 初始化数据
     */
    async initData() {
      if (!this.orgId) return

      this.loading = true
      try {
        const res = await this.fetchUserApi({ OrgId: this.orgId })
        if (res.success) {
          this.allUserData = res.data || []

          // 重置页码
          this.currentPage = 1
          // 加载第一页数据
          this.loadPageData()
          this.initialized = true

          // 如果有选中的值，确保显示在列表中
          if (this.selectedValue) {
            this.$nextTick(() => {
              this.ensureSelectedUserInList(this.selectedValue)
            })
          }
        }
      } catch (error) {
        console.error('加载责任医生列表失败:', error)
        this.$message?.error('加载责任医生列表失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 确保选中的用户在列表中显示
     * @param {String|Number} userId 用户ID
     */
    ensureSelectedUserInList(userId) {
      if (!userId) return

      // 从所有数据中查找选中的用户
      const selectedUser = this.allUserData.find((item) => String(item.value) === String(userId))

      if (!selectedUser) return

      // 检查是否已经在显示列表中
      const existsInDisplay = this.displayOptions.some(
        (item) => String(item.value) === String(userId),
      )

      // 如果不在显示列表中，添加到列表开头
      if (!existsInDisplay) {
        this.displayOptions = [selectedUser, ...this.displayOptions]
      }

      // 保存选中的用户对象
      this.selectedUser = selectedUser
    },

    /**
     * 加载分页数据
     */
    loadPageData() {
      const start = 0
      const end = this.currentPage * this.pageSize

      // 根据搜索关键字过滤
      let filteredData = this.allUserData
      if (this.searchVal) {
        filteredData = this.allUserData.filter((s) => s.label && s.label.includes(this.searchVal))
      }

      // 获取当前页数据
      const pageData = filteredData.slice(start, end)

      // 如果有选中的值，确保在列表中
      if (this.selectedValue) {
        const selectedUser = this.allUserData.find(
          (item) => String(item.value) === String(this.selectedValue),
        )

        if (selectedUser) {
          // 合并选中的用户和分页数据，去重，选中的用户放在最前面
          const displayMap = new Map()
          // 先添加选中的用户
          displayMap.set(selectedUser.value, selectedUser)
          // 再添加分页数据
          pageData.forEach((user) => {
            if (!displayMap.has(user.value)) {
              displayMap.set(user.value, user)
            }
          })
          this.displayOptions = Array.from(displayMap.values())
          return
        }
      }

      this.displayOptions = pageData
    },

    /**
     * 下拉滚动事件 - 分页加载
     */
    handlePopupScroll(e) {
      const { target } = e
      const scrollHeight = target.scrollHeight - target.scrollTop
      const clientHeight = target.clientHeight

      // 下拉框不下拉的时候重置页码
      if (scrollHeight === 0 && clientHeight === 0) {
        this.currentPage = 1
        return
      }

      // 滚动到底部时加载更多
      if (scrollHeight < clientHeight + 5) {
        // 检查是否还有更多数据
        let filteredData = this.allUserData
        if (this.searchVal) {
          filteredData = this.allUserData.filter((s) => s.label && s.label.includes(this.searchVal))
        }

        // 如果当前显示的数据已经达到总数，不再加载
        if (this.displayOptions.length >= filteredData.length) {
          return
        }

        // 加载下一页
        this.currentPage = this.currentPage + 1
        this.loadPageData()
      }
    },

    /**
     * 搜索事件
     */
    handleSearch(val) {
      this.searchVal = val
      this.currentPage = 1
      this.loadPageData()
    },

    /**
     * 选择变更事件
     */
    handleChange(val) {
      this.selectedValue = val
      this.$emit('input', val)
      this.$emit('change', val)

      // 选择后确保该用户在列表中
      if (val) {
        this.ensureSelectedUserInList(val)
      }
    },

    /**
     * 刷新数据（外部调用）
     */
    refresh() {
      this.initData()
    },

    /**
     * 重置搜索
     */
    resetSearch() {
      this.searchVal = ''
      this.currentPage = 1
      this.loadPageData()
    },
  },
}
</script>
