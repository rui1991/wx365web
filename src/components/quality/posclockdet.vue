<template>
  <div
    class="posclockdet"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <div class="search">
      <div class="search-input" style="margin-bottom: 10px;">
        <div class="item">
          <span>执行部门</span>
          <el-select v-model="nowSearch.sector" clearable style="width: 160px;" placeholder="请选择执行部门">
            <el-option
              v-for="item in sectorOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="item">
          <span>执行人员</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.crew" placeholder="请输入人员姓名"></el-input>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
        </div>
      </div>
      <div class="search-input">
        <div class="item">
          <el-date-picker
            v-model="nowSearch.date"
            type="month"
            value-format="yyyy-MM"
            :clearable="false"
            :picker-options="pickerOptions"
            placeholder="选择月">
          </el-date-picker>
        </div>
        <div class="operate">
          <el-button type="primary" @click="crewClick">设置</el-button>
        </div>
      </div>
    </div>
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" fixed width="80" label="姓名" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="position_name" fixed width="150" :show-overflow-tooltip="true" label="位置名称"></el-table-column>
      <el-table-column label="日期">
        <el-table-column width="80" v-for="item in days" :label="item.date" :key="item.date">
          <template slot-scope="scope">
            <span v-if="scope.row.position_id === 0" class="red">-</span>
            <a href="javascript:void(0);" class="name" @click="detClick(scope.row.user_id, scope.row.position_id, item.value)" v-else-if="scope.row[item.value]">{{ scope.row[item.value] }}次</a>
            <span class="red" v-else-if="item.state">未打卡</span>
            <span v-else>-</span>
          </template>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentUid="uId"
      :parentPos="posId"
      :parentDate="detDate"
      @parentClose="detClose">
    </det-module>
    <!-- 设置 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentOrgid="projectOrgId"
      :parentIds="crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/quality/posclockdet-det'
// 引入设置组件
import crewModule from '@/components/public/crew-checkbox1'
export default{
  name: 'posclockdet',
  data () {
    return {
      search: {
        sector: '',
        crew: '',
        date: this.$common.getNowDate('yyyy-mm')
      },
      nowSearch: {
        sector: '',
        crew: '',
        date: this.$common.getNowDate('yyyy-mm')
      },
      nowMonth: this.$common.getNowDate('yyyy-mm'),
      nowDay: 0,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      sectorOptions: [],
      sectorIds: '',
      days: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      uId: 0,
      posId: 0,
      detDate: '',
      crewDialog: false,
      crewState: false,
      crewId: [],
      downDisabled: false,
      loading: false
    }
  },
  mounted () {
    // 日期
    const myDate = new Date()
    const year = myDate.getFullYear()
    const month = myDate.getMonth() + 1
    const nowDay = myDate.getDate()
    this.nowDay = nowDay
    // 本月天数
    let daysCount = new Date(year, month, 0).getDate()
    let days = []
    for (let i = 0; i < daysCount; i++) {
      let date = i + 1 + '日'
      let value = 'size' + (i + 1)
      let state = true
      if (nowDay <= i) {
        state = false
      }
      days.push(
        {
          date: date,
          value: value,
          state: state
        }
      )
    }
    this.days = days
    // 全部项目
    const allProject = this.allProject
    const projectId = this.projectId
    const nowProject = allProject.find(item => {
      return item.project_id === projectId
    })
    if (nowProject.ogzs === undefined) {
      // 获取项目所有部门
      this.getProAllSector()
    } else {
      let ids = []
      let sectorOptions = []
      nowProject.ogzs.forEach(item => {
        ids.push(item.ogz_id)
        sectorOptions.push({
          id: item.ogz_id,
          name: item.organize_name
        })
      })
      this.sectorIds = ids.join(',')
      this.sectorOptions = sectorOptions
      // 获取列表数据
      this.getListData()
    }
  },
  components: {
    detModule,
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'allProject',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 搜索
    searchList () {
      // 当前页码初始化
      this.nowPage = 1
      if (this.nowSearch.date === this.search.date) {
        this.search.sector = this.nowSearch.sector
        this.search.crew = this.nowSearch.crew
        this.getListData()
      } else {
        this.search = JSON.parse(JSON.stringify(this.nowSearch))
        this.dateChange()
      }
    },
    // 获取列表数据
    getListData () {
      let params = {
        project_id: this.projectId,
        ogz_ids: this.search.sector || this.sectorIds,
        user_name: this.search.crew,
        month: this.search.date,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selOgzUserRecordMessageChildren',
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
    // 时间变化
    dateChange () {
      const date = this.search.date
      let whether = false
      if (this.nowMonth === date) {
        whether = true
      }
      const dateArr = date.split('-')
      const year = dateArr[0]
      const month = dateArr[1]
      // 本月天数
      let daysCount = new Date(year, month, 0).getDate()
      let days = []
      for (let i = 0; i < daysCount; i++) {
        let date = i + 1 + '日'
        let value = 'size' + (i + 1)
        let state = true
        if (whether) {
          if (this.nowDay <= i) {
            state = false
          }
        }
        let item = {
          date: date,
          value: value,
          state: state
        }
        days.push(item)
      }
      this.days = days
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    /* 详情 */
    detClick (uid, posid, time) {
      this.uId = uid
      this.posId = posid
      let day = time.replace(/size/g, '')
      day = day.padStart(2, '0')
      this.detDate = this.search.date + '-' + day
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 项目所有部门 */
    getProAllSector () {
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
          const nodeData = res.data.data1[0].children
          let ids = []
          let sectorOptions = []
          nodeData.forEach(item => {
            ids.push(item.base_id)
            sectorOptions.push({
              id: item.base_id,
              name: item.name
            })
          })
          this.sectorIds = ids.join(',')
          this.sectorOptions = sectorOptions
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
    /* 设置 */
    crewClick () {
      if (this.crewState) {
        this.crewDialog = true
        return
      }
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selRollCallChildUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const checkCrew = res.data.data1
          let crewId = []
          checkCrew.forEach(item => {
            crewId.push(item.user_id)
          })
          this.crewId = crewId
          this.crewState = true
          this.crewDialog = true
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
    crewUpdata (data) {
      let crewId = data.ids
      crewId = crewId.join(',')
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        userids: crewId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/setRollCallChildUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewId = data.ids
          this.crewDialog = false
          // 初始化页码
          this.nowPage = 1
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
      this.crewDialog = false
    },
    crewCancel () {
      this.crewDialog = false
    },
    /* 导出 */
    downFile () {
      let params = {
        project_id: this.projectId,
        ogz_ids: this.search.sector || this.sectorIds,
        user_name: this.search.crew,
        month: this.search.date
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.7/selOgzUserRecordMessageChildrenEO?' + params
    }
  },
  filters: {
    filterDate (str) {
      if (!str) { return '' }
      let value = new Date(Number.parseInt(str))
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      let seconds = value.getSeconds() + ''
      seconds = seconds.padStart(2, '0')
      return `${hour}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="less" scoped>
.posclockdet{
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

  .search{
    padding: 5px 0;
    .search-input{
      display: flex;
      align-items: center;
      width: 100%;
      .item{
        margin-right: 20px;
      }
      .operate{
        flex-grow: 1;
        text-align: right;
      }
    }
  }
}
</style>
