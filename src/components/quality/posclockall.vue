<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
        <el-breadcrumb-item>位置打卡汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>执行部门</span>
            <el-select v-model="nowSearch.sector" style="width: 160px;" clearable placeholder="请选择执行部门">
              <el-option
                v-for="item in sectorOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>位置名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.position"></el-input>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
          </div>
        </div>
        <div class="search-row">
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
            <el-button type="primary" @click="oldSkip">历史数据</el-button>
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
        <el-table-column prop="position_name" fixed width="150" :show-overflow-tooltip="true" label="位置名称"></el-table-column>
        <el-table-column label="日期">
          <el-table-column width="80" v-for="item in days" :label="item.date" :key="item.date">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row.position_id, item.value)" v-if="scope.row[item.value]">{{ scope.row[item.value] }}次</a>
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
    </div>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      :parentDate="itemDate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/quality/posclockall-det'
export default{
  name: 'posclockall',
  data () {
    return {
      search: {
        sector: '',
        position: '',
        date: this.$common.getNowDate('yyyy-mm')
      },
      nowSearch: {
        sector: '',
        position: '',
        date: this.$common.getNowDate('yyyy-mm')
      },
      nowMonth: this.$common.getNowDate('yyyy-mm'),
      nowDay: 0,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() || time.getTime() < new Date('2020/3/1')
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
      itemId: 0,
      itemDate: '',
      downDisabled: true,
      loading: false
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
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
      if (nowDay <= i + 1) {
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
      ids = ids.join(',')
      this.sectorIds = ids
      this.sectorOptions = sectorOptions
      // 获取列表数据
      this.getListData()
    }
  },
  mounted () {

  },
  components: {
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.posclockall
    }),
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
        this.search.position = this.nowSearch.position
        this.getListData()
      } else {
        this.search = JSON.parse(JSON.stringify(this.nowSearch))
        this.dateChange()
      }
    },
    // 获取列表数据
    getListData () {
      // 部门ID
      let params = {
        project_id: this.projectId,
        ogz_ids: this.search.sector || this.sectorIds,
        position_name: this.search.position,
        month: this.search.date,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.8/selOgzUserRecordMessage',
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
    // 选择时间
    dateChange () {
      let date = this.search.date
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
          if (this.nowDay <= i + 1) {
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
    detClick (id, value) {
      this.itemId = id
      let day = value.replace(/size/g, '')
      day = day.padStart(2, '0')
      this.itemDate = this.search.date + '-' + day
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
          ids = ids.join(',')
          this.sectorIds = ids
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
    /* 导出 */
    downFile () {
      let params = {
        project_id: this.projectId,
        ogz_ids: this.search.sector || this.sectorIds,
        position_name: this.search.position,
        month: this.search.date
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.8/selOgzUserRecordMessageEO?' + params
    },
    /* 历史数据 */
    oldSkip () {
      const openUrl = this.baseUrl() + '/wx365web/#/old-posclockall?projectId=' + this.projectId
      window.open(openUrl)
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
  },
  watch: {
    sectorIds (val, oldVal) {
      if (val) {
        this.downDisabled = false
      } else {
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
