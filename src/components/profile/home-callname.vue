<template>
  <div
    class="home-callname"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-container">
      <div class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item><router-link to="/main/home">首页</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>{{ modTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="module-main">
        <div class="search" v-if="switchType === 2">
          <span>{{ typeName }}</span>
          <el-select v-model="orgid" style="width: 160px;" @change="sectorChange">
            <el-option
              v-for="item in sectorOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="search" v-if="switchType === 3">
          <span>部门：{{ sectorName }}</span>
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
              <span class="txt">点名概况</span>
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
              <span class="name">点名人数（人）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="detClick(1)">{{ generalData.succeedNum }}</a>
              <span class="name">点名成功人数（人）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.clockRate }}</span>
              <span class="name">人员打卡率（%）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="detClick(2)">{{ generalData.rejectNum }}</a>
              <span class="name">点名失败人数（人）</span>
            </div>
          </div>
        </div>
        <div class="graph">
          <el-row :gutter="10">
            <el-col :span=perTrendSpan>
              <div
                class="graph-item"
                v-resize="perTrendRedraw"
                v-loading="perTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">点名人数趋势</p>
                  </div>
                  <el-select v-model="perTrendType" class="operate" style="width: 160px;" @change="perTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="perTrendOption" id="home_call_pertrend" :domWidth="perTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
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
                    <p class="txt">人员打卡率趋势</p>
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
            <el-col :span=12>
              <div
                class="graph-item"
                v-loading="sucRankingLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">人员点名成功天数排名</p>
                  </div>
                  <el-select v-model="sucRankingType" class="operate" style="width: 160px;" @change="sucRankingChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body ranking">
                  <div class="operate">
                    <el-button type="primary" class="btn" icon="el-icon-arrow-left" v-show="page > 1" @click="pageChange(-1)" circle></el-button>
                  </div>
                  <div class="list" :class="{front: page === 1}">
                    <div class="list-item" v-for="(item, index) in nowRankingData" :key="item.user_id">
                      <div class="serial"><span class="num">{{(page - 1) * limit + index + 1 }}</span></div>
                      <div class="strip">
                        <p class="name">{{ item.user_name }}</p>
                        <el-progress :stroke-width="10" :show-text="false" color="#13CE66" :percentage="item.rate"></el-progress>
                      </div>
                      <p class="explain">{{ item.size }}天</p>
                    </div>
                  </div>
                  <div class="operate">
                    <el-button type="primary" class="btn" icon="el-icon-arrow-right" @click="pageChange(1)" v-show="total > page * limit" circle></el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 点名详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentState="callnameState"
      :parentNum="generalType"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
// 引入chart
import Chart from '@/components/public/chart'
// 引入详情
import detModule from '@/components/profile/callname-det'

