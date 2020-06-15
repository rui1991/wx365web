<template>
  <div
    class="home-fixation"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-container">
      <div class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item><router-link to="/main/home">首页</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>项目固定岗管理数据分析</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="module-main">
        <div class="search">
          <span>项目：{{ projectName }}</span>
        </div>
        <div
          class="pandect"
          v-loading="generalLoading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.6)">
          <div class="pandect-head">
            <h3 class="title">
              <span class="chunk"></span>
              <span class="txt">固定岗概况</span>
            </h3>
            <el-select v-model="generalType" class="operate" style="width: 160px;" @change="generalChange">
              <el-option
                v-for="item in pandectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="pandect-body">
            <div class="pandect-item">
              <span class="price">{{ generalData.allNum }}</span>
              <span class="name">需打卡次数（次）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="clockClick(1)">{{ generalData.succeedNum }}</a>
              <span class="name">打卡成功次数（次）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="clockClick(2)">{{ generalData.noclockNum }}</a>
              <span class="name">未打卡次数（次）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="clockClick(3)">{{ generalData.abnormalNum }}</a>
              <span class="name">打卡异常数（次）</span>
            </div>
          </div>
        </div>
        <div class="graph">
          <el-row :gutter="10">
            <el-col :span=clockTrendSpan>
              <div
                class="graph-item"
                v-resize="clockTrendRedraw"
                v-loading="clockTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">固定岗打卡次数趋势</p>
                  </div>
                  <el-select v-model="clockTrendType" class="operate" style="width: 160px;" @change="clockTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="clockTrendOption" id="home_call_clocktrend" :domWidth="clockTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 任务详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="orgBase"
      :parentState="clockState"
      :parentNum="generalType"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
// 引入chart
import Chart from '@/components/public/chart'
// 引入详情
import detModule from '@/components/profile/fixation-det'

