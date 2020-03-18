<template>
  <div
    class="report-worksta"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>员工工单报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <org-module></org-module>
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
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>员工姓名</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed prop="project_name" label="机构名称" width="150"></el-table-column>
            <el-table-column prop="user_name" label="员工名称" width="120"></el-table-column>
            <el-table-column prop="woSize" label="接单次数" width="120"></el-table-column>
            <el-table-column prop="continueSize" label="已结单" width="100"></el-table-column>
            <el-table-column prop="notContinueSize" label="未结单" width="100"></el-table-column>
            <el-table-column prop="outtimeSize" label="处理超时单" width="100"></el-table-column>
            <el-table-column prop="backSize" label="退单次数" width="100"></el-table-column>
            <el-table-column label="结单率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.continueRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="超时率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.outtimeRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="退单率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.backRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均响应时长" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.avgResponseTime | formatInteger }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均处理时长" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.avgProcessingTime | formatInteger }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总工时" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.sumWorkingHours | formatInteger }}</span>
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
import { mapState, mapActions } from 'vuex'
// 引入组织树组件
import orgModule from '@/components/report/report-org2'
export default{
  name: 'reportWorksta',
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
      tableData: [],
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
    if (this.date.length === 0) {
      this.search.date = [nowDate, nowDate]
      this.nowSearch.date = [nowDate, nowDate]
      this.setReportDate([nowDate, nowDate])
    } else {
      this.search.date = this.date
      this.nowSearch.date = this.date
    }
    if (this.organizeId) {
      this.downDisabled = false
      // 获取列表数据
      this.getListData()
    }
  },
  components: {
    orgModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('report', [
      'organizeId',
      'date'
    ])
  },
  methods: {
    ...mapActions('report', [
      'setReportDate'
    ]),
    // 更新列表
    updateList () {
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 判断是否选择组织
      if (!this.organizeId) return
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
      // 设置报表时间
      const date = this.search.date
      this.setReportDate(date)
    },
    // 获取列表数据
    getListData () {
      if (!this.organizeId) return
      const date = this.search.date
      let params = {
        organize_id: this.organizeId,
        project_name: '',
        user_name: this.search.name,
        start_date: date[0],
        end_date: date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selUserWorkorderReport',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
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
        if (index === 1 || index === 2) {
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
        if (index === 9) {
          const values = data.map(item => Number(item.outtimeRate))
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
        if (index === 10) {
          const values = data.map(item => Number(item.backRate))
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
          const values = data.map(item => Number(item.avgResponseTime))
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
        if (index === 12) {
          const values = data.map(item => Number(item.avgProcessingTime))
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
        if (index === 13) {
          const values = data.map(item => Number(item.sumWorkingHours))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
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
      const date = this.search.date
      let params = {
        organize_id: this.organizeId,
        project_name: '',
        user_name: this.search.name,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selUserWorkorderReportEO?' + params
    }
  },
  watch: {
    organizeId (val, oldVal) {
      if (val) {
        // 更新列表
        this.updateList()
        this.downDisabled = false
      } else {
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .report-worksta{
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