/*
* 参数说明：
*   switchType：用于控制模块切换
*     1：企业（黑卡，企业，分公司）
*     2：项目
*     3：部门
*   resData: 用于保存1天，7天，30天的数据
*   *State: 用于记录数据状态
* */
export default{
  name: 'homeCallname',
  data () {
    return {
      switchType: 2,
      modTitle: '',
      typeName: '项目：',
      sectorOptions: [],
      orgid: 0,
      orgType: 0,
      orgBase: 0,
      sectorName: '',
      pandectOptions: [
        {
          value: 1,
          label: '昨天'
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
        clockRate: '0%',
        rejectNum: 0
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
      perTrendLoading: false,
      perTrendType: 7,
      perTrendOption: {
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
      clockTrendLoading: false,
      clockTrendType: 7,
      clockTrendOption: {
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let tip = ''
            if (params != null && params.length > 0) {
              tip += params[0].name + '<br/>'
              for (let i = 0; i < params.length; i++) {
                tip += params[i].marker + params[i].seriesName + ': ' + params[i].value + '%<br />'
              }
            }
            return tip
          }
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
      sucRankingLoading: false,
      sucRankingData: [],
      sucRankingType: 7,
      nowRankingData: [],
      total: 0,
      limit: 5,
      page: 1,
      resData1: {
        generalData: {},
        perTrendData: {},
        clockTrendData: {},
        sucRankingData: []
      },
      generalState1: false,
      perTrendState1: false,
      clockTrendState1: false,
      sucRankingState1: false,
      resData2: {
        generalData: {},
        perTrendData: {},
        clockTrendData: {},
        sucRankingData: []
      },
      generalState2: false,
      perTrendState2: false,
      clockTrendState2: false,
      sucRankingState2: false,
      resData3: {
        generalData: {}
      },
      generalState3: false,
      perTrendSpan: 12,
      clockTrendSpan: 12,
      perTrendWidth: '',
      clockTrendWidth: '',
      loading: false,
      detDialog: false,
      callnameState: 0
    }
  },
  created () {

  },
  mounted () {
    const type = Number.parseInt(this.$route.query.type)
    const baseId = Number.parseInt(this.$route.query.baseId)
    this.orgBase = baseId
    this.switchType = type
    if (type === 2) {
      this.modTitle = '项目点名管理数据分析'
      this.typeName = '项目：'
      this.orgType = 3
      // 获取项目数据
      this.getProjectData(1)
      // 获取部门列表
      this.getSectorOptions()
    } else if (type === 3) {
      this.modTitle = '部门点名管理数据分析'
      this.typeName = '部门：'
      this.sectorName = this.$route.query.name
      this.orgType = 4
      // 获取部门数据
      this.getSectorData(1)
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
        url: this.reportApi() + '/proOperateRollCallSurvey',
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
    // 部门数据
    getSectorData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateRollCallSurvey',
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
      const generalArg = data.rcBaseMes
      const generalAllNum = generalArg.rollcallUserSize || 0
      const generalSucNum = generalArg.rollcallSucessUserSize || 0
      const generalRejNum = generalArg.rollcallFailedUserSize || 0
      let generalData = {
        allNum: generalAllNum,
        succeedNum: generalSucNum,
        clockRate: this.$common.countPercent(generalSucNum, generalAllNum),
        rejectNum: generalRejNum
      }
      this.generalData = generalData
      // 点名人数趋势
      const perTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
      let perTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const perTrendArg = data.rcUserSizeTrend || []
      perTrendArg.forEach((item, index) => {
        perTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        perTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: perTrendColors[index],
          data: itemData
        })
      })
      perTrendArg[0].data.forEach(inItem => {
        perTrendData.xAxisData.push(inItem.date)
      })
      this.perTrendOption.legend.data = perTrendData.legendData
      this.perTrendOption.xAxis.data = perTrendData.xAxisData
      this.perTrendOption.series = perTrendData.seriesData
      // 人员打卡率趋势
      const clockTrendColors = ['#62a8e8', '#44bd8a', '#fa6b67', '#d8d8d8']
      let clockTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const clockTrendArg = data.userRcRateTrend || []
      clockTrendArg.forEach((item, index) => {
        clockTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = this.switchInteger(inItem.size)
          // let itemValue = inItem.size || 0
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
      // 人员任务完成率排名
      const sucRankingData = data.userRcSucessDatesRanking || []
      this.sucRankingData = sucRankingData
      this.total = sucRankingData.length
      let nowRankingData = JSON.parse(JSON.stringify(sucRankingData)).slice(0, this.limit)
      nowRankingData.forEach(item => {
        item.rate = this.switchRatio(item.size)
      })
      this.nowRankingData = nowRankingData
      this.page = 1
      // 存储数据
      this.resData1 = {
        generalData: generalData,
        perTrendData: perTrendData,
        clockTrendData: clockTrendData,
        sucRankingData: sucRankingData
      }
      this.generalState1 = true
      this.perTrendSpan = 12
      this.perTrendState1 = true
      this.clockTrendSpan = 12
      this.clockTrendState1 = true
      this.sucRankingState1 = true
    },
    /* 切换部门 */
    sectorChange (val) {
      const orgNode = this.sectorOptions.find(item => {
        return item.id === val
      })
      // 初始化数据
      this.initData()
      this.orgType = orgNode.type
      this.orgBase = orgNode.baseId
      if (this.orgType === 3) {
        this.typeName = '项目：'
        this.getProjectData(1)
      } else if (this.orgType === 4) {
        this.typeName = '部门：'
        this.getSectorData(1)
      }
    },
    // 初始化数据
    initData () {
      this.generalState1 = false
      this.generalState2 = false
      this.generalState3 = false
      this.generalType = 1
      this.perTrendState1 = false
      this.perTrendState2 = false
      this.perTrendType = 7
      this.clockTrendState1 = false
      this.clockTrendState2 = false
      this.clockTrendType = 7
      this.sucRankingState1 = false
      this.sucRankingState2 = false
      this.sucRankingType = 7
    },
    /* 点名概况 */
    generalChange (val) {
      if (val === 1) {
        if (this.generalState1) {
          this.generalData = this.resData1.generalData
        } else {
          if (this.orgType === 3) {
            this.getGeneralProData(val)
          } else if (this.orgType === 4) {
            this.getGeneralSecData(val)
          }
        }
      } else if (val === 7) {
        if (this.generalState2) {
          this.generalData = this.resData2.generalData
        } else {
          if (this.orgType === 3) {
            this.getGeneralProData(val)
          } else if (this.orgType === 4) {
            this.getGeneralSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.generalState3) {
          this.generalData = this.resData3.generalData
        } else {
          if (this.orgType === 3) {
            this.getGeneralProData(val)
          } else if (this.orgType === 4) {
            this.getGeneralSecData(val)
          }
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
        url: this.reportApi() + '/proRollCallDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.rcBaseMes
          const generalAllNum = resData.rollcallUserSize || 0
          const generalSucNum = resData.rollcallSucessUserSize || 0
          const generalRejNum = resData.rollcallFailedUserSize || 0
          let generalData = {
            allNum: generalAllNum,
            succeedNum: generalSucNum,
            clockRate: this.$common.countPercent(generalSucNum, generalAllNum),
            rejectNum: generalRejNum
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
    getGeneralSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.generalLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzRollCallDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.rcBaseMes
          const generalAllNum = resData.rollcallUserSize || 0
          const generalSucNum = resData.rollcallSucessUserSize || 0
          const generalRejNum = resData.rollcallFailedUserSize || 0
          let generalData = {
            allNum: generalAllNum,
            succeedNum: generalSucNum,
            clockRate: this.$common.countPercent(generalSucNum, generalAllNum),
            rejectNum: generalRejNum
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
    /* 点名人数趋势 */
    perTrendChange (val) {
      if (val === 7) {
        if (this.perTrendState1) {
          this.perTrendSpan = 12
          this.perTrendOption.legend.data = this.resData1.perTrendData.legendData
          this.perTrendOption.xAxis.data = this.resData1.perTrendData.xAxisData
          this.perTrendOption.series = this.resData1.perTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getPerTrendProData(val)
          } else if (this.orgType === 4) {
            this.getPerTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.perTrendState2) {
          this.perTrendSpan = 24
          this.perTrendOption.legend.data = this.resData2.perTrendData.legendData
          this.perTrendOption.xAxis.data = this.resData2.perTrendData.xAxisData
          this.perTrendOption.series = this.resData2.perTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getPerTrendProData(val)
          } else if (this.orgType === 4) {
            this.getPerTrendSecData(val)
          }
        }
      }
    },
    getPerTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.perTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proRollCallDetailsUserSizeMes',
        data: params
      }).then((res) => {
        this.perTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.rcUserSizeTrend || []
          const perTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
          let perTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            perTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            perTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: perTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            perTrendData.xAxisData.push(inItem.date)
          })
          this.perTrendOption.legend.data = perTrendData.legendData
          this.perTrendOption.xAxis.data = perTrendData.xAxisData
          this.perTrendOption.series = perTrendData.seriesData
          if (n === 7) {
            this.perTrendSpan = 12
            this.perTrendState1 = true
            this.resData1.perTrendData = perTrendData
          } else if (n === 30) {
            this.perTrendSpan = 24
            this.perTrendState2 = true
            this.resData2.perTrendData = perTrendData
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
        this.perTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getPerTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.perTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzRollCallDetailsUserSizeMes',
        data: params
      }).then((res) => {
        this.perTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.rcUserSizeTrend || []
          const perTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
          let perTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            perTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            perTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: perTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            perTrendData.xAxisData.push(inItem.date)
          })
          this.perTrendOption.legend.data = perTrendData.legendData
          this.perTrendOption.xAxis.data = perTrendData.xAxisData
          this.perTrendOption.series = perTrendData.seriesData
          if (n === 7) {
            this.perTrendSpan = 12
            this.perTrendState1 = true
            this.resData1.perTrendData = perTrendData
          } else if (n === 30) {
            this.perTrendSpan = 24
            this.perTrendState2 = true
            this.resData2.perTrendData = perTrendData
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
        this.perTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    perTrendRedraw (val) {
      this.perTrendWidth = val.width
    },
    /* 人员打卡率趋势 */
    clockTrendChange (val) {
      if (val === 7) {
        if (this.clockTrendState1) {
          this.clockTrendSpan = 12
          this.clockTrendOption.legend.data = this.resData1.clockTrendData.legendData
          this.clockTrendOption.xAxis.data = this.resData1.clockTrendData.xAxisData
          this.clockTrendOption.series = this.resData1.clockTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getClockTrendProData(val)
          } else if (this.orgType === 4) {
            this.getClockTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.clockTrendState2) {
          this.clockTrendSpan = 24
          this.clockTrendOption.legend.data = this.resData2.clockTrendData.legendData
          this.clockTrendOption.xAxis.data = this.resData2.clockTrendData.xAxisData
          this.clockTrendOption.series = this.resData2.clockTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getClockTrendProData(val)
          } else if (this.orgType === 4) {
            this.getClockTrendSecData(val)
          }
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
        url: this.reportApi() + '/proRollCallDetailsUserRecordRateMes',
        data: params
      }).then((res) => {
        this.clockTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userRcRateTrend || []
          const clockTrendColors = ['#62a8e8', '#44bd8a', '#fa6b67', '#d8d8d8']
          let clockTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            clockTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
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
    getClockTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.clockTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzRollCallDetailsUserRecordRateMes',
        data: params
      }).then((res) => {
        this.clockTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userRcRateTrend || []
          const clockTrendColors = ['#62a8e8', '#44bd8a', '#fa6b67', '#d8d8d8']
          let clockTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            clockTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
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
    /* 人员点名成功天数排名 */
    sucRankingChange (val) {
      if (val === 7) {
        if (this.sucRankingState1) {
          const sucRankingData = this.resData1.sucRankingData
          this.sucRankingData = sucRankingData
          this.total = sucRankingData.length
          let nowRankingData = JSON.parse(JSON.stringify(sucRankingData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.rate = this.switchRatio(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
        } else {
          if (this.orgType === 3) {
            this.getSucRankingProData(val)
          } else if (this.orgType === 4) {
            this.getSucRankingSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.sucRankingState2) {
          const sucRankingData = this.resData2.sucRankingData
          this.sucRankingData = sucRankingData
          this.total = sucRankingData.length
          let nowRankingData = JSON.parse(JSON.stringify(sucRankingData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.rate = this.switchRatio(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
        } else {
          if (this.orgType === 3) {
            this.getSucRankingProData(val)
          } else if (this.orgType === 4) {
            this.getSucRankingSecData(val)
          }
        }
      }
    },
    getSucRankingProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.sucRankingLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proRollCallDetailsSucessDatesMes',
        data: params
      }).then((res) => {
        this.sucRankingLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userRcSucessDatesRanking || []
          this.sucRankingData = resData
          this.total = resData.length
          let nowRankingData = JSON.parse(JSON.stringify(resData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.rate = this.switchRatio(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
          if (n === 7) {
            this.sucRankingState1 = true
            this.resData1.sucRankingData = resData
          } else if (n === 30) {
            this.sucRankingState2 = true
            this.resData2.sucRankingData = resData
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
        this.sucRankingLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getSucRankingSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.sucRankingLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzRollCallDetailsSucessDatesMes',
        data: params
      }).then((res) => {
        this.sucRankingLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userRcSucessDatesRanking || []
          this.sucRankingData = resData
          this.total = resData.length
          let nowRankingData = JSON.parse(JSON.stringify(resData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.rate = this.switchRatio(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
          if (n === 7) {
            this.sucRankingState1 = true
            this.resData1.sucRankingData = resData
          } else if (n === 30) {
            this.sucRankingState2 = true
            this.resData2.sucRankingData = resData
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
        this.sucRankingLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 分页
    pageChange (n) {
      let nowPage = this.page + n
      if (nowPage < 1) return
      if (nowPage * this.limit >= this.total + this.limit) return
      const sucRankingData = JSON.parse(JSON.stringify(this.sucRankingData))
      let nowRankingData = sucRankingData.slice((nowPage - 1) * this.limit, nowPage * this.limit)
      nowRankingData.forEach(item => {
        item.rate = this.switchRatio(item.size)
      })
      this.nowRankingData = nowRankingData
      this.page = nowPage
    },
    // 转换整数
    switchInteger (n) {
      const value = Number.parseFloat(n) || 0
      return Math.round(value * 100)
    },
    // 转换比例
    switchRatio (n) {
      const divisor = this.sucRankingType
      const value = Number.parseFloat(n) || 0
      return Math.round((value / divisor) * 100)
    },
    /* 详情 */
    detClick (state) {
      this.callnameState = state
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 获取部门列表 */
    getSectorOptions () {
      let params = {
        organize_id: this.$route.query.id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const proData = res.data.data1[0]
          let sectorOptions = []
          sectorOptions.push({
            id: proData.id,
            name: proData.name,
            type: proData.organize_type,
            baseId: proData.base_id
          })
          proData.children.forEach(item => {
            sectorOptions.push({
              id: item.id,
              name: item.name,
              type: item.organize_type,
              baseId: item.base_id
            })
          })
          this.sectorOptions = sectorOptions
          this.orgid = proData.id
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
  .home-callname{
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
            .ranking{
              display: flex;
              .operate{
                width: 60px;
                display: flex;
                justify-content: center;
                align-items: center;
                .btn{
                  opacity: 0.3;
                }
                .btn:hover{
                  opacity: 1;
                }
              }
              .list{
                flex-grow: 1;
                .list-item{
                  height: 50px;
                  display: flex;
                  align-items: center;
                  .serial{
                    width: 60px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .num{
                      font-size: 14px;
                      font-weight: 500;
                      color: #272727;
                    }
                  }
                  .strip{
                    flex-grow: 1;
                  }
                  .explain{
                    width: 60px;
                    display: flex;
                    padding-left: 15px;
                    align-items: center;
                    font-size: 14px;
                    color: #272727;
                  }
                }
                &.front{
                  .list-item:nth-of-type(1), .list-item:nth-of-type(2), .list-item:nth-of-type(3){
                    .serial{
                      .num{
                        width: 20px;
                        height: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: #f04645;
                        color: #ffffff;
                        border-radius: 50%;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>