/*
* 参数说明：
*   resData: 用于保存1天，7天，30天的数据
*   *State: 用于记录数据状态
* */
export default{
  name: 'homeFixation',
  data () {
    return {
      orgid: 0,
      orgBase: 0,
      projectName: '',
      pandectOptions: [
        {
          value: 1,
          label: '今天'
        },
        {
          value: 7,
          label: '近7天'
        },
        {
          value: 30,
          label: '近一个月'
        }
      ],
      generalLoading: false,
      generalType: 1,
      generalData: {
        allNum: 0,
        succeedNum: 0,
        noclockNum: 0,
        abnormalNum: 0
      },
      chartOptions: [
        {
          value: 7,
          label: '近七天'
        },
        {
          value: 30,
          label: '近一个月'
        }
      ],
      clockTrendLoading: false,
      clockTrendType: 7,
      clockTrendOption: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: []
        },
        grid: {
          top: '12%',
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 40
          }
        },
        yAxis: {
          type: 'value'
        },
        series: []
      },
      resData1: {
        generalData: {},
        clockTrendData: {}
      },
      generalState1: false,
      clockTrendState1: false,
      resData2: {
        generalData: {},
        clockTrendData: {}
      },
      generalState2: false,
      clockTrendState2: false,
      resData3: {
        generalData: {}
      },
      generalState3: false,
      clockTrendSpan: 12,
      clockTrendWidth: '',
      loading: false,
      detDialog: false,
      clockState: 0
    }
  },
  created () {

  },
  mounted () {
    this.projectName = this.$route.query.name
    const type = Number.parseInt(this.$route.query.type)
    const baseId = Number.parseInt(this.$route.query.baseId)
    this.orgBase = baseId
    this.switchType = type
    if (type === 2) {
      // 获取项目数据
      this.getProjectData(1)
    } else {
      // 返回上一级
      this.$router.go(-1)
    }
  },
  components: {
    Chart,
    detModule
  },
  methods: {
    // 项目数据
    getProjectData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateFixedPostSurvey',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          this.resultDispose(resData)
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
    // 结果处理
    resultDispose (data) {
      // 点名概况
      const generalArg = data.fpBaseMes
      let generalData = {
        allNum: generalArg.mustPerRecordSize || 0,
        succeedNum: generalArg.sucessPerRecordSize || 0,
        noclockNum: generalArg.notPerRecordSize || 0,
        abnormalNum: generalArg.abnormalPerRecordSize || 0
      }
      this.generalData = generalData
      // 固定岗打卡次数趋势
      const clockTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
      let clockTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const clockTrendArg = data.fpRecordSizeTrend || []
      clockTrendArg.forEach((item, index) => {
        clockTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        clockTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: clockTrendColors[index],
          data: itemData
        })
      })
      clockTrendArg[0].data.forEach(inItem => {
        clockTrendData.xAxisData.push(inItem.date)
      })
      this.clockTrendOption.legend.data = clockTrendData.legendData
      this.clockTrendOption.xAxis.data = clockTrendData.xAxisData
      this.clockTrendOption.series = clockTrendData.seriesData
      // 存储数据
      this.resData1 = {
        generalData: generalData,
        clockTrendData: clockTrendData
      }
      this.generalState1 = true
      this.clockTrendSpan = 12
      this.clockTrendState1 = true
    },
    /* 点名概况 */
    generalChange (val) {
      if (val === 1) {
        if (this.generalState1) {
          this.generalData = this.resData1.generalData
        } else {
          this.getGeneralProData(val)
        }
      } else if (val === 7) {
        if (this.generalState2) {
          this.generalData = this.resData2.generalData
        } else {
          this.getGeneralProData(val)
        }
      } else if (val === 30) {
        if (this.generalState3) {
          this.generalData = this.resData3.generalData
        } else {
          this.getGeneralProData(val)
        }
      }
    },
    getGeneralProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.generalLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzFixedPostDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.fpBaseMes
          let generalData = {
            allNum: resData.mustPerRecordSize || 0,
            succeedNum: resData.sucessPerRecordSize || 0,
            noclockNum: resData.notPerRecordSize || 0,
            abnormalNum: resData.abnormalPerRecordSize || 0
          }
          this.generalData = generalData
          if (n === 1) {
            this.generalState1 = true
            this.resData1.generalData = generalData
          } else if (n === 7) {
            this.generalState2 = true
            this.resData2.generalData = generalData
          } else if (n === 30) {
            this.generalState3 = true
            this.resData3.generalData = generalData
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
        this.generalLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 固定岗打卡次数趋势 */
    clockTrendChange (val) {
      if (val === 7) {
        if (this.clockTrendState1) {
          this.clockTrendSpan = 12
          this.clockTrendOption.legend.data = this.resData1.clockTrendData.legendData
          this.clockTrendOption.xAxis.data = this.resData1.clockTrendData.xAxisData
          this.clockTrendOption.series = this.resData1.clockTrendData.seriesData
        } else {
          this.getClockTrendProData(val)
        }
      } else if (val === 30) {
        if (this.clockTrendState2) {
          this.clockTrendSpan = 24
          this.clockTrendOption.legend.data = this.resData2.clockTrendData.legendData
          this.clockTrendOption.xAxis.data = this.resData2.clockTrendData.xAxisData
          this.clockTrendOption.series = this.resData2.clockTrendData.seriesData
        } else {
          this.getClockTrendProData(val)
        }
      }
    },
    getClockTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.clockTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzFixedPostDetailsRecordSizeMes',
        data: params
      }).then((res) => {
        this.clockTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.fpRecordSizeTrend || []
          const clockTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
          let clockTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            clockTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            clockTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: clockTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            clockTrendData.xAxisData.push(inItem.date)
          })
          this.clockTrendOption.legend.data = clockTrendData.legendData
          this.clockTrendOption.xAxis.data = clockTrendData.xAxisData
          this.clockTrendOption.series = clockTrendData.seriesData
          if (n === 7) {
            this.clockTrendSpan = 12
            this.clockTrendState1 = true
            this.resData1.clockTrendData = clockTrendData
          } else if (n === 30) {
            this.clockTrendSpan = 24
            this.clockTrendState2 = true
            this.resData2.clockTrendData = clockTrendData
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
        this.clockTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    clockTrendRedraw (val) {
      this.clockTrendWidth = val.width
    },
    /* 详情 */
    clockClick (state) {
      this.clockState = state
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    }
  },
  directives: {
    resize: {
      // 注册局部指令
      bind (el, binding) {
        let width = ''
        let height = ''
        function get () {
          const style = document.defaultView.getComputedStyle(el)
          if (width !== style.width || height !== style.height) {
            binding.value({width, height})
          }
          width = style.width
          height = style.height
        }
        el.__vueReize__ = setInterval(get, 200)
      },
      unbind (el) {
        clearInterval(el.__vueReize__)
      }
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>
  .home-fixation{
    height: 100%;
    .module-container{
      height: 100%;
      .module-header{
        padding-bottom: 20px;
        .el-breadcrumb{
          padding-top: 15px;
          padding-left: 20px;
          padding-bottom: 15px;
          background: #ffffff;
        }
      }
      .module-main{
        margin-left: 20px;
        margin-right: 20px;
        .search{
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 70px;
          padding-left: 20px;
          padding-right: 20px;
          background: #ffffff;
          .hint{
            padding-left: 20px;
            color: #272727;
          }
          .track{
            flex-grow: 1;
            text-align: right;
          }
        }
        .pandect{
          margin-top: 10px;
          padding-top: 10px;
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 10px;
          background: #ffffff;
          .pandect-head {
            display: flex;
            align-items: center;
            height: 45px;
            .title{
              display: flex;
              align-items: center;
              height: 100%;
              .chunk {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #4e97d8;
              }
              .txt{
                padding-left: 10px;
                font-size: 18px;
                color: #333;
              }
            }
            .operate{
              padding-left: 30px;
            }
          }
          .pandect-body{
            padding-top: 10px;
            display: flex;
            flex-wrap: wrap;
            .pandect-item{
              width: 25%;
              height: 60px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              .price{
                font-weight: 600;
                color: #272727;
                font-size: 16px;
                &.vital{
                  color: #409EFF;
                }
              }
              .name {
                margin-top: 5px;
                color: #686868;
                font-size: 14px;
              }
            }
          }
        }
        .graph{
          .graph-item{
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            padding: 10px 20px;
            background: #ffffff;
            .item-head {
              display: flex;
              align-items: center;
              height: 45px;
              .title{
                display: flex;
                align-items: center;
                height: 100%;
                .chunk {
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: #4e97d8;
                }
                .txt{
                  padding-left: 10px;
                  font-size: 18px;
                  color: #333;
                }
              }
              .operate{
                padding-left: 30px;
              }
            }
            .item-body{
              margin-top: 5px;
              height: 280px;
            }
          }
        }
      }
    }
  }
</style>
