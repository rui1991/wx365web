<template>
  <div class="fixedpost">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>固定岗管理</el-breadcrumb-item>
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
              <el-button type="primary" v-if="setAut" @click="setClick">设置</el-button>
            </div>
          </div>
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>岗位名称</span>
              <el-select v-model="nowSearch.station" clearable filterable style="width: 160px;" placeholder="请选择岗位名称">
                <el-option v-for="item in stationOptions" :key="item.position_id" :label="item.position_name" :value="item.position_id"></el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="position_name" label="岗位名称"></el-table-column>
          <el-table-column prop="record_size" label="打卡数"></el-table-column>
          <el-table-column label="打卡成功数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="getSucessDet(scope.row)">{{ scope.row.sucess_size }}</a>
            </template>
          </el-table-column>
          <el-table-column label="未打卡数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details red" @click="getFailedDet(scope.row)">{{ scope.row.failed_size }}</a>
            </template>
          </el-table-column>
          <el-table-column label="打卡异常数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details red" @click="getAbnormalDet(scope.row)">{{ scope.row.ab_size }}</a>
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
    <!-- 打卡详情 -->
    <el-dialog title="打卡详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="detData" style="width: 100%" max-height="450">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="times" label="时间"></el-table-column>
        <el-table-column label="打卡结果">
          <template slot-scope="scope">
            <span v-if="detType === 0">{{ scope.row.sucess_record }}</span>
            <span v-else-if="detType === 1">{{ scope.row.failed_record }}</span>
            <span v-else-if="detType === 2">{{ scope.row.abnormal_record }}</span>
          </template>
        </el-table-column>
      </el-table>
      <p style="font-size: 12px; color: red; line-height: 30px;" v-show="detType === 2">*规定时间段内打卡次数超过10次为异常</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'fixedpost',
  data () {
    return {
      search: {
        startDate: '',
        endDate: '',
        station: ''
      },
      nowSearch: {
        startDate: '',
        endDate: '',
        station: ''
      },
      stationOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detType: 0,
      detData: [],
      downDisabled: false
    }
  },
  created () {
    // 获取当天日期
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.startDate = nowDate
    this.search.endDate = nowDate
    this.nowSearch.startDate = nowDate
    this.nowSearch.endDate = nowDate
    // 获取列表数据
    this.getListData()
    // 获取固定岗列表
    this.getStationOptions()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        setAut: state => state.authority.plan
      }
    )
  },
  methods: {
    // 搜索
    searchList () {
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
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        position_id: this.search.station,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentMain',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.pms
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
    // 获取固定岗列表
    getStationOptions () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentPosition',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.stationOptions = res.data.data1
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
    /* 成功详情 */
    getSucessDet (data) {
      this.detData = []
      this.detDialog = true
      this.detType = 0
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: data.position_id,
        this_date: data.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selSucessPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detData = res.data.data1
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
    /* 失败详情 */
    getFailedDet (data) {
      this.detData = []
      this.detDialog = true
      this.detType = 1
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: data.position_id,
        this_date: data.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selFailedPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detData = res.data.data1
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
    /* 异常详情 */
    getAbnormalDet (data) {
      this.detData = []
      this.detDialog = true
      this.detType = 2
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: data.position_id,
        this_date: data.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selAbnormalPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detData = res.data.data1
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
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        position_id: this.search.station,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v1.0/permanentMainEO?' + params
    },
    /* 设置 */
    setClick () {
      this.$router.push({ path: '/main/fixedpost-set' })
    }
  }
}
</script>

<style lang="less" scoped>
.fixedpost{
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
        padding: 5px 0;
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
