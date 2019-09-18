<template>
  <div
    class="trackdet"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item>轨迹记录详情</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <span>日期</span>
            <el-date-picker
              style="width: 160px;"
              v-model="nowSearch.date"
              type="date"
              :clearable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="item">
            <span>选择人员</span>
            <el-select v-model="nowSearch.crew" style="width: 180px;" filterable placeholder="请选择人员">
              <el-option
                v-for="item in crewOptions"
                :key="item.user_id"
                :label="item.user_name"
                :value="item.user_id">
              </el-option>
            </el-select>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downProDisa" @click="downProject">导出</el-button>
            <!--<el-button type="primary" icon="el-icon-download" :disabled="downCrewDisa" @click="downCrew">导出个人</el-button>-->
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" width="150" label="姓名"></el-table-column>
          <el-table-column width="260" label="进入时间">
            <template slot-scope="scope">
              <span>{{ scope.row.in_time }}</span>
            </template>
          </el-table-column>
          <el-table-column width="260" label="离开时间">
            <template slot-scope="scope">
              <span>{{ scope.row.out_time }}</span>
            </template>
          </el-table-column>
          <el-table-column width="150" prop="wait_time" label="停留时长(分)"></el-table-column>
          <el-table-column prop="position_name" label="位置" :show-overflow-tooltip="true"></el-table-column>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'trackdet',
  data () {
    return {
      search: {
        crew: '',
        date: this.$common.getNowDate('yyyy-mm-dd')
      },
      nowSearch: {
        crew: '',
        date: this.$common.getNowDate('yyyy-mm-dd')
      },
      crewOptions: [],
      logData: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downCrewDisa: false,
      downProDisa: false,
      loading: false
    }
  },
  created () {
    // 获取项目人员
    this.getCrewOptions()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid
      }
    )
  },
  methods: {
    /* 人员 */
    getCrewOptions () {
      let params = {
        organize_id: this.nowOrgid,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewData = res.data.data1.users
          this.crewOptions = crewData
          this.search.crew = crewData[0].user_id
          this.nowSearch.crew = crewData[0].user_id
          // 获取列表数据
          this.getListData()
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
    /* 搜索 */
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
        userN_id: this.search.crew,
        start_date: this.search.date + ' 00:00',
        end_date: this.search.date + ' 23:59',
        type: 'name'
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTrajectory',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          // 全部数据
          const logData = res.data.data1
          this.logData = logData
          // 总页数
          const total = logData.length
          this.total = total
          // 表格数据
          const tableData = logData.slice(0, this.limit)
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
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 更新列表数据
      const start = this.nowPage * this.limit - this.limit
      const end = this.nowPage * this.limit
      const tableData = this.logData.slice(start, end)
      this.tableData = tableData
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 更新列表数据
      const start = page * this.limit - this.limit
      const end = page * this.limit
      const tableData = this.logData.slice(start, end)
      this.tableData = tableData
    },
    /* 导出 */
    // 导出个人
    downCrew () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        userN_id: this.search.crew,
        start_date: this.search.date + ' 00:00',
        end_date: this.search.date + ' 23:59',
        type: 'name'
      }
      params = this.$qs.stringify(params)
      this.downCrewDisa = true
      setTimeout(() => {
        this.downCrewDisa = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/trajectoryEximport?' + params
    },
    // 导出项目
    downProject () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        userN_id: '',
        start_date: this.search.date + ' 00:00',
        end_date: this.search.date + ' 23:59',
        type: 'name'
      }
      params = this.$qs.stringify(params)
      this.downProDisa = true
      setTimeout(() => {
        this.downProDisa = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/trajectoryEximport?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.trackdet{
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
        display: table;
        width: 100%;
        height: 60px;
        .item{
          display: table-cell;
          vertical-align: middle;
          width: 280px;
          font-size: 0;
          span{
            margin-right: 10px;
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
</style>
