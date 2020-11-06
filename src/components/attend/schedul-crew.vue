<template>
  <div class="crew-sche">
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
      <div class="rl-table-td rl-table-item nowMonth" :class="item.date === nowDate ? 'active' : ''" v-for="(item, index) in calendarData" :key="item.date">
        <span class="sun">{{index+1}}</span>
        <div class="work">
          <p class="work-item" v-if="item.work">{{ item.work.work_name }}</p>
        </div>
      </div>
      <div class="rl-table-td rl-table-item minor" v-for="item in nextData" :key="item">
        <span class="sun">{{item}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentTime', 'parentUserActive'],
  data () {
    return {
      nowDate: this.$common.getNowDate('yyyy-mm-dd'),
      lastData: [],
      calendarData: [],
      nextData: []
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
        userN_id: this.parentUserActive,
        month_day: this.parentTime
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/findOnWorkByUserMonth',
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
    }
  },
  watch: {
    parentTime (newVal, oldVal) {
      this.getCalendarData()
    },
    parentUserActive (newVal, oldVal) {
      this.getCalendarData()
    }
  }
}
</script>

<style lang="less" scoped>
.crew-sche{
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
        .sun{
          display: block;
          color: #444;
        }
        .work{
          height: 125px;
          overflow-y: auto;
          .work-item{
            height: 30px;
            margin: 5px 5px 0;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            padding-left: 8px;
            line-height: 28px;
            font-size: 12px;
            color: #444;
            border-left: 4px solid #1dd943;
          }
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
