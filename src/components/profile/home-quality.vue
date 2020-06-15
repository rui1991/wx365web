<template>
  <div
    class="home-quality"
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
              <span class="txt">人员品质监控概况</span>
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
              <span class="price">{{ generalData.clockNum }}</span>
              <span class="name">已打卡人数（人）</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="personClick">{{ generalData.noclockNum }}</a>
              <span class="name">未打卡人数（人）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.patrolNum }}</span>
              <span class="name">已巡查位置数（个）</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <a href="javascript:void(0);" class="price vital" @click="positionClick">{{ generalData.nopatrolNum }}</a>
              <span class="name">未巡查位置数（个）</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <span class="price">{{ generalData.patrolRate }}</span>
              <span class="name">位置巡查率（%）</span>
            </div>
            <div class="pandect-item">
              <span class="price">{{ generalData.dataUpNum }}</span>
              <span class="name">打卡上传数量（条）</span>
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
                    <p class="txt">打卡人数趋势</p>
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
                  <Chart :parOption="perTrendOption" id="home_qua_pertrend" :domWidth="perTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=upTrendSpan>
              <div
                class="graph-item"
                v-resize="upTrendRedraw"
                v-loading="upTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">打卡上传数量趋势</p>
                  </div>
                  <el-select v-model="upTrendType" class="operate" style="width: 160px;" @change="upTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="upTrendOption" id="home_qua_uptrend" :domWidth="upTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=patTrendSpan v-show="orgType === 3">
              <div
                class="graph-item"
                v-resize="patTrendRedraw"
                v-loading="patTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">位置巡查率趋势</p>
                  </div>
                  <el-select v-model="patTrendType" class="operate" style="width: 160px;" @change="patTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="patTrendOption" id="home_qua_pattrend" :domWidth="patTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=patRatioSpan v-show="orgType === 3">
              <div
                class="graph-item"
                v-resize="patRatioRedraw"
                v-loading="patRatioLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">位置巡查数量比</p>
                  </div>
                  <el-select v-model="patRatioType" class="operate" style="width: 160px;" @change="patRatioChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="patRatioOption" id="home_qua_patratio" :domWidth="patRatioWidth"></Chart>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 未打卡人详情 -->
    <per-module
      :parentDialog="perDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentNum="generalType"
      @parentClose="personClose">
    </per-module>
    <!-- 未巡查位置详情 -->
    <pos-module
      :parentDialog="posDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentNum="generalType"
      @parentClose="positionClose">
    </pos-module>
  </div>
</template>

