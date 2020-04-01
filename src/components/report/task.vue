<template>
  <div
    class="report-task"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检任务执行报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <org-module
            @parentUpOrg="updateOrgan">
          </org-module>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item date">
                <span>选择时段</span>
                <el-date-picker
                  style="width: 280px;"
                  v-model="nowSearch.date"
                  type="daterange"
                  value-format="yyyy-MM-dd"
                  :clearable="false"
                  :picker-options="pickerOptions"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item" v-show="nameSearch">
                <span>任务名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="operate"></div>
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
// 引入组织树组件
import orgModule from '@/components/report/report-org'
export default{
  name: 'reportTask',
  data () {
    return {
      search: {
        date: [],
        name: ''
      },
      nowSearch: {
        date: [],
        name: ''
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      nameSearch: false,
      organizeId: 0,
      organizeType: 0,
      projectId: 0,
      sectionId: 0,
      nowProid: 0,
      tableAllData: [],
      tableData: [],
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

  },
  mounted () {
    // 时段
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
  },
  components: {
    orgModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'allProject'
    ])
  },
  methods: {
    // 更新组织
    updateOrgan (data) {
      // 可导出
      this.downDisabled = false
      // 保存参数
      this.organizeId = data.id
      this.organizeType = data.type
      this.projectId = data.proId
      this.sectionId = data.secId
      if (data.type === 4) {
        const allProject = this.allProject
        const nowProject = allProject.find(item => {
          return item.organize_id === data.parId
        })
        if (!nowProject) {
          return
        }
        const nowProid = nowProject.project_id
        this.nowProid = nowProid
      }
      this.updateList()
    },
    // 更新列表
    updateList () {
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      if (this.organizeType === 3) {
        // 获取项目数据
        this.getProjectData()
      } else if (this.organizeType === 4) {
        // 获取部门数据
        this.getSectionData()
      } else {
        // 获取列表汇总数据
        this.getOtherData()
      }
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 判断是否选择组织
      if (!this.organizeId) return
      // 当前页码初始化
      this.nowPage = 1
      if (this.organizeType === 3) {
        // 获取列表详情数据
        this.getProjectData()
      } else if (this.organizeType === 4) {
        // 获取部门数据
        this.getSectionData()
      } else {
        // 获取列表汇总数据
        this.getOtherData()
      }
    },
    // 获取列表数据
    // 其它
    getOtherData () {
      if (!this.organizeId) return
      let date = this.search.date
      let params = {
        organize_id: this.organizeId,
        seltype: this.organizeType,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1],
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
    // 项目
    getProjectData () {
      if (!this.organizeId) return
      let date = this.search.date
      let params = {
        project_id: this.projectId,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1],
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
    // 部门
    getSectionData () {
      let date = this.search.date
      let params = {
        project_id: this.nowProid,
        ogz_id: this.sectionId,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1],
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
      if (this.organizeType === 3) {
        // 获取项目数据
        this.getProjectData()
      } else if (this.organizeType === 4) {
        // 获取部门数据
        this.getSectionData()
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
      if (this.organizeType === 3) {
        // 获取项目数据
        this.getProjectData()
      } else if (this.organizeType === 4) {
        // 获取部门数据
        this.getSectionData()
      } else {
        // 获取其它数据
        const start = page * this.limit - this.limit
        const end = page * this.limit
        const tableData = this.tableAllData.slice(start, end)
        this.tableData = tableData
      }
    },
    /* 导出文件 */
    downFile () {
      if (this.organizeType === 3) {
        // 项目
        this.downProjectFile()
      } else if (this.organizeType === 4) {
        // 部门
        this.downSectionFile()
      } else {
        // 其它
        this.downOtherFile()
      }
    },
    // 其它
    downOtherFile () {
      let date = this.search.date
      let params = {
        organize_id: this.organizeId,
        seltype: this.organizeType,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectTaskEO?' + params
    },
    // 项目
    downProjectFile () {
      let date = this.search.date
      let params = {
        project_id: this.projectId,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectTaskProEO?' + params
    },
    // 部门
    downSectionFile () {
      let date = this.search.date
      let params = {
        project_id: this.nowProid,
        ogz_id: this.sectionId,
        plan_name: this.search.name,
        start_date: date[0],
        end_date: date[1]
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
    organizeType (val, oldVal) {
      if (val === 3) {
        this.nameSearch = true
        this.tableLabelName = '任务名称'
        this.tablePropName = 'plan_name'
        this.tablePropRel = 'dutySize'
      } else if (val === 4) {
        this.nameSearch = true
        this.tableLabelName = '任务名称'
        this.tablePropName = 'plan_name'
        this.tablePropRel = 'dutySize'
      } else {
        this.nameSearch = false
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
              .date{
                width: 420px;
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
