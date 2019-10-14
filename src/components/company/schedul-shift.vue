<template>
  <div class="shift-sche">
    <div class="rl-head clearfix">
      <div class="rl-table-th rl-table-item">星期日</div>
      <div class="rl-table-th rl-table-item">星期一</div>
      <div class="rl-table-th rl-table-item">星期二</div>
      <div class="rl-table-th rl-table-item">星期三</div>
      <div class="rl-table-th rl-table-item">星期四</div>
      <div class="rl-table-th rl-table-item">星期五</div>
      <div class="rl-table-th rl-table-item">星期六</div>
    </div>
    <div class="rl-body clearfix">
      <div class="rl-table-td rl-table-item minor" v-for="item in lastData" :key="item">
        <span class="sun">{{item}}</span>
      </div>
      <div class="rl-table-td rl-table-item nowMonth" :class="item.date === nowDate ? 'active' : ''" v-for="(item, index) in calendarData" :key="item.date" @mouseenter="dateMouseenter(item.date)" @mouseleave="showDate = ''">
        <span class="sun">{{index+1}}</span>
        <div class="work">
          <p class="work-item" v-for="day in item.work" :key="day.work_user">
            <span>{{ day.user_name }}</span>
            <i class="el-icon-remove" @click="delClick(item.date, day.work_user)" v-show="item.date === showDate"></i>
          </p>
        </div>
        <i class="el-icon-circle-plus add" @click.stop="addClick(item.date)" v-show="item.date === showDate"></i>
      </div>
      <div class="rl-table-td rl-table-item minor" v-for="item in nextData" :key="item">
        <span class="sun">{{item}}</span>
      </div>
    </div>
    <!-- 新增 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model="crewfilter"></el-input>
      <el-table class="select-table" :data="crewData" @selection-change="crewSelectChange" style="width: 100%" max-height="360">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="cerwDisabled" @click="selectCrew">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该排班？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentTime', 'parentTabActive'],
  data () {
    return {
      nowDate: this.$common.getNowDate('yyyy-mm-dd'),
      lastData: [],
      calendarData: [],
      nextData: [],
      showDate: '',
      crewDialog: false,
      crewData: [],
      ocrewData: [],
      crewfilter: '',
      crewSelectData: [],
      cerwDisabled: false,
      delDialog: false,
      delDisabled: false,
      date: '',
      uId: ''
    }
  },
  created () {

  },
  mounted () {
    // 获取日历数据
    if (this.parentTime) {
      this.getCalendarData()
    }
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
    // 获取日历数据
    getCalendarData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        projectN_id: this.projectId,
        work_id: this.parentTabActive,
        month_day: this.parentTime
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/findOnWorkByWorkMonth',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const calendarData = res.data.data1
          this.showCalendarTable(calendarData)
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
    // 日历数据处理
    showCalendarTable (calendarData) {
      const dateArr = this.parentTime.split('-')
      const nowYear = dateArr[0]
      const nowMonth = dateArr[1]
      // 本月天数
      let daysCount = new Date(nowYear, nowMonth, 0).getDate()
      // 本月1号周几
      let monthstart = new Date(nowYear + '/' + nowMonth + '/1').getDay()
      // 上个月天数
      let lastMonth = ''
      if (this.nowMonth === 1) {
        lastMonth = new Date(nowYear - 1, 12, 0).getDate()
      } else {
        lastMonth = new Date(nowYear, nowMonth - 1, 0).getDate()
      }
      // 上个月的数据
      let lastData = []
      // 计算上个月空格数
      for (let i = monthstart; i > 0; i--) {
        lastData.push(lastMonth - i + 1)
      }
      this.lastData = lastData
      // 本月数据
      this.calendarData = calendarData
      // 计算下个月空格数
      let nextBlank = 42 - (daysCount + monthstart)
      let nextData = []
      for (let i = 0; i < nextBlank; i++) {
        nextData.push(i + 1)
      }
      this.nextData = nextData
    },
    /* 新增 */
    dateMouseenter (date) {
      let nowDate = this.nowDate
      nowDate = new Date(nowDate.replace(/-/g, '/'))
      const getDate = new Date(date.replace(/-/g, '/'))
      if (nowDate <= getDate) {
        this.showDate = date
      }
    },
    addClick (date) {
      this.date = date
      this.crewDialog = true
      // 清空搜索
      this.crewfilter = ''
      // 清空选中人员
      this.crewSelectData = []
      // 获取人员
      this.getCrewData()
    },
    // 获取人员
    getCrewData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        date: this.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selNotWorkUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewData = res.data.data1
          this.ocrewData = res.data.data1
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
    // 选择人员
    crewSelectChange (data) {
      this.crewSelectData = data
    },
    selectCrew () {
      let uids = []
      this.crewSelectData.forEach(item => {
        uids.push(item.user_id)
      })
      uids = uids.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        date: this.date,
        work_users: uids,
        work_id: this.parentTabActive
      }
      params = this.$qs.stringify(params)
      this.cerwDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/workSet',
        data: params
      }).then((res) => {
        this.cerwDisabled = false
        if (res.data.result === 'Sucess') {
          this.crewDialog = false
          // 刷新日历
          this.getCalendarData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.cerwDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 删除 */
    delClick (date, uid) {
      this.date = date
      this.uId = uid
      this.delDialog = true
    },
    submitDelForm () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        date: this.date,
        work_user: this.uId,
        work_id: this.parentTabActive
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/delWorkSet',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.delDialog = false
          // 刷新日历
          this.getCalendarData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.delDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    parentTime (newVal, oldVal) {
      this.getCalendarData()
    },
    parentTabActive (nowVal, oldVal) {
      this.getCalendarData()
    },
    crewfilter (nowVal, oldVal) {
      this.crewData = this.ocrewData.filter(item => (~item.user_name.indexOf(nowVal)))
    },
    crewSelectData (newVal, oldVal) {
      if (newVal.length > 0) {
        this.cerwDisabled = false
      } else {
        this.cerwDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.shift-sche{
  height: 950px;
  .rl-table-item{
    float: left;
    width: 14.25%;
    font-size: 14px;
    border-left: 1px solid #e5e5e5;
    border-top: 1px solid #e5e5e5;
  }
  .rl-head{
    font-size: 0;
    .rl-table-th{
      height: 40px;
      line-height: 40px;
      text-align: center;
      background: #77a3cf;
      color: #fff;
    }
    .rl-table-th:nth-of-type(7){
      border-right: 1px solid #e5e5e5;
    }
  }
  .rl-body{
    border-bottom: 1px solid #e5e5e5;
    font-size: 0;
    .rl-table-td{
      height: 150px;
      &.minor{
        .sun{
          display: block;
          color: #e5e5e5;
        }
      }
      &.nowMonth{
        position: relative;
        .sun{
          display: block;
          color: #444;
        }
        .work{
          height: 125px;
          overflow-y: auto;
          .work-item{
            position: relative;
            height: 30px;
            margin: 5px 5px 0;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            padding-left: 8px;
            line-height: 28px;
            font-size: 12px;
            color: #444;
            border-left: 4px solid #1dd943;
            span{
              display: inline-block;
              width: 80px;
              line-height: 28px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            i{
              position: absolute;
              right: 4px;
              top: 5px;
              font-size: 18px;
              color: red;
              cursor: pointer;
            }
          }
        }
        .add{
          position: absolute;
          bottom: 5px;
          right: 5px;
          font-size: 18px;
          color: #5bc0de;
          cursor: pointer;
        }
        &.active{
          background: #f1f1f1;
        }
      }
    }
    .rl-table-td:nth-of-type(7n){
      border-right: 1px solid #e5e5e5;
    }
  }
}
</style>