<script>
// 引入chart
import Chart from '@/components/public/chart'
// 引入详情
import perModule from '@/components/profile/quality-per'
import posModule from '@/components/profile/quality-pos'

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
  name: 'homeQuality',
  data () {
    return {
      switchType: 2,
      modTitle: '',
      typeName: '项目：',
      sectorOptions: [],
      orgid: 0,
      orgType: 3,
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
        clockNum: 0,
        noclockNum: 0,
        patrolNum: 0,
        nopatrolNum: 0,
        patrolRate: '0%',
        dataUpNum: 0
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
      upTrendLoading: false,
      upTrendType: 7,
      upTrendOption: {
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
      patTrendLoading: false,
      patTrendType: 7,
      patTrendOption: {
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
      patRatioLoading: false,
      patRatioType: 7,
      patRatioOption: {
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
      resData1: {
        generalData: {},
        perTrendData: {},
        upTrendData: {},
        patTrendData: {},
        patRatioData: []
      },
      generalState1: false,
      perTrendState1: false,
      upTrendState1: false,
      patTrendState1: false,
      patRatioState1: false,
      resData2: {
        generalData: {},
        perTrendData: {},
        upTrendData: {},
        patTrendData: {},
        patRatioData: []
      },
      generalState2: false,
      perTrendState2: false,
      upTrendState2: false,
      patTrendState2: false,
      patRatioState2: false,
      resData3: {
        generalData: {}
      },
      generalState3: false,
      perTrendSpan: 12,
      upTrendSpan: 12,
      patTrendSpan: 12,
      patRatioSpan: 12,
      perTrendWidth: '',
      upTrendWidth: '',
      patTrendWidth: '',
      patRatioWidth: '',
      loading: false,
      perDialog: false,
      posDialog: false
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
      this.modTitle = '项目品质监控(人/位置）数据分析'
      this.typeName = '项目：'
      this.orgType = 3
      // 获取项目数据
      this.getProjectData(1)
      // 获取部门列表
      this.getSectorOptions()
    } else if (type === 3) {
      this.modTitle = '部门品质监控(人/位置）数据分析'
      this.typeName = '部门：'
      this.sectorName = this.$route.query.name
      this.orgType = 4
      // 获取部门数据
      this.getSectorData(1)
    }
  },
  components: {
    Chart,
    perModule,
    posModule
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
        url: this.reportApi() + '/proOperateQualityMonitor',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          this.proResultDispose(resData)
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
        url: this.reportApi() + '/ogzOperateQualityMonitor',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          this.secResultDispose(resData)
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
    // 项目结果处理
    proResultDispose (data) {
      // 人员品质监控概况
      const generalArg = data.qltBaseMes
      let generalData = {
        clockNum: generalArg.alreadyRecordUserSize || 0,
        noclockNum: generalArg.notRecordUserSize || 0,
        patrolNum: generalArg.alreadyInsPoSize || 0,
        nopatrolNum: generalArg.notInsPoSize || 0,
        patrolRate: this.$common.retainPercent(generalArg.locationInsRate),
        dataUpNum: generalArg.recordSize || 0
      }
      this.generalData = generalData
      // 打卡人数趋势
      const perTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
      let perTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const perTrendArg = data.recordUserSizeQuality || []
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
      // 打卡上传数量趋势
      const upTrendColors = ['#62a8e8', '#44bd8a', '#d8d8d8', '#fa6b67']
      let upTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const upTrendArg = data.recordUploadSizeQuality || []
      upTrendArg.forEach((item, index) => {
        upTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        upTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: upTrendColors[index],
          data: itemData
        })
      })
      upTrendArg[0].data.forEach(inItem => {
        upTrendData.xAxisData.push(inItem.date)
      })
      this.upTrendOption.legend.data = upTrendData.legendData
      this.upTrendOption.xAxis.data = upTrendData.xAxisData
      this.upTrendOption.series = upTrendData.seriesData
      // 位置巡查率趋势
      const patTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
      let patTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const patTrendArg = data.locationInsCoverRateTrend || []
      patTrendArg.forEach((item, index) => {
        patTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = this.switchInteger(inItem.size)
          // let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        patTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: patTrendColors[index],
          data: itemData
        })
      })
      patTrendArg[0].data.forEach(inItem => {
        patTrendData.xAxisData.push(inItem.date)
      })
      this.patTrendOption.legend.data = patTrendData.legendData
      this.patTrendOption.xAxis.data = patTrendData.xAxisData
      this.patTrendOption.series = patTrendData.seriesData
      // 位置巡查数量比
      const patRatioArg = data.locationInsSizeCompare || []
      const patRatioGroup = ['product', patRatioArg[0].lable, patRatioArg[1].lable]
      let patRatioData = []
      patRatioData.push(patRatioGroup)
      const patRatioAry1 = patRatioArg[0].data
      const patRatioAry2 = patRatioArg[1].data
      patRatioAry1.forEach((item, index) => {
        let ary = []
        ary.push(item.date)
        let num1 = item.size || 0
        ary.push(num1)
        let num2 = patRatioAry2[index].size || 0
        ary.push(num2)
        patRatioData.push(ary)
      })
      this.patRatioOption.dataset.source = patRatioData
      // 存储数据
      this.resData1 = {
        generalData: generalData,
        perTrendData: perTrendData,
        upTrendData: upTrendData,
        patTrendData: patTrendData,
        patRatioData: patRatioData
      }
      this.generalState1 = true
      this.perTrendSpan = 12
      this.perTrendState1 = true
      this.upTrendSpan = 12
      this.upTrendState1 = true
      this.patTrendSpan = 12
      this.patTrendState1 = true
      this.patRatioSpan = 12
      this.patRatioState1 = true
    },
    // 部门结果处理
    secResultDispose (data) {
      // 人员品质监控概况
      const generalArg = data.qltBaseMes
      let generalData = {
        clockNum: generalArg.alreadyRecordUserSize || 0,
        noclockNum: generalArg.notRecordUserSize || 0,
        patrolNum: generalArg.alreadyInsPoSize || 0,
        nopatrolNum: 0,
        patrolRate: '0%',
        dataUpNum: generalArg.recordSize || 0
      }
      this.generalData = generalData
      // 打卡人数趋势
      const perTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
      let perTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const perTrendArg = data.recordUserSizeQuality || []
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
      // 打卡上传数量趋势
      const upTrendColors = ['#62a8e8', '#44bd8a', '#d8d8d8', '#fa6b67']
      let upTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const upTrendArg = data.recordUploadSizeQuality || []
      upTrendArg.forEach((item, index) => {
        upTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        upTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: upTrendColors[index],
          data: itemData
        })
      })
      upTrendArg[0].data.forEach(inItem => {
        upTrendData.xAxisData.push(inItem.date)
      })
      this.upTrendOption.legend.data = upTrendData.legendData
      this.upTrendOption.xAxis.data = upTrendData.xAxisData
      this.upTrendOption.series = upTrendData.seriesData
      // 位置巡查率趋势
      let patTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      this.patTrendOption.legend.data = patTrendData.legendData
      this.patTrendOption.xAxis.data = patTrendData.xAxisData
      this.patTrendOption.series = patTrendData.seriesData
      // 位置巡查数量比
      const patRatioGroup = ['product']
      let patRatioData = []
      patRatioData.push(patRatioGroup)
      this.patRatioOption.dataset.source = patRatioData
      // 存储数据
      this.resData1 = {
        generalData: generalData,
        perTrendData: perTrendData,
        upTrendData: upTrendData,
        patTrendData: patTrendData,
        patRatioData: patRatioData
      }
      this.generalState1 = true
      this.perTrendSpan = 12
      this.perTrendState1 = true
      this.upTrendSpan = 12
      this.upTrendState1 = true
      this.patTrendSpan = 12
      this.patTrendState1 = true
      this.patRatioSpan = 12
      this.patRatioState1 = true
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
      this.perTrendState1 = false
      this.perTrendState2 = false
      this.perTrendType = 7
      this.upTrendState1 = false
      this.upTrendState2 = false
      this.upTrendType = 7
      this.patTrendState1 = false
      this.patTrendState2 = false
      this.patTrendType = 7
      this.patRatioState1 = false
      this.patRatioState2 = false
      this.patRatioType = 7
    },
    /* 人员品质监控概况 */
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
        url: this.reportApi() + '/proQualityDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.qltBaseMes
          let generalData = {
            clockNum: resData.alreadyRecordUserSize || 0,
            noclockNum: resData.notRecordUserSize || 0,
            patrolNum: resData.alreadyInsPoSize || 0,
            nopatrolNum: resData.notInsPoSize || 0,
            patrolRate: this.$common.retainPercent(resData.locationInsRate),
            dataUpNum: resData.recordSize || 0
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
        url: this.reportApi() + '/ogzQualityDetailsBaseMes',
        data: params
      }).then((res) => {
        this.generalLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.qltBaseMes
          let generalData = {
            clockNum: resData.alreadyRecordUserSize || 0,
            noclockNum: resData.notRecordUserSize || 0,
            patrolNum: resData.alreadyInsPoSize || 0,
            nopatrolNum: 0,
            patrolRate: '0%',
            dataUpNum: resData.recordSize || 0
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
    /* 打卡人数趋势 */
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
        url: this.reportApi() + '/proQualityDetailsRecordUserSizeMes',
        data: params
      }).then((res) => {
        this.perTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.recordUserSizeQuality || []
          const perTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
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
        url: this.reportApi() + '/ogzQualityDetailsRecordUserSizeMes',
        data: params
      }).then((res) => {
        this.perTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.recordUserSizeQuality || []
          const perTrendColors = ['#44bd8a', '#d8d8d8', '#fa6b67', '#62a8e8']
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
    /* 打卡上传数量趋势 */
    upTrendChange (val) {
      if (val === 7) {
        if (this.upTrendState1) {
          this.upTrendSpan = 12
          this.upTrendOption.legend.data = this.resData1.upTrendData.legendData
          this.upTrendOption.xAxis.data = this.resData1.upTrendData.xAxisData
          this.upTrendOption.series = this.resData1.upTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getUpTrendProData(val)
          } else if (this.orgType === 4) {
            this.getUpTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.upTrendState2) {
          this.upTrendSpan = 24
          this.upTrendOption.legend.data = this.resData2.upTrendData.legendData
          this.upTrendOption.xAxis.data = this.resData2.upTrendData.xAxisData
          this.upTrendOption.series = this.resData2.upTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getUpTrendProData(val)
          } else if (this.orgType === 4) {
            this.getUpTrendSecData(val)
          }
        }
      }
    },
    getUpTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.upTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proQualityDetailsRecordUploadSizeMes',
        data: params
      }).then((res) => {
        this.upTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.recordUploadSizeQuality || []
          const upTrendColors = ['#62a8e8', '#44bd8a', '#d8d8d8', '#fa6b67']
          let upTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            upTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            upTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: upTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            upTrendData.xAxisData.push(inItem.date)
          })
          this.upTrendOption.legend.data = upTrendData.legendData
          this.upTrendOption.xAxis.data = upTrendData.xAxisData
          this.upTrendOption.series = upTrendData.seriesData
          if (n === 7) {
            this.upTrendSpan = 12
            this.upTrendState1 = true
            this.resData1.upTrendData = upTrendData
          } else if (n === 30) {
            this.upTrendSpan = 24
            this.upTrendState2 = true
            this.resData2.upTrendData = upTrendData
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
        this.upTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getUpTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.upTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzQualityDetailsRecordUploadSizeMes',
        data: params
      }).then((res) => {
        this.upTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.recordUploadSizeQuality || []
          const upTrendColors = ['#62a8e8', '#44bd8a', '#d8d8d8', '#fa6b67']
          let upTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            upTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            upTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: upTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            upTrendData.xAxisData.push(inItem.date)
          })
          this.upTrendOption.legend.data = upTrendData.legendData
          this.upTrendOption.xAxis.data = upTrendData.xAxisData
          this.upTrendOption.series = upTrendData.seriesData
          if (n === 7) {
            this.upTrendSpan = 12
            this.upTrendState1 = true
            this.resData1.upTrendData = upTrendData
          } else if (n === 30) {
            this.upTrendSpan = 24
            this.upTrendState2 = true
            this.resData2.upTrendData = upTrendData
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
        this.upTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    upTrendRedraw (val) {
      this.upTrendWidth = val.width
    },
    /* 位置巡查率趋势 */
    patTrendChange (val) {
      if (val === 7) {
        if (this.patTrendState1) {
          this.patTrendSpan = 12
          this.patTrendOption.legend.data = this.resData1.patTrendData.legendData
          this.patTrendOption.xAxis.data = this.resData1.patTrendData.xAxisData
          this.patTrendOption.series = this.resData1.patTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getPatTrendProData(val)
          }
        }
      } else if (val === 30) {
        if (this.patTrendState2) {
          this.patTrendSpan = 24
          this.patTrendOption.legend.data = this.resData2.patTrendData.legendData
          this.patTrendOption.xAxis.data = this.resData2.patTrendData.xAxisData
          this.patTrendOption.series = this.resData2.patTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getPatTrendProData(val)
          }
        }
      }
    },
    getPatTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.patTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proQualityDetailsLocationInsCoverRateMes',
        data: params
      }).then((res) => {
        this.patTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.locationInsCoverRateTrend || []
          const patTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
          let patTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            patTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = this.switchInteger(inItem.size)
              // let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            patTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: patTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            patTrendData.xAxisData.push(inItem.date)
          })
          this.patTrendOption.legend.data = patTrendData.legendData
          this.patTrendOption.xAxis.data = patTrendData.xAxisData
          this.patTrendOption.series = patTrendData.seriesData
          if (n === 7) {
            this.patTrendSpan = 12
            this.patTrendState1 = true
            this.resData1.patTrendData = patTrendData
          } else if (n === 30) {
            this.patTrendSpan = 24
            this.patTrendState2 = true
            this.resData2.patTrendData = patTrendData
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
        this.patTrendLoading = true
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    patTrendRedraw (val) {
      this.patTrendWidth = val.width
    },
    /* 位置巡查数量比 */
    patRatioChange (val) {
      if (val === 7) {
        if (this.patRatioState1) {
          this.patRatioSpan = 12
          this.patRatioOption.dataset.source = this.resData1.patRatioData
        } else {
          if (this.orgType === 3) {
            this.getPatRatioProData(val)
          }
        }
      } else if (val === 30) {
        if (this.patRatioState2) {
          this.patRatioSpan = 24
          this.patRatioOption.dataset.source = this.resData2.patRatioData
        } else {
          if (this.orgType === 3) {
            this.getPatRatioProData(val)
          }
        }
      }
    },
    getPatRatioProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.patRatioLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proQualityDetailsLocationInsSizeMes',
        data: params
      }).then((res) => {
        this.patRatioLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.locationInsSizeCompare || []
          const patRatioGroup = ['product', resData[0].lable, resData[1].lable]
          let patRatioData = []
          patRatioData.push(patRatioGroup)
          const patRatioAry1 = resData[0].data
          const patRatioAry2 = resData[1].data
          patRatioAry1.forEach((item, index) => {
            let ary = []
            ary.push(item.date)
            let num1 = item.size || 0
            ary.push(num1)
            let num2 = patRatioAry2[index].size || 0
            ary.push(num2)
            patRatioData.push(ary)
          })
          this.patRatioOption.dataset.source = patRatioData
          if (n === 7) {
            this.patRatioSpan = 12
            this.crewTrendState1 = true
            this.resData1.patRatioData = patRatioData
          } else if (n === 30) {
            this.patRatioSpan = 24
            this.crewTrendState2 = true
            this.resData2.patRatioData = patRatioData
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
        this.patRatioLoading = true
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    patRatioRedraw (val) {
      this.patRatioWidth = val.width
    },
    // 转换整数
    switchInteger (n) {
      const value = Number.parseFloat(n) || 0
      return Math.round(value * 100)
    },
    /* 详情 */
    personClick () {
      this.perDialog = true
    },
    personClose () {
      this.perDialog = false
    },
    positionClick () {
      this.posDialog = true
    },
    positionClose () {
      this.posDialog = false
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
  .home-quality{
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
