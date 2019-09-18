<template>
  <div
    class="report-workpro"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>项目工单报表</el-breadcrumb-item>
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
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed prop="organize_name" label="机构名称" width="160"></el-table-column>
            <el-table-column prop="woSize" label="工单总数" width="110"></el-table-column>
            <el-table-column prop="insSize" label="巡检工单" width="110"></el-table-column>
            <el-table-column prop="repairSize" label="维修工单" width="110"></el-table-column>
            <el-table-column prop="continueSize" label="已结单" width="100"></el-table-column>
            <el-table-column prop="notContinueSize" label="未结单" width="100"></el-table-column>
            <el-table-column prop="outtimeSize" label="超时工单" width="110"></el-table-column>
            <el-table-column label="完成率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.continueRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="continueOntimeSize" label="完成及时数" width="118"></el-table-column>
            <el-table-column prop="ingOuttimeSize" label="处理超时数" width="120"></el-table-column>
            <el-table-column label="完成及时率" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.continueOntimeRate | formatPercent }}</span>
              </template>
            </el-table-column>
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
  name: 'reportWorkpro',
  data () {
    return {
      search: {
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        project: [],
        startDate: '',
        endDate: ''
      },
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
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
      // 获取列表数据
      this.getListData()
    }
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.reportArg.orgId,
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
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
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
        // 当前页码初始化
        this.nowPage = 1
        // 获取列表数据
        this.getListData()
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
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
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
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      if (!this.orgId) return
      let params = {
        organize_id: this.orgId,
        seltype: this.orgType,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selProWo',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          // 表格
          this.tableData = res.data.data1.message
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
        if (index === 8) {
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
        if (index === 11) {
          const values = data.map(item => Number(item.continueOntimeRate))
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
          const values = data.map(item => Number(item.avEvaluateSize))
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
            average = Math.round(average)
            sums[index] = average
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
      // 获取列表数据
      this.getListData()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 导出文件 */
    downFile () {
      let params = {
        organize_id: this.orgId,
        seltype: this.orgType,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selProWoEO?' + params
    }
  },
  filters: {
    filterTimelyRate (son, mother) {
      if (!son) { return '0%' }
      if (!mother) { return '0%' }
      let consult = Number.parseFloat(son) / Number.parseFloat(mother)
      return Math.round(consult * 100) + '%'
    }
  },
  watch: {
    orgId (val, oldVal) {
      if (val) {
        this.downDisabled = false
      } else {
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .report-workpro{
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
            display: table;
            width: 100%;
            height: 60px;
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
</style>
