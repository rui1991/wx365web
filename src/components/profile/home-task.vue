<template>
  <div
    class="home-task"
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
              <span class="txt">巡检巡查任务概况</span>
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
              <span class="name">巡检任务数量（条）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="taskStateClick(1)">{{ generalData.fulfillNum }}</a>
              <span class="name">任务完成数量（条）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.fulfillRate }}</span>
              <span class="name">任务完成率（%）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="taskStateClick(2)">{{ generalData.undoneNum }}</a>
              <span class="name">任务未完成数量（条）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.undoneRate }}</span>
              <span class="name">任务未完成率（%）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="taskStateClick(3)">{{ generalData.abnormalNum }}</a>
              <span class="name">任务异常数量（条）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.timelyRate }}</span>
              <span class="name">任务完成及时率（%）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.overtimeRate }}</span>
              <span class="name">任务完成超时率（%）</span>
            </div>
          </div>
        </div>
        <div class="graph">
          <el-row :gutter="10">
            <el-col :span=fulRatioSpan>
              <div
                class="graph-item"
                v-resize="fulRatioRedraw"
                v-loading="fulRatioLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">任务完成数量比</p>
                  </div>
                  <el-select v-model="fulRatioType" class="operate" style="width: 160px;" @change="fulRatioChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="fulRatioOption" id="home_task_fulratio" :domWidth="fulRatioWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=fulTrendSpan>
              <div
                class="graph-item"
                v-resize="fulTrendRedraw"
                v-loading="fulTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">任务完成、未完成率趋势</p>
                  </div>
                  <el-select v-model="fulTrendType" class="operate" style="width: 160px;" @change="fulTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="fulTrendOption" id="home_task_fultrend" :domWidth="fulTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=timeRatioSpan>
              <div
                class="graph-item"
                v-resize="timeRatioRedraw"
                v-loading="timeRatioLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">任务及时数量比</p>
                  </div>
                  <el-select v-model="timeRatioType" class="operate" style="width: 160px;" @change="timeRatioChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="timeRatioOption" id="home_task_timeratio" :domWidth="timeRatioWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=timeTrendSpan>
              <div
                class="graph-item"
                v-resize="timeTrendRedraw"
                v-loading="timeTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">任务完成及时率趋势</p>
                  </div>
                  <el-select v-model="timeTrendType" class="operate" style="width: 160px;" @change="timeTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="timeTrendOption" id="home_task_timetrend" :domWidth="timeTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=12>
              <div
                class="graph-item"
                v-loading="fulRankingLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">人员任务完成率排名</p>
                  </div>
                  <el-select v-model="fulRankingType" class="operate" style="width: 160px;" @change="fulRankingChange">
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
                        <el-progress :stroke-width="10" color="#13CE66" :percentage="item.size"></el-progress>
                      </div>
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
    <!-- 任务详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentState="taskState"
      :parentNum="generalType"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
