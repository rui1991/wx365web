<template>
  <div class="crewclock">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>人员位置管理</el-breadcrumb-item>
          <el-breadcrumb-item>人员打卡报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>开始时间</span>
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
              <span>结束时间</span>
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
          <div class="search-input">
            <div class="item">
              <span>员工姓名</span>
              <el-input style="width: 160px;" v-model="nowSearch.name"></el-input>
            </div>
            <div class="operate"></div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" label="姓名"></el-table-column>
          <el-table-column width="200" :show-overflow-tooltip="true" prop="positions" label="点名地址"></el-table-column>
          <el-table-column width="180" :show-overflow-tooltip="true" label="胸牌编号">
            <template slot-scope="scope">
              <span v-if="scope.row.card_mac">{{ scope.row.card_mac }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="po_size" label="负责点位数"></el-table-column>
          <el-table-column label="打卡点位数">
            <template slot-scope="scope">
              <span class="red" v-if="scope.row.position_size < scope.row.po_size">{{ scope.row.position_size }}</span>
              <span v-else>{{ scope.row.position_size }}</span>
            </template>
          </el-table-column>
          <el-table-column label="未打卡点位数">
            <template slot-scope="scope">
              <a href="javascript:;" class="red" v-if="scope.row.notRecordSize > 0" @click="detClick(scope.row.user_id, scope.row.positions)">{{ scope.row.notRecordSize  }}</a>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column label="打卡率">
            <template slot-scope="scope">
              <!--<span>{{ scope.row.po_size | countRate(scope.row.position_size) }}</span>-->
              <span>{{ scope.row.recordRate | formatPercent }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
          <el-table-column label="点位平均停留时长（分）">
            <template slot-scope="scope">
              <span>{{ scope.row.avwaittime | formatNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="点位之间间隔时长（分）">
            <template slot-scope="scope">
              <span>{{ scope.row.avrecord | formatNum }}</span>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentUid="detUid"
      :parentState="detState"
      :parentStart="search.startDate"
      :parentEnd="search.endDate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/perloc/crewclock-det'
export default{
  name: 'crewclock',
  data () {
    return {
      search: {
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate(),
        name: '',
        state: ''
      },
      nowSearch: {
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate(),
        name: '',
        state: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detUid: 0,
      detState: 1,
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取列表
    this.getListData()
  },
  components: {
    detModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  filters: {
    countRate (want, already) {
      if (!want) return '0%'
      if (!already) return '0%'
      let rate = already / want
      return Math.round(rate * 100) + '%'
    }
  },
  methods: {
    // 搜索
    searchList () {
      const startDate = this.nowSearch.startDate
      const endDate = this.nowSearch.endDate
      const fate = this.getDateDiff(startDate, endDate)
      if (fate) {
        this.$message({
          showClose: true,
          message: '查询时长不能超过31天',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReport',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.reports
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            this.getListData()
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
    // 合计表格规则设置
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1 || index === 2 || index === 3) {
          sums[index] = '-'
          return
        }
        if (index === 5) {
          const values = data.map(item => Number(item.position_size))
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
        if (index === 6) {
          const values = data.map(item => Number(item.notRecordSize))
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
        if (index === 7) {
          const values = data.map(item => Number(item.recordRate))
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
          const values = data.map(item => Number(item.avwaittime))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 10) {
          const values = data.map(item => Number(item.avrecord))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
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
    // 获取跨越天数
    getDateDiff (startDate, endDate) {
      let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime()
      let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime()
      const seaDuration = endTime - startTime
      const maxDuration = 1000 * 60 * 60 * 24 * 31
      if (seaDuration > maxDuration) {
        return true
      } else {
        return false
      }
    },
    /* 详情 */
    detClick (uid, positions) {
      this.detUid = uid
      let detState = 1
      if (positions === '全部') {
        detState = 0
      }
      this.detState = detState
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downFile () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v2.0/selRollCallReportEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.crewclock{
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
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
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
</style>
