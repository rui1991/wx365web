<template>
  <div
    class="report-task"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检任务执行报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            style="padding: 5px"
            :data="orgTree"
            ref="orgTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            @check-change="orgCheckChange"
            @node-click="orgNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>开始日期</span>
                <el-date-picker
                  style="width: 160px;"
                  v-model="nowSearch.startDate"
                  type="date"
                  :clearable="false"
                  value-format="yyyy-MM-dd"
                  placeholder="选择日期">
                </el-date-picker>
              </div>
              <div class="item">
                <span>结束日期</span>
                <el-date-picker
                  style="width: 160px;"
                  v-model="nowSearch.endDate"
                  type="date"
                  :clearable="false"
                  value-format="yyyy-MM-dd"
                  placeholder="选择日期">
                </el-date-picker>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>任务名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed :prop="tablePropName" :label="tableLabelName" :show-overflow-tooltip="true" width="150"></el-table-column>
            <el-table-column prop="positionSize" label="地址数" width="120"></el-table-column>
            <el-table-column :prop="tablePropRel" label="关联任务数" width="120"></el-table-column>
            <el-table-column prop="continueSize" label="完成次数" width="120"></el-table-column>
            <el-table-column prop="notContinueSize" label="未完成次数" width="120"></el-table-column>
            <el-table-column label="完成率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.continueRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ontimeSize" label="完成及时数" width="120"></el-table-column>
            <el-table-column prop="outtimeSize" label="完成超时数" width="120"></el-table-column>
            <el-table-column label="完成及时率" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.ontimeRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="approvalSize" label="审批数" width="100"></el-table-column>
            <el-table-column prop="approvalPassSize" label="审批通过数" width="120"></el-table-column>
            <el-table-column label="审批通过率" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.passRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="putwoSize" label="提单数" width="100"></el-table-column>
          </el-table>
          <el-pagination
            background
            prev-text="上一页"
            next-text="下一页"
            :current-page="nowPage"
            layout="sizes, prev, pager, next, total"
            :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
            :page-size="limit"
            @size-change="handleSizeChange"
            @current-change="pageChang"
            :total="total">
          </el-pagination>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'reportTask',
  data () {
    return {
      search: {
        startDate: '',
        endDate: '',
        name: ''
      },
      nowSearch: {
        startDate: '',
        endDate: '',
        name: ''
      },
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableAllData: [],
      tableData: [],
      // tableAllData: [],
      // tableDetData: [],
      tableLabelName: '机构名称',
      tablePropName: 'organize_name',
      tablePropRel: 'insSize',
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: true,
      loading: false
    }
  },
  created () {
    // 开始时间
    let startDate = ''
    this.startDate ? startDate = this.startDate : startDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.startDate = startDate
    this.nowSearch.startDate = startDate
    // 结束时间
    let endDate = ''
    this.endDate ? endDate = this.endDate : endDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.endDate = endDate
    this.nowSearch.endDate = endDate
  },
  mounted () {
    // 获取机构树
    this.getOrganTree()
    if (this.orgId) {
      this.downDisabled = false
      if (this.orgType === 3) {
        this.tableLabelName = '任务名称'
        this.tablePropName = 'plan_name'
        this.tablePropRel = 'dutySize'
        // 获取列表详情数据
        this.getListDetData()
      } else {
        this.tableLabelName = '机构名称'
        this.tablePropName = 'organize_name'
        this.tablePropRel = 'insSize'
        // 获取列表汇总数据
        this.getListAllData()
      }
    }
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.reportArg.orgId,
        proId: state => state.reportArg.proId,
        orgType: state => state.reportArg.orgType,
        startDate: state => state.reportArg.startDate,
        endDate: state => state.reportArg.endDate
      }
    )
  },
  methods: {
    // 获取机构树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let orgData = res.data.data1
          // 处理部门树
          orgData = this.initDisSecTree(orgData)
          this.orgTree = orgData
          if (this.orgId) {
            this.$refs.orgTree.setCheckedKeys([this.orgId])
          }
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 初始化处理部门
    initDisSecTree (treeData) {
      treeData.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
      return treeData
    },
    initRecSecTree (data) {
      data.forEach((item, index, array) => {
        if (item.children) {
          this.initRecSecTree(item.children)
        } else if (item.organize_type === 4) {
          item.disabled = true
        }
      })
    },
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) return
        const type = data.organize_type
        let args = {}
        if (type === 3) {
          args = {
            id: data.id,
            type: type,
            proId: data.base_id
          }
        } else {
          args = {
            id: data.id,
            type: type,
            proId: ''
          }
        }
        this.$refs.orgTree.setCheckedKeys([data.id])
        // 机构ID
        this.$store.commit('setReportOrg', args)
        // 清空搜索框
        this.search.name = ''
        this.nowSearch.name = ''
        // 当前页码初始化
        this.nowPage = 1
        if (type === 3) {
          // 获取列表详情数据
          this.getListDetData()
        } else {
          // 获取列表汇总数据
          this.getListAllData()
        }
      } else {
        if (this.orgId === data.id) {
          this.$refs.orgTree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (data.disabled) return
      if (node.checked) return
      const type = data.organize_type
      let args = {}
      if (type === 3) {
        args = {
          id: data.id,
          type: type,
          proId: data.base_id
        }
      } else {
        args = {
          id: data.id,
          type: type,
          proId: ''
        }
      }
      this.$refs.orgTree.setCheckedKeys([data.id])
      // 机构ID
      this.$store.commit('setReportOrg', args)
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      if (type === 3) {
        // 获取列表详情数据
        this.getListDetData()
      } else {
        // 获取列表汇总数据
        this.getListAllData()
      }
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 判断是否选择组织
      if (!this.orgId) return
      // 报表日期
      const args = {
        startDate: this.search.startDate,
        endDate: this.search.endDate
      }
      this.$store.commit('setReportDate', args)
      // 当前页码初始化
      this.nowPage = 1
      if (this.orgType === 3) {
        // 获取列表详情数据
        this.getListDetData()
      } else {
        // 获取列表汇总数据
        this.getListAllData()
      }
    },
    // 获取列表数据
    getListAllData () {
      if (!this.orgId) return
      let params = {
        organize_id: this.orgId,
        seltype: this.orgType,
        plan_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selInspectTask',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          // this.total = res.data.data1.total
          const tableAllData = res.data.data1.message
          this.total = tableAllData.length
          this.tableAllData = tableAllData
          const tableData = tableAllData.slice(0, this.limit)
          this.tableData = tableData
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getListDetData () {
      if (!this.orgId) return
      let params = {
        project_id: this.proId,
        plan_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selInspectTaskPro',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insTasks
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 合计表格规则设置
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1) {
          sums[index] = '-'
          return
        }
        if (index === 6) {
          const values = data.map(item => Number(item.continueRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 9) {
          const values = data.map(item => Number(item.ontimeRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 12) {
          const values = data.map(item => Number(item.passRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        const vals = data.map(item => Number(item[column.property]))
        if (!vals.every(value => isNaN(value))) {
          sums[index] = vals.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          })
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      if (this.orgType === 3) {
        // 获取列表详情数据
        this.getListDetData()
      } else {
        // 获取列表
        const start = this.nowPage * limit - limit
        const end = this.nowPage * limit
        const tableData = this.tableAllData.slice(start, end)
        this.tableData = tableData
      }
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      if (this.orgType === 3) {
        // 获取列表详情数据
        this.getListDetData()
      } else {
        // 获取列表
        const start = page * this.limit - this.limit
        const end = page * this.limit
        const tableData = this.tableAllData.slice(start, end)
        this.tableData = tableData
      }
    },
    /* 导出文件 */
    downFile () {
      if (this.orgType === 3) {
        this.downDetFile()
      } else {
        this.downAllFile()
      }
    },
    downAllFile () {
      let params = {
        organize_id: this.orgId,
        seltype: this.orgType,
        plan_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectTaskEO?' + params
    },
    downDetFile () {
      let params = {
        project_id: this.proId,
        plan_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectTaskProEO?' + params
    }
  },
  watch: {
    orgId (val, oldVal) {
      if (val) {
        this.downDisabled = false
      } else {
        this.downDisabled = true
      }
    },
    orgType (val, oldVal) {
      if (val === 3) {
        this.tableLabelName = '任务名称'
        this.tablePropName = 'plan_name'
        this.tablePropRel = 'dutySize'
      } else {
        this.tableLabelName = '机构名称'
        this.tablePropName = 'organize_name'
        this.tablePropRel = 'insSize'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .report-task{
    height: 100%;
    .module-container{
      height: 100%;
      padding: 0;
      .module-header{
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 20px;
        .el-breadcrumb{
          padding-top: 15px;
          padding-left: 20px;
          padding-bottom: 15px;
          background: #ffffff;
        }
      }
      .module-content{
        height: 100%;
        padding-top: 10px;
        padding-right: 0;
        padding-bottom: 10px;
        padding-left: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          padding: 5px;
          border-radius: 6px;
          border: 1px solid #cccccc;
        }
        .module-main{
          padding-top: 0;
          padding-right: 10px;
          padding-bottom: 0;
          padding-left: 20px;
          overflow: scroll;
          .search{
            padding-top: 5px;
            padding-bottom: 5px;
            .search-input{
              display: table;
              width: 100%;
              .item{
                display: table-cell;
                vertical-align: middle;
                width: 280px;
                font-size: 0;
                span{
                  width: 70px;
                  display: inline-block;
                  line-height: 34px;
                  font-size: 14px;
                }
              }
              .operate{
                display: table-cell;
                vertical-align: middle;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }
</style>
