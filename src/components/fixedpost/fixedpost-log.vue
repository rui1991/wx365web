<template>
  <div class="fixedpost">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>固定岗管理</el-breadcrumb-item>
          <el-breadcrumb-item>固定岗打卡记录</el-breadcrumb-item>
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
            <div class="item">
              <span>岗位名称</span>
              <el-select v-model="nowSearch.station" clearable filterable style="width: 160px;" placeholder="请选择岗位名称">
                <el-option v-for="item in stationOptions" :key="item.position_id" :label="item.position_name" :value="item.position_id"></el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>人员姓名</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
            <div class="item">
              <span>打卡状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择打卡状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="operate"></div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="this_date" label="日期"></el-table-column>
          <el-table-column label="当班人姓名">
            <template slot-scope="scope">
              <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="position_name" label="岗位名称"></el-table-column>
          <el-table-column prop="start_time" label="当班开始时间"></el-table-column>
          <el-table-column prop="end_time" label="当班结束时间"></el-table-column>
          <el-table-column label="打卡时间">
            <template slot-scope="scope">
              <span v-if="scope.row.record_time">{{ scope.row.record_time | formatDate }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="打卡状态">
            <template slot-scope="scope">
              <span v-if="scope.row.record_state === 0">已打卡</span>
              <span class="red" v-else-if="scope.row.record_state === 1">未打卡</span>
              <span class="red" v-else-if="scope.row.record_state === 2">异常</span>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'fixedpostLog',
  data () {
    return {
      search: {
        startDate: '',
        endDate: '',
        station: '',
        crew: '',
        state: ''
      },
      nowSearch: {
        startDate: '',
        endDate: '',
        station: '',
        crew: '',
        state: ''
      },
      stationOptions: [],
      stateOptions: [
        {
          label: '已打卡',
          value: 0
        },
        {
          label: '未打卡',
          value: 1
        },
        {
          label: '异常',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
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
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
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
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        position_id: this.search.station,
        user_name: this.search.crew,
        record_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentOnWork',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.sp
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
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
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
    /* 导出 */
    downFile () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        position_id: this.search.station,
        user_name: this.search.crew,
        record_state: this.search.state
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v1.0/permanentOnWorkEO?' + params
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