// 引入chart
import Chart from '@/components/public/chart'
// 引入详情
import detModule from '@/components/profile/task-det'

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
  name: 'homeTask',
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
        fulfillNum: 0,
        fulfillRate: '0%',
        undoneNum: 0,
        undoneRate: '0%',
        abnormalNum: 0,
        timelyRate: '0%',
        overtimeRate: '0%'
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
      fulRatioLoading: false,
      fulRatioType: 7,
      fulRatioOption: {
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['product']
          ]
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
          axisLabel: {
            interval: 0,
            rotate: 40
          }
        },
        yAxis: {},
        series: [
          {
            type: 'bar',
            barWidth: 20,
            color: '#44bd8a',
            barGap: '0%'
          },
          {
            type: 'bar',
            barWidth: 20,
            color: '#d8d8d8',
            barGap: '0%'
          }
        ]
      },
      fulTrendLoading: false,
      fulTrendType: 7,
      fulTrendOption: {
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
      timeRatioLoading: false,
      timeRatioType: 7,
      timeRatioOption: {
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['product']
          ]
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
          axisLabel: {
            interval: 0,
            rotate: 40
          }
        },
        yAxis: {},
        series: [
          {
            type: 'bar',
            barWidth: 20,
            color: '#44bd8a',
            barGap: '0%'
          },
          {
            type: 'bar',
            barWidth: 20,
            color: '#fa6b67',
            barGap: '0%'
          }
        ]
      },
      timeTrendLoading: false,
      timeTrendType: 7,
      timeTrendOption: {
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
      fulRankingLoading: false,
      fulRankingType: 7,
      fulRankingData: [],
      nowRankingData: [],
      total: 0,
      limit: 5,
      page: 1,
      resData1: {
        generalData: {},
        fulRatioData: [],
        rulTrendData: {},
        timeRatioData: [],
        timeTrendData: {},
        fulRankingData: []
      },
      generalState1: false,
      fulRatioState1: false,
      fulTrendState1: false,
      timeRatioState1: false,
      timeTrendState1: false,
      fulRankingState1: false,
      resData2: {
        generalData: {},
        fulRatioData: [],
        rulTrendData: {},
        timeRatioData: [],
        timeTrendData: {},
        fulRankingData: []
      },
      generalState2: false,
      fulRatioState2: false,
      fulTrendState2: false,
      timeRatioState2: false,
      timeTrendState2: false,
      fulRankingState2: false,
      resData3: {
        generalData: {}
      },
      generalState3: false,
      fulRatioSpan: 12,
      fulTrendSpan: 12,
      timeRatioSpan: 12,
      timeTrendSpan: 12,
      fulRatioWidth: '',
      fulTrendWidth: '',
      timeRatioWidth: '',
      timeTrendWidth: '',
      loading: false,
      detDialog: false,
      taskState: 0
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
      this.modTitle = '项目巡检巡查任务数据分析'
      this.typeName = '项目：'
      this.orgType = 3
      // 获取项目数据
      this.getProjectData(1)
      // 获取部门列表
      this.getSectorOptions()
    } else if (type === 3) {
      this.modTitle = '部门巡检巡查任务数据分析'
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
        url: this.reportApi() + '/proOperateInsDetails',
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
        url: this.reportApi() + '/ogzOperateInsDetails',
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
      // 巡检巡查任务概况
      const generalArg = data.insBaseMes
      let generalData = {
        allNum: generalArg.insDutySize || 0,
        fulfillNum: generalArg.insContinueSize || 0,
        fulfillRate: this.$common.countPercent(generalArg.insContinueSize, generalArg.insDutySize),
        undoneNum: generalArg.insNotContinueSize || 0,
        undoneRate: this.$common.countPercent(generalArg.insNotContinueSize, generalArg.insDutySize),
        abnormalNum: generalArg.insAbnormalSize || 0,
        timelyRate: this.$common.retainPercent(generalArg.insContinueOntimeRate),
        overtimeRate: this.$common.retainPercent(generalArg.intContinueOuttimeRate)
      }
      this.generalData = generalData
      // 任务完成数量比
      const fulRatioArg = data.insContinueSizeCompare || []
      const fulRatioGroup = ['product', fulRatioArg[0].lable, fulRatioArg[1].lable]
      let fulRatioData = []
      fulRatioData.push(fulRatioGroup)
      const fulRatioAry1 = fulRatioArg[0].data
      const fulRatioAry2 = fulRatioArg[1].data
      fulRatioAry1.forEach((item, index) => {
        let ary = []
        ary.push(item.date)
        let num1 = item.size || 0
        ary.push(num1)
        let num2 = fulRatioAry2[index].size || 0
        ary.push(num2)
        fulRatioData.push(ary)
      })
      this.fulRatioOption.dataset.source = fulRatioData
      // 任务完成、未完成率趋势
      const fulTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
      let fulTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const fulTrendArg = data.insNotContinueTrend || []
      fulTrendArg.forEach((item, index) => {
        fulTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = this.switchInteger(inItem.size)
          // let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        fulTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: fulTrendColors[index],
          data: itemData
        })
      })
      fulTrendArg[0].data.forEach(inItem => {
        fulTrendData.xAxisData.push(inItem.date)
      })
      this.fulTrendOption.legend.data = fulTrendData.legendData
      this.fulTrendOption.xAxis.data = fulTrendData.xAxisData
      this.fulTrendOption.series = fulTrendData.seriesData
      // 任务及时数量比
      const timeRatioArg = data.insOntimeSizeCompare || []
      const timeRatioGroup = ['product', timeRatioArg[0].lable, timeRatioArg[1].lable]
      let timeRatioData = []
      timeRatioData.push(timeRatioGroup)
      const timeRatioAry1 = timeRatioArg[0].data
      const timeRatioAry2 = timeRatioArg[1].data
      timeRatioAry1.forEach((item, index) => {
        let ary = []
        ary.push(item.date)
        let num1 = item.size || 0
        ary.push(num1)
        let num2 = timeRatioAry2[index].size || 0
        ary.push(num2)
        timeRatioData.push(ary)
      })
      this.timeRatioOption.dataset.source = timeRatioData
      // 任务完成及时率趋势
      const timeTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
      let timeTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const timeTrendArg = data.insContinueRateTrend || []
      timeTrendArg.forEach((item, index) => {
        timeTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = this.switchInteger(inItem.size)
          // let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        timeTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: timeTrendColors[index],
          data: itemData
        })
      })
      timeTrendArg[0].data.forEach(inItem => {
        timeTrendData.xAxisData.push(inItem.date)
      })
      this.timeTrendOption.legend.data = timeTrendData.legendData
      this.timeTrendOption.xAxis.data = timeTrendData.xAxisData
      this.timeTrendOption.series = timeTrendData.seriesData
      // 人员任务完成率排名
      const fulRankingData = data.userInsContinueRateRanking || []
      this.fulRankingData = fulRankingData
      this.total = fulRankingData.length
      let nowRankingData = JSON.parse(JSON.stringify(fulRankingData)).slice(0, this.limit)
      nowRankingData.forEach(item => {
        item.size = this.switchInteger(item.size)
      })
      this.nowRankingData = nowRankingData
      this.page = 1
      // 存储数据
      this.resData1 = {
        generalData: generalData,
        fulRatioData: fulRatioData,
        fulTrendData: fulTrendData,
        timeRatioData: timeRatioData,
        timeTrendData: timeTrendData,
        fulRankingData: fulRankingData
      }
      this.generalState1 = true
      this.fulRatioSpan = 12
      this.fulRatioState1 = true
      this.fulTrendSpan = 12
      this.fulTrendState1 = true
      this.timeRatioSpan = 12
      this.timeRatioState1 = true
      this.timeTrendSpan = 12
      this.timeTrendState1 = true
      this.fulRankingState1 = true
    },
    /* 切换部门 */
    sectorChange (val) {
      const orgNode = this.sectorOptions.find(item => {
        return item.id === val
      })
      this.orgType = orgNode.type
      this.orgBase = orgNode.baseId
      if (this.orgType === 3) {
        this.typeName = '项目：'
      } else if (this.orgType === 4) {
        this.typeName = '部门：'
      }
      // 初始化数据
      this.initData()
      // 重新请求数据
      if (this.orgType === 3) {
        this.getProjectData(1)
      } else if (this.orgType === 4) {
        this.getSectorData(1)
      }
    },
    // 初始化数据
    initData () {
      this.generalState1 = false
      this.generalState2 = false
      this.generalState3 = false
      this.generalType = 1
      this.fulRatioState1 = false
      this.fulRatioState2 = false
      this.fulRatioType = 7
      this.fulTrendState1 = false
      this.fulTrendState2 = false
      this.fulTrendType = 7
      this.timeRatioState1 = false
      this.timeRatioState2 = false
      this.timeRatioType = 7
      this.timeTrendState1 = false
      this.timeTrendState2 = false
      this.timeTrendType = 7
      this.fulRankingState1 = false
      this.fulRankingState2 = false
      this.fulRankingType = 7
    },
    /* 巡检巡查任务概况 */
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
        url: this.reportApi() + '/proInsDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insBaseMes
          let generalData = {
            allNum: resData.insDutySize || 0,
            fulfillNum: resData.insContinueSize || 0,
            fulfillRate: this.$common.countPercent(resData.insContinueSize, resData.insDutySize),
            undoneNum: resData.insNotContinueSize || 0,
            undoneRate: this.$common.countPercent(resData.insNotContinueSize, resData.insDutySize),
            abnormalNum: resData.insAbnormalSize || 0,
            timelyRate: this.$common.retainPercent(resData.insContinueOntimeRate),
            overtimeRate: this.$common.retainPercent(resData.intContinueOuttimeRate)
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
        url: this.reportApi() + '/ogzInsDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insBaseMes
          let generalData = {
            allNum: resData.insDutySize || 0,
            fulfillNum: resData.insContinueSize || 0,
            fulfillRate: this.$common.countPercent(resData.insContinueSize, resData.insDutySize),
            undoneNum: resData.insNotContinueSize || 0,
            undoneRate: this.$common.countPercent(resData.insNotContinueSize, resData.insDutySize),
            abnormalNum: resData.insAbnormalSize || 0,
            timelyRate: this.$common.retainPercent(resData.insContinueOntimeRate),
            overtimeRate: this.$common.retainPercent(resData.intContinueOuttimeRate)
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
    /* 任务完成数量比 */
    fulRatioChange (val) {
      if (val === 7) {
        if (this.fulRatioState1) {
          this.fulRatioSpan = 12
          this.fulRatioOption.dataset.source = this.resData1.fulRatioData
        } else {
          if (this.orgType === 3) {
            this.getFulRatioProData(val)
          } else if (this.orgType === 4) {
            this.getFulRatioSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.fulRatioState2) {
          this.fulRatioSpan = 24
          this.fulRatioOption.dataset.source = this.resData2.fulRatioData
        } else {
          if (this.orgType === 3) {
            this.getFulRatioProData(val)
          } else if (this.orgType === 4) {
            this.getFulRatioSecData(val)
          }
        }
      }
    },
    getFulRatioProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulRatioLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proInsDetailsContinueSizeMes',
        data: params
      }).then((res) => {
        this.fulRatioLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insContinueSizeCompare || []
          const fulRatioGroup = ['product', resData[0].lable, resData[1].lable]
          let fulRatioData = []
          fulRatioData.push(fulRatioGroup)
          const fulRatioAry1 = resData[0].data
          const fulRatioAry2 = resData[1].data
          fulRatioAry1.forEach((item, index) => {
            let ary = []
            ary.push(item.date)
            let num1 = item.size || 0
            ary.push(num1)
            let num2 = fulRatioAry2[index].size || 0
            ary.push(num2)
            fulRatioData.push(ary)
          })
          this.fulRatioOption.dataset.source = fulRatioData
          if (n === 7) {
            this.fulRatioSpan = 12
            this.fulRatioState1 = true
            this.resData1.fulRatioData = fulRatioData
          } else if (n === 30) {
            this.fulRatioSpan = 24
            this.fulRatioState2 = true
            this.resData2.fulRatioData = fulRatioData
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
        this.fulRatioLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getFulRatioSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulRatioLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzInsDetailsContinueSizeMes',
        data: params
      }).then((res) => {
        this.fulRatioLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insContinueSizeCompare || []
          const fulRatioGroup = ['product', resData[0].lable, resData[1].lable]
          let fulRatioData = []
          fulRatioData.push(fulRatioGroup)
          const fulRatioAry1 = resData[0].data
          const fulRatioAry2 = resData[1].data
          fulRatioAry1.forEach((item, index) => {
            let ary = []
            ary.push(item.date)
            let num1 = item.size || 0
            ary.push(num1)
            let num2 = fulRatioAry2[index].size || 0
            ary.push(num2)
            fulRatioData.push(ary)
          })
          this.fulRatioOption.dataset.source = fulRatioData
          if (n === 7) {
            this.fulRatioSpan = 12
            this.fulRatioState1 = true
            this.resData1.fulRatioData = fulRatioData
          } else if (n === 30) {
            this.fulRatioSpan = 24
            this.fulRatioState2 = true
            this.resData2.fulRatioData = fulRatioData
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
        this.fulRatioLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    fulRatioRedraw (val) {
      this.fulRatioWidth = val.width
    },
    /* 任务完成、未完成率趋势 */
    fulTrendChange (val) {
      if (val === 7) {
        if (this.fulTrendState1) {
          this.fulTrendSpan = 12
          this.fulTrendOption.legend.data = this.resData1.fulTrendData.legendData
          this.fulTrendOption.xAxis.data = this.resData1.fulTrendData.xAxisData
          this.fulTrendOption.series = this.resData1.fulTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getFulTrendProData(val)
          } else if (this.orgType === 4) {
            this.getFulTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.fulTrendState2) {
          this.fulTrendSpan = 24
          this.fulTrendOption.legend.data = this.resData2.fulTrendData.legendData
          this.fulTrendOption.xAxis.data = this.resData2.fulTrendData.xAxisData
          this.fulTrendOption.series = this.resData2.fulTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getFulTrendProData(val)
          } else if (this.orgType === 4) {
            this.getFulTrendSecData(val)
          }
        }
      }
    },
    getFulTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proInsDetailsContinueNotContinueRateMes',
        data: params
      }).then((res) => {
        this.fulTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insNotContinueTrend || []
          const fulTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
          let fulTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            fulTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            fulTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: fulTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            fulTrendData.xAxisData.push(inItem.date)
          })
          this.fulTrendOption.legend.data = fulTrendData.legendData
          this.fulTrendOption.xAxis.data = fulTrendData.xAxisData
          this.fulTrendOption.series = fulTrendData.seriesData
          if (n === 7) {
            this.fulTrendSpan = 12
            this.fulTrendState1 = true
            this.resData1.fulTrendData = fulTrendData
          } else if (n === 30) {
            this.fulTrendSpan = 24
            this.fulTrendState2 = true
            this.resData2.fulTrendData = fulTrendData
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
        this.fulTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getFulTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzInsDetailsContinueNotContinueRateMes',
        data: params
      }).then((res) => {
        this.fulTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insNotContinueTrend || []
          const fulTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
          let fulTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            fulTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            fulTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: fulTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            fulTrendData.xAxisData.push(inItem.date)
          })
          this.fulTrendOption.legend.data = fulTrendData.legendData
          this.fulTrendOption.xAxis.data = fulTrendData.xAxisData
          this.fulTrendOption.series = fulTrendData.seriesData
          if (n === 7) {
            this.fulTrendSpan = 12
            this.fulTrendState1 = true
            this.resData1.fulTrendData = fulTrendData
          } else if (n === 30) {
            this.fulTrendSpan = 24
            this.fulTrendState2 = true
            this.resData2.fulTrendData = fulTrendData
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
        this.fulTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    fulTrendRedraw (val) {
      this.fulTrendWidth = val.width
    },
    /* 任务及时数量比 */
    timeRatioChange (val) {
      if (val === 7) {
        if (this.timeRatioState1) {
          this.timeRatioSpan = 12
          this.timeRatioOption.dataset.source = this.resData1.timeRatioData
        } else {
          if (this.orgType === 3) {
            this.getTimeRatioProData(val)
          } else if (this.orgType === 4) {
            this.getTimeRatioSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.timeRatioState2) {
          this.timeRatioSpan = 24
          this.timeRatioOption.dataset.source = this.resData2.timeRatioData
        } else {
          if (this.orgType === 3) {
            this.getTimeRatioProData(val)
          } else if (this.orgType === 4) {
            this.getTimeRatioSecData(val)
          }
        }
      }
    },
    getTimeRatioProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.timeRatioLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proInsDetailsOntimeSizeMes',
        data: params
      }).then((res) => {
        this.timeRatioLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insOntimeSizeCompare || []
          const timeRatioGroup = ['product', resData[0].lable, resData[1].lable]
          let timeRatioData = []
          timeRatioData.push(timeRatioGroup)
          const timeRatioAry1 = resData[0].data
          const timeRatioAry2 = resData[1].data
          timeRatioAry1.forEach((item, index) => {
            let ary = []
            ary.push(item.date)
            let num1 = item.size || 0
            ary.push(num1)
            let num2 = timeRatioAry2[index].size || 0
            ary.push(num2)
            timeRatioData.push(ary)
          })
          this.timeRatioOption.dataset.source = timeRatioData
          if (n === 7) {
            this.timeRatioSpan = 12
            this.timeRatioState1 = true
            this.resData1.timeRatioData = timeRatioData
          } else if (n === 30) {
            this.timeRatioSpan = 24
            this.timeRatioState2 = true
            this.resData2.timeRatioData = timeRatioData
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
        this.timeRatioLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getTimeRatioSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.timeRatioLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzInsDetailsOntimeSizeMes',
        data: params
      }).then((res) => {
        this.timeRatioLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insOntimeSizeCompare || []
          const timeRatioGroup = ['product', resData[0].lable, resData[1].lable]
          let timeRatioData = []
          timeRatioData.push(timeRatioGroup)
          const timeRatioAry1 = resData[0].data
          const timeRatioAry2 = resData[1].data
          timeRatioAry1.forEach((item, index) => {
            let ary = []
            ary.push(item.date)
            let num1 = item.size || 0
            ary.push(num1)
            let num2 = timeRatioAry2[index].size || 0
            ary.push(num2)
            timeRatioData.push(ary)
          })
          this.timeRatioOption.dataset.source = timeRatioData
          if (n === 7) {
            this.timeRatioSpan = 12
            this.timeRatioState1 = true
            this.resData1.timeRatioData = timeRatioData
          } else if (n === 30) {
            this.timeRatioSpan = 24
            this.timeRatioState2 = true
            this.resData2.timeRatioData = timeRatioData
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
        this.timeRatioLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    timeRatioRedraw (val) {
      this.timeRatioWidth = val.width
    },
    /* 任务完成及时率趋势 */
    timeTrendChange (val) {
      if (val === 7) {
        if (this.timeTrendState1) {
          this.timeTrendSpan = 12
          this.timeTrendOption.legend.data = this.resData1.timeTrendData.legendData
          this.timeTrendOption.xAxis.data = this.resData1.timeTrendData.xAxisData
          this.timeTrendOption.series = this.resData1.timeTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getTimeTrendProData(val)
          } else if (this.orgType === 4) {
            this.getTimeTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.timeTrendState2) {
          this.timeTrendSpan = 24
          this.timeTrendOption.legend.data = this.resData2.timeTrendData.legendData
          this.timeTrendOption.xAxis.data = this.resData2.timeTrendData.xAxisData
          this.timeTrendOption.series = this.resData2.timeTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getTimeTrendProData(val)
          } else if (this.orgType === 4) {
            this.getTimeTrendSecData(val)
          }
        }
      }
    },
    getTimeTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.timeTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proInsDetailsContinueOntimeRateMes',
        data: params
      }).then((res) => {
        this.timeTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insContinueRateTrend || []
          const timeTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
          let timeTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            timeTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            timeTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: timeTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            timeTrendData.xAxisData.push(inItem.date)
          })
          this.timeTrendOption.legend.data = timeTrendData.legendData
          this.timeTrendOption.xAxis.data = timeTrendData.xAxisData
          this.timeTrendOption.series = timeTrendData.seriesData
          if (n === 7) {
            this.timeTrendSpan = 12
            this.timeTrendState1 = true
            this.resData1.timeTrendData = timeTrendData
          } else if (n === 30) {
            this.timeTrendSpan = 24
            this.timeTrendState2 = true
            this.resData2.timeTrendData = timeTrendData
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
        this.timeTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getTimeTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.timeTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzInsDetailsContinueOntimeRateMes',
        data: params
      }).then((res) => {
        this.timeTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.insContinueRateTrend || []
          const timeTrendColors = ['#44bd8a', '#fa6b67', '#d8d8d8', '#62a8e8']
          let timeTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            timeTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            timeTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: timeTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            timeTrendData.xAxisData.push(inItem.date)
          })
          this.timeTrendOption.legend.data = timeTrendData.legendData
          this.timeTrendOption.xAxis.data = timeTrendData.xAxisData
          this.timeTrendOption.series = timeTrendData.seriesData
          if (n === 7) {
            this.timeTrendSpan = 12
            this.timeTrendState1 = true
            this.resData1.timeTrendData = timeTrendData
          } else if (n === 30) {
            this.timeTrendSpan = 24
            this.timeTrendState2 = true
            this.resData2.timeTrendData = timeTrendData
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
        this.timeTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    timeTrendRedraw (val) {
      this.timeTrendWidth = val.width
    },
    /* 人员任务完成率排名 */
    fulRankingChange (val) {
      if (val === 7) {
        if (this.fulRankingState1) {
          const fulRankingData = this.resData1.fulRankingData
          this.fulRankingData = fulRankingData
          this.total = fulRankingData.length
          let nowRankingData = JSON.parse(JSON.stringify(fulRankingData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.size = this.switchInteger(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
        } else {
          if (this.orgType === 3) {
            this.getFulRankingProData(val)
          } else if (this.orgType === 4) {
            this.getFulRankingSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.fulRankingState2) {
          const fulRankingData = this.resData2.fulRankingData
          this.fulRankingData = fulRankingData
          this.total = fulRankingData.length
          let nowRankingData = JSON.parse(JSON.stringify(fulRankingData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.size = this.switchInteger(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
        } else {
          if (this.orgType === 3) {
            this.getFulRankingProData(val)
          } else if (this.orgType === 4) {
            this.getFulRankingSecData(val)
          }
        }
      }
    },
    getFulRankingProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulRankingLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proInsDetailsUserContinueRateMes',
        data: params
      }).then((res) => {
        this.fulRankingLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userInsContinueRateRanking || []
          this.fulRankingData = resData
          this.total = resData.length
          let nowRankingData = JSON.parse(JSON.stringify(resData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.size = this.switchInteger(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
          if (n === 7) {
            this.fulRankingState1 = true
            this.resData1.fulRankingData = resData
          } else if (n === 30) {
            this.fulRankingState2 = true
            this.resData2.fulRankingData = resData
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
        this.fulRankingLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getFulRankingSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.fulRankingLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzInsDetailsUserContinueRateMes',
        data: params
      }).then((res) => {
        this.fulRankingLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.userInsContinueRateRanking || []
          this.fulRankingData = resData
          this.total = resData.length
          let nowRankingData = JSON.parse(JSON.stringify(resData)).slice(0, this.limit)
          nowRankingData.forEach(item => {
            item.size = this.switchInteger(item.size)
          })
          this.nowRankingData = nowRankingData
          this.page = 1
          if (n === 7) {
            this.fulRankingState1 = true
            this.resData1.fulRankingData = resData
          } else if (n === 30) {
            this.fulRankingState2 = true
            this.resData2.fulRankingData = resData
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
        this.fulRankingLoading = false
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
      const fulRankingData = JSON.parse(JSON.stringify(this.fulRankingData))
      let nowRankingData = fulRankingData.slice((nowPage - 1) * this.limit, nowPage * this.limit)
      nowRankingData.forEach(item => {
        item.size = this.switchInteger(item.size)
      })
      this.nowRankingData = nowRankingData
      this.page = nowPage
    },
    // 转换整数
    switchInteger (n) {
      const value = Number.parseFloat(n) || 0
      return Math.round(value * 100)
    },
    /* 详情 */
    taskStateClick (state) {
      this.taskState = state
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
  .home-task{
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
