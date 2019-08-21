<template>
  <div class="salary">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业管理</el-breadcrumb-item>
          <el-breadcrumb-item>考勤报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <el-date-picker
                v-model="searchDate"
                type="month"
                value-format="yyyy-MM"
                :clearable="false"
                :picker-options="pickerOptions"
                @change="dateChange"
                placeholder="选择月">
              </el-date-picker>
            </div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>员工姓名</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>所属部门</span>
              <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择执行部门">
                <el-option
                  v-for="item in sectorOptions"
                  :key="item.base_id"
                  :label="item.name"
                  :value="item.base_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" fixed width="120" label="姓名"></el-table-column>
          <el-table-column prop="ogz_name" fixed width="150" :show-overflow-tooltip="true" label="所属部门"></el-table-column>
          <el-table-column :label="tableTitle">
            <el-table-column v-for="(item, i) in days" :label="item.date" :key="item.date">
              <el-table-column width="100" label="考勤打卡">
                <template slot-scope="scope">
                  <span class="blue" v-if="scope.row.dates[i].rc">{{ scope.row.dates[i].rc | filterDate }}</span>
                  <span v-else>无</span>
                </template>
              </el-table-column>
              <el-table-column width="100" label="点名次数">
                <template slot-scope="scope">
                  <span class="blue">{{ scope.row.dates[i].sf }}</span>
                </template>
              </el-table-column>
            </el-table-column>
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
  data () {
    return {
      searchDate: this.$common.getNowDate('yyyy-mm'),
      search: {
        name: '',
        sector: ''
      },
      nowSearch: {
        name: '',
        sector: ''
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      sectorOptions: [],
      tableTitle: '',
      days: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取当前月份
    let mydata = new Date()
    let year = mydata.getFullYear()
    let month = mydata.getMonth() + 1 + ''
    // 设置表格标题
    this.tableTitle = month + '月份考勤打卡报表'
    // 本月天数
    let daysCount = new Date(year, month, 0).getDate()
    let days = []
    for (let i = 0; i < daysCount; i++) {
      days.push(
        {
          date: i + 1 + '',
          value: 'rc'
        }
      )
    }
    this.days = days
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        project_id: this.nowProid,
        month: this.searchDate,
        user_name: this.search.name,
        ogz_id: this.search.sector,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/attendanceMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.users
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
    // 切换日期
    dateChange (date) {
      const dateArr = date.split('-')
      const year = dateArr[0]
      const month = dateArr[1]
      // 本月天数
      let daysCount = new Date(year, month, 0).getDate()
      let days = []
      for (let i = 0; i < daysCount; i++) {
        days.push(
          {
            date: i + 1 + '',
            value: 'rc'
          }
        )
      }
      this.days = days
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    /* 获取部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.nowOrgid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
        project_id: this.nowProid,
        month: this.searchDate,
        user_name: this.search.name,
        ogz_id: this.search.sector
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.8/selAttMessageEO?' + params
    }
  },
  filters: {
    filterDate (str) {
      if (!str) { return '' }
      return str.replace(/,/g, ' ')
    }
  }
}
</script>

<style lang="less" scoped>
  .salary{
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
