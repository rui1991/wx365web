<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>考勤管理</el-breadcrumb-item>
        <el-breadcrumb-item>无感考勤报表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
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
          <div class="operate">
            <el-button type="primary" @click="setDialog = true" v-if="authority.indexOf(115) !== -1">设置</el-button>
          </div>
        </div>
        <div class="search-row">
          <div class="item">
            <span>员工姓名</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
          </div>
          <div class="item">
            <span>所属部门</span>
            <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择所属部门">
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
        <el-table-column prop="user_name" fixed width="120" label="姓名" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ogz_name" fixed width="150" :show-overflow-tooltip="true" label="所属部门"></el-table-column>
        <el-table-column :label="tableTitle">
          <el-table-column v-for="(item, i) in days" :label="item.date" :key="item.date">
            <el-table-column width="120" label="出勤时段">
              <template slot-scope="scope">
                <span v-if="!item.state">-</span>
                <span class="red" v-else-if="scope.row.dates[i].times === '无'">无</span>
                <!--<a href="javascript:void(0);">{{ scope.row.dates[i].times }}</a>-->
                <a href="javascript:void(0);" style="display: flex; flex-direction: column; max-height: 140px; overflow-y: hidden; color: #4fa5f2;" @click="getCheckDet(scope.row.user_name, scope.row.user_id, scope.row.ogz_name, scope.row.dates[i].date)" v-else>
                  <span class="time" v-for="timeItem in scope.row.dates[i].times.split(',')">{{ timeItem }}</span>
                </a>
              </template>
            </el-table-column>
            <el-table-column width="100" label="出勤总时长">
              <template slot-scope="scope">
                <span v-if="scope.row.dates[i].all_time">{{ scope.row.dates[i].all_time }}分</span>
                <span v-else-if="item.state">0</span>
                <span v-else>-</span>
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
    </div>
    <!-- 设置 -->
    <set-module
      :parentDialog="setDialog"
      @parentUpdata="setCancel"
      @parentCancel="setCancel">
    </set-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentUname="uname"
      :parentUid="uid"
      :parentUsector="usector"
      :parentUdate="udate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入设置组件
import setModule from '@/components/attend/nosalary-set'
// 引入设置组件
import detModule from '@/components/attend/nosalary-det'
export default{
  name: 'nosalary',
  data () {
    return {
      nowMonth: this.$common.getNowDate('yyyy-mm'),
      nowDay: 0,
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
      callnameContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      loading: false,
      downDisabled: false,
      setDialog: false,
      detDialog: false,
      uname: '',
      uid: '',
      usector: '',
      udate: ''
    }
  },
  created () {

  },
  mounted () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    const myDate = new Date()
    const year = myDate.getFullYear()
    const month = myDate.getMonth() + 1
    const nowDay = myDate.getDate()
    this.nowDay = nowDay
    // 设置表格标题
    this.tableTitle = month + '月份考勤打卡报表'
    // 本月天数
    let daysCount = new Date(year, month, 0).getDate()
    let days = []
    for (let i = 0; i < daysCount; i++) {
      let state = true
      if (nowDay < i + 1) {
        state = false
      }
      days.push(
        {
          date: i + 1 + '',
          value: 'rc',
          state: state
        }
      )
    }
    this.days = days
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
  },
  components: {
    setModule,
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.nosalary,
      authority: state => state.detAuthority.nosalary
    }),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 获取列表数据
    getListData () {
      // 部门名称
      const sectorId = this.search.sector
      let sectorName = ''
      if (sectorId) {
        let sector = this.sectorOptions.find(item => {
          return item.base_id === sectorId
        })
        sectorName = sector.name
      }
      let params = {
        project_id: this.projectId,
        month: this.searchDate,
        user_name: this.search.name,
        ogz_name: sectorName,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/att/selAttReport',
        data: params
      }).then((res) => {
        this.loading = false
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
      let whether = false
      if (this.nowMonth === date) {
        whether = true
      }
      const dateArr = date.split('-')
      const year = Number.parseInt(dateArr[0])
      const month = Number.parseInt(dateArr[1])
      // 本月天数
      let daysCount = new Date(year, month, 0).getDate()
      let days = []
      for (let i = 0; i < daysCount; i++) {
        let state = true
        if (whether) {
          if (this.nowDay < i + 1) {
            state = false
          }
        }
        days.push(
          {
            date: i + 1 + '',
            value: 'rc',
            state: state
          }
        )
      }
      // 清空表格
      this.tableData = []
      // 设置表头
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
    // 获取考勤详情
    getCheckDet (uname, uid, usector, udate) {
      this.uname = uname
      this.uid = uid
      this.usector = usector
      this.udate = udate
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 获取部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
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
    /* 设置 */
    setCancel () {
      this.setDialog = false
    },
    /* 导出 */
    downFile () {
      // 部门名称
      const sectorId = this.search.sector
      let sectorName = ''
      if (sectorId) {
        let sector = this.sectorOptions.find(item => {
          return item.base_id === sectorId
        })
        sectorName = sector.name
      }
      let params = {
        project_id: this.projectId,
        month: this.searchDate,
        user_name: this.search.name,
        ogz_name: sectorName
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/att/selAttReportEO?' + params
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
  @import '../../assets/css/base-column.css';
</style>
