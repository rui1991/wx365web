<template>
  <div class="clockmark">
    <div class="search">
      <div class="item">
        <el-date-picker
          v-model="searchDate"
          type="month"
          value-format="yyyy-MM"
          :clearable="false"
          @change="dateChange"
          :picker-options="pickerOptions"
          placeholder="选择月">
        </el-date-picker>
      </div>
      <div class="operate">
        <el-button type="primary" @click="setClick">设置</el-button>
        <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
      </div>
    </div>
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" fixed width="80" label="姓名"></el-table-column>
      <el-table-column prop="position_name" fixed width="150" :show-overflow-tooltip="true" label="位置名称"></el-table-column>
      <el-table-column label="日期">
        <el-table-column width="80" v-for="item in days" :label="item.date" :key="item.date">
          <template slot-scope="scope">
            <span v-if="scope.row.position_id === 0" class="red">-</span>
            <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.user_id, scope.row.position_id, item.value)" v-else-if="scope.row[item.value]">{{ scope.row[item.value] }}次</a>
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
      layout="prev, pager, next, total"
      @current-change="pageChang"
      :total="total">
    </el-pagination>
    <!-- 详情 -->
    <el-dialog title="人员打卡详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="detData" style="width: 100%" max-height="360">
        <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
        <el-table-column prop="in_time" width="200" label="进入时间"></el-table-column>
        <el-table-column prop="out_time" width="200" label="离开时间"></el-table-column>
        <el-table-column prop="wait_time" label="停留时长(分)"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-transfer
        filterable
        ref="myTransfer"
        :filter-method="filterMethod"
        filter-placeholder="请输入部门名称"
        v-model="checkCrew"
        :props="props"
        :titles="['人员列表', '已选择']"
        :data="crewData">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="crewDisabled" @click="selectCrew">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'clockmark',
  data () {
    return {
      nowMonth: this.$common.getNowDate('yyyy-mm'),
      nowDay: 0,
      searchDate: this.$common.getNowDate('yyyy-mm'),
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      days: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      positionName: '',
      crewDialog: false,
      crewData: [],
      props: {
        label: 'user_name',
        key: 'user_id'
      },
      checkCrew: [],
      filterMethod (query, item) {
        return item.ogz_name.indexOf(query) > -1
      },
      crewDisabled: true,
      detData: [],
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
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
    // 获取列表
    this.getListData()
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
    // 获取列表数据
    getListData () {
      let params = {
        project_id: this.nowProid,
        month: this.searchDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selUserRecordMessageChildren',
        data: params
      }).then((res) => {
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
    // 选择时间
    dateChange (date) {
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
      // 获取列表
      this.getListData()
    },
    /* 详情 */
    checkDetails (uid, posid, time) {
      this.positionName = name
      this.detDialog = true
      let day = time.replace(/size/g, '')
      day = day.padStart(2, '0')
      const date = this.searchDate + '-' + day
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        userN_id: uid,
        start_date: date + ' 00:00',
        end_date: date + ' 23:59',
        type: 'position',
        position_id: posid,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTrajectory',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detData = res.data.data1 || []
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
    setClick () {
      this.crewDialog = true
      let params = {
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selRollCallChildUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const checkCrew = res.data.data1
          const crewData = this.crewData
          let crewIds = []
          checkCrew.forEach(itemValue => {
            let temp = crewData.find((item, index, array) => {
              return itemValue.user_id === item.user_id
            })
            if (temp) {
              crewIds.push(temp.user_id)
            }
          })
          this.checkCrew = crewIds
          if (this.$refs.myTransfer) {
            // 清空左边搜索
            this.$refs.myTransfer.$children['0']._data.query = ''
            // 清空右边搜索
            this.$refs.myTransfer.$children['3']._data.query = ''
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
    // 提交
    selectCrew () {
      let crewIds = this.checkCrew
      crewIds = crewIds.join(',')
      let params = {
        user_id: this.userId,
        project_id: this.nowProid,
        userids: crewIds
      }
      params = this.$qs.stringify(params)
      this.crewDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/setRollCallChildUser',
        data: params
      }).then((res) => {
        this.crewDisabled = false
        if (res.data.result === 'Sucess') {
          this.crewDialog = false
          // 刷新列表
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
        this.crewDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取项目人员
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
          this.crewData = crewData
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
        month: this.searchDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.7/selUserRecordMessageChildrenEO?' + params
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
    checkCrew (val, oldVal) {
      if (val.length === 0) {
        this.crewDisabled = true
      } else {
        this.crewDisabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.clockmark{
  .search{
    display: table;
    width: 100%;
    height: 60px;
    .item{
      display: table-cell;
      vertical-align: middle;
    }
    .operate{
      display: table-cell;
      vertical-align: middle;
      text-align: right;
    }
  }
}
</style>
