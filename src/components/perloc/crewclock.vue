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
        <el-table class="list-table" :data="tableData" border style="width: 100%">
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
              <a href="javascript:void(0);" class="red" v-if="scope.row.position_size < scope.row.po_size" @click="detClick(scope.row.user_id, scope.row.positions)">{{ scope.row.po_size - scope.row.position_size }}</a>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column label="打卡率">
            <template slot-scope="scope">
              <span>{{ scope.row.po_size | countRate(scope.row.position_size) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
          <el-table-column label="点位平均停留时长（分）">
            <template slot-scope="scope">
              <span v-if="scope.row.avwaittime">{{ scope.row.avwaittime | formatNum }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="点位之间间隔时长（分）">
            <template slot-scope="scope">
              <span v-if="scope.row.avrecord">{{ scope.row.avrecord | formatNum }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page="nowPage"
          layout="prev, pager, next, total"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
    <!-- 详情 -->
    <el-dialog title="点名详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="detTable" style="width: 100%" max-height="420">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="atdate" label="日期"></el-table-column>
        <el-table-column prop="position_name" :show-overflow-tooltip="true" label="地址名称"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
      detTable: [],
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取列表
    this.getListData()
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
    /* 未打卡详情 */
    detClick (uid, positions) {
      this.detDialog = true
      let state = 1
      if (positions === '全部') {
        state = 0
      }
      let params = {
        project_id: this.nowProid,
        user_id: uid,
        pos: state,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReportNotPosition',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detTable = res.data.data1.message
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
