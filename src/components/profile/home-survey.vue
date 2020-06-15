<template>
  <div
    class="home-survey"
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
          v-loading="basicLoading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.6)">
          <div class="pandect-head">
            <h3 class="title">
              <span class="chunk"></span>
              <span class="txt">基本信息概况</span>
            </h3>
            <el-select v-model="basicType" class="operate" style="width: 160px;" @change="basicChange">
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
              <span class="price">{{ basicData.crewNum }}</span>
              <span class="name">人员数量(人)</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <span class="price">{{ basicData.siteNum }}</span>
              <span class="name">地址数量(个)</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="crewClick(1)">{{ basicData.onlineCrew }}</a>
              <span class="name">在线人数(人)</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="crewClick(0)">{{ basicData.offlineCrew }}</a>
              <span class="name">离线人数(人)</span>
            </div>
          </div>
        </div>
        <div
          class="pandect"
          v-loading="deviceLoading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.6)">
          <div class="pandect-head">
            <h3 class="title">
              <span class="chunk"></span>
              <span class="txt">采集设备信息概况</span>
            </h3>
            <el-select v-model="deviceType" class="operate" style="width: 160px;" @change="deviceChange">
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
              <span class="price">{{ deviceData.cardNum }}</span>
              <span class="name">采集卡数量(张)</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <span class="price">{{ deviceData.siteDevNum }}</span>
              <span class="name">地址设备数量(个)</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <span class="price">{{ deviceData.swgNum }}</span>
              <span class="name">网关数量(台)</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <a href="javascript:void(0);" class="price vital" @click="offClick">{{ deviceData.swgOffNum }}</a>
              <span class="name">网关离线数量</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <a href="javascript:void(0);" class="price vital" @click="lowClick(1)">{{ deviceData.bsLowNum }}</a>
              <span class="name">基站低电量数量</span>
            </div>
            <div class="pandect-item">
              <a href="javascript:void(0);" class="price vital" @click="lowClick(2)">{{ deviceData.cardLowNum }}</a>
              <span class="name">采集卡低电量数量</span>
            </div>
            <div class="pandect-item" v-show="orgType === 3">
              <span class="price">{{ deviceData.onlineNum }}</span>
              <span class="name">网关、采集卡在线数量</span>
            </div>
          </div>
        </div>
        <div class="graph">
          <el-row :gutter="10">
            <el-col :span=crewTrendSpan>
              <div
                class="graph-item"
                v-resize="crewTrendRedraw"
                v-loading="crewTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">人员在线人数趋势</p>
                  </div>
                  <el-select v-model="crewTrendType" class="operate" style="width: 160px;" @change="crewTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="crewTrendOption" id="home_survey_crew" :domWidth="crewTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
            <el-col :span=lowTrendSpan>
              <div
                class="graph-item"
                v-resize="lowTrendRedraw"
                v-loading="lowTrendLoading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <div class="item-head">
                  <div class="title">
                    <span class="chunk"></span>
                    <p class="txt">采集卡、基站低电量数量趋势</p>
                  </div>
                  <el-select v-model="lowTrendType" class="operate" style="width: 160px;" @change="lowTrendChange">
                    <el-option
                      v-for="item in chartOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="item-body">
                  <Chart :parOption="lowTrendOption" id="home_survey_low" :domWidth="lowTrendWidth"></Chart>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 人员详情 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentState="crewState"
      :parentNum="basicType"
      @parentClose="crewClose">
    </crew-module>
    <!-- 网关离线详情 -->
    <off-module
      :parentDialog="offDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentNum="deviceType"
      @parentClose="offClose">
    </off-module>
    <!-- 低电量详情 -->
    <low-module
      :parentDialog="lowDialog"
      :parentId="orgBase"
      :parentType="orgType"
      :parentLowType="lowType"
      :parentNum="deviceType"
      @parentClose="lowClose">
    </low-module>
  </div>
</template>

<script>
// 引入chart
import Chart from '@/components/public/chart'
// 引入在线/离线人员详情
import crewModule from '@/components/profile/survey-crew'
// 引入网关离线详情
import offModule from '@/components/profile/survey-off'
// 引入基站低电量/采集卡低电量详情
import lowModule from '@/components/profile/survey-low'
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
  name: 'homeSurvey',
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
        }
      ],
      basicLoading: false,
      basicType: 1,
      basicData: {
        crewNum: 0,
        siteNum: 0,
        onlineCrew: 0,
        offlineCrew: 0
      },
      deviceLoading: false,
      deviceType: 1,
      deviceData: {
        cardNum: 0,
        siteDevNum: 0,
        swgNum: 0,
        swgOffNum: 0,
        bsLowNum: 0,
        cardLowNum: 0,
        onlineNum: 0
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
      crewTrendLoading: false,
      crewTrendType: 7,
      crewTrendOption: {
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
      lowTrendLoading: false,
      lowTrendType: 7,
      lowTrendOption: {
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
        basicData: {},
        deviceData: {},
        crewTrendData: {},
        lowTrendData: {}
      },
      basicState1: false,
      deviceState1: false,
      crewTrendState1: false,
      lowTrendState1: false,
      resData2: {
        basicData: {},
        deviceData: {},
        crewTrendData: {},
        lowTrendData: {}
      },
      basicState2: false,
      deviceState2: false,
      crewTrendState2: false,
      lowTrendState2: false,
      crewTrendSpan: 12,
      lowTrendSpan: 12,
      crewTrendWidth: '',
      lowTrendWidth: '',
      loading: false,
      crewDialog: false,
      crewState: 0,
      offDialog: false,
      lowDialog: false,
      lowType: 0
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
      this.modTitle = '项目信息数据分析'
      this.typeName = '项目：'
      this.orgType = 3
      // 获取项目数据
      this.getProjectData(1)
      // 获取部门列表
      this.getSectorOptions()
    } else if (type === 3) {
      this.modTitle = '部门信息数据分析'
      this.typeName = '部门：'
      this.sectorName = this.$route.query.name
      this.orgType = 4
      // 获取部门数据
      this.getSectorData(1)
    }
  },
  components: {
    Chart,
    crewModule,
    offModule,
    lowModule
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
        url: this.reportApi() + '/proOperateDetails',
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
        url: this.reportApi() + '/ogzOperateDetails',
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
      // 基本信息概况
      let basicData = {
        crewNum: data.proDetailsBaseMes.userSize || 0,
        siteNum: data.proDetailsBaseMes.poSize || 0,
        onlineCrew: data.proDetailsBaseMes.onlineUserSize || 0,
        offlineCrew: data.proDetailsBaseMes.offlineUserSize || 0
      }
      this.basicData = basicData
      // 采集设备信息概况
      let deviceData = {
        cardNum: data.proDetailsDeviceMes.cardSize || 0,
        siteDevNum: data.proDetailsDeviceMes.poSize || 0,
        swgNum: data.proDetailsDeviceMes.gwSize || 0,
        swgOffNum: data.proDetailsDeviceMes.gwOfflineSize || 0,
        bsLowNum: data.proDetailsDeviceMes.poLowPowerSize || 0,
        cardLowNum: data.proDetailsDeviceMes.cardLowPowerSize || 0,
        onlineNum: data.proDetailsDeviceMes.deviceOnlineSize || 0
      }
      this.deviceData = deviceData
      // 人员在线人数趋势
      const crewTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
      let crewTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const crewTrendArg = data.proDetailsOnlineUserTrend || []
      crewTrendArg.forEach((item, index) => {
        crewTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        crewTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: crewTrendColors[index],
          data: itemData
        })
      })
      crewTrendArg[0].data.forEach(inItem => {
        crewTrendData.xAxisData.push(inItem.date)
      })
      this.crewTrendOption.legend.data = crewTrendData.legendData
      this.crewTrendOption.xAxis.data = crewTrendData.xAxisData
      this.crewTrendOption.series = crewTrendData.seriesData
      // 采集卡、基站低电量数量趋势
      const lowTrendColors = ['#fa6b67', '#62a8e8', '#d8d8d8', '#44bd8a']
      let lowTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const lowTrendArg = data.proDetailsLowPowerDeviceTrend || []
      lowTrendArg.forEach((item, index) => {
        lowTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        lowTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: lowTrendColors[index],
          data: itemData
        })
      })
      lowTrendArg[0].data.forEach(inItem => {
        lowTrendData.xAxisData.push(inItem.date)
      })
      this.lowTrendOption.legend.data = lowTrendData.legendData
      this.lowTrendOption.xAxis.data = lowTrendData.xAxisData
      this.lowTrendOption.series = lowTrendData.seriesData
      // 存储数据
      this.resData1 = {
        basicData: basicData,
        deviceData: deviceData,
        crewTrendData: crewTrendData,
        lowTrendData: lowTrendData
      }
      this.basicState1 = true
      this.deviceState1 = true
      this.crewTrendSpan = 12
      this.crewTrendState1 = true
      this.lowTrendSpan = 12
      this.lowTrendState1 = true
    },
    // 部门结果处理
    secResultDispose (data) {
      // 基本信息概况
      let basicData = {
        crewNum: data.ogzDetailsBaseMes.userSize || 0,
        siteNum: data.ogzDetailsBaseMes.poSize || 0,
        onlineCrew: data.ogzDetailsBaseMes.onlineUserSize || 0,
        offlineCrew: data.ogzDetailsBaseMes.offlineUserSize || 0
      }
      this.basicData = basicData
      // 采集设备信息概况
      let deviceData = {
        cardNum: data.ogzDetailsDeviceMes.cardSize || 0,
        siteDevNum: data.ogzDetailsDeviceMes.poSize || 0,
        swgNum: data.ogzDetailsDeviceMes.gwSize || 0,
        swgOffNum: data.ogzDetailsDeviceMes.gwOfflineSize || 0,
        bsLowNum: data.ogzDetailsDeviceMes.poLowPowerSize || 0,
        cardLowNum: data.ogzDetailsDeviceMes.cardLowPowerSize || 0,
        onlineNum: data.ogzDetailsDeviceMes.deviceOnlineSize || 0
      }
      this.deviceData = deviceData
      // 人员在线人数趋势
      const crewTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
      let crewTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const crewTrendArg = data.ogzDetailsOnlineUserTrend || []
      crewTrendArg.forEach((item, index) => {
        crewTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        crewTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: crewTrendColors[index],
          data: itemData
        })
      })
      crewTrendArg[0].data.forEach(inItem => {
        crewTrendData.xAxisData.push(inItem.date)
      })
      this.crewTrendOption.legend.data = crewTrendData.legendData
      this.crewTrendOption.xAxis.data = crewTrendData.xAxisData
      this.crewTrendOption.series = crewTrendData.seriesData
      // 采集卡、基站低电量数量趋势
      const lowTrendColors = ['#fa6b67', '#62a8e8', '#d8d8d8', '#44bd8a']
      let lowTrendData = {
        legendData: [],
        xAxisData: [],
        seriesData: []
      }
      const lowTrendArg = data.ogzDetailsLowPowerCardTrend || []
      lowTrendArg.forEach((item, index) => {
        lowTrendData.legendData.push(item.lable)
        let itemData = []
        item.data.forEach(inItem => {
          let itemValue = inItem.size || 0
          itemData.push(itemValue)
        })
        lowTrendData.seriesData.push({
          name: item.lable,
          type: 'line',
          color: lowTrendColors[index],
          data: itemData
        })
      })
      lowTrendArg[0].data.forEach(inItem => {
        lowTrendData.xAxisData.push(inItem.date)
      })
      this.lowTrendOption.legend.data = lowTrendData.legendData
      this.lowTrendOption.xAxis.data = lowTrendData.xAxisData
      this.lowTrendOption.series = lowTrendData.seriesData
      // 存储数据
      this.resData1 = {
        basicData: basicData,
        deviceData: deviceData,
        crewTrendData: crewTrendData,
        lowTrendData: lowTrendData
      }
      this.basicState1 = true
      this.deviceState1 = true
      this.crewTrendSpan = 12
      this.crewTrendState1 = true
      this.lowTrendSpan = 12
      this.lowTrendState1 = true
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
      this.basicState1 = false
      this.basicState2 = false
      this.basicType = 1
      this.deviceState1 = false
      this.deviceState2 = false
      this.deviceType = 1
      this.crewTrendState1 = false
      this.crewTrendState2 = false
      this.crewTrendType = 7
      this.lowTrendState1 = false
      this.lowTrendState2 = false
      this.lowTrendType = 7
    },
    /* 基本信息概况 */
    basicChange (val) {
      if (val === 1) {
        if (this.basicState1) {
          this.basicData = this.resData1.basicData
        } else {
          if (this.orgType === 3) {
            this.getBasicProData(val)
          } else if (this.orgType === 4) {
            this.getBasicSecData(val)
          }
        }
      } else if (val === 7) {
        if (this.basicState2) {
          this.basicData = this.resData2.basicData
        } else {
          if (this.orgType === 3) {
            this.getBasicProData(val)
          } else if (this.orgType === 4) {
            this.getBasicSecData(val)
          }
        }
      }
    },
    getBasicProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.basicLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proDetailsBaseMes',
        data: params
      }).then((res) => {
        this.basicLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.proDetailsBaseMes
          let basicData = {
            crewNum: resData.userSize || 0,
            siteNum: resData.poSize || 0,
            onlineCrew: resData.onlineUserSize || 0,
            offlineCrew: resData.offlineUserSize || 0
          }
          this.basicData = basicData
          if (n === 1) {
            this.basicState1 = true
            this.resData1.basicData = basicData
          } else if (n === 7) {
            this.basicState2 = true
            this.resData2.basicData = basicData
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
        this.basicLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getBasicSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.basicLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzDetailsBaseMes',
        data: params
      }).then((res) => {
        this.basicLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.ogzDetailsBaseMes
          let basicData = {
            crewNum: resData.userSize || 0,
            siteNum: resData.poSize || 0,
            onlineCrew: resData.onlineUserSize || 0,
            offlineCrew: resData.offlineUserSize || 0
          }
          this.basicData = basicData
          if (n === 1) {
            this.basicState1 = true
            this.resData1.basicData = basicData
          } else if (n === 7) {
            this.basicState2 = true
            this.resData2.basicData = basicData
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
        this.basicLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 采集设备信息概况 */
    deviceChange (val) {
      if (val === 1) {
        if (this.deviceState1) {
          this.deviceData = this.resData1.deviceData
        } else {
          if (this.orgType === 3) {
            this.getDeviceProData(1)
          } else if (this.orgType === 4) {
            this.getDeviceSecData(1)
          }
        }
      } else if (val === 7) {
        if (this.deviceState2) {
          this.deviceData = this.resData2.deviceData
        } else {
          if (this.orgType === 3) {
            this.getDeviceProData(7)
          } else if (this.orgType === 4) {
            this.getDeviceSecData(7)
          }
        }
      }
    },
    getDeviceProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.deviceLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proDetailsCardMes',
        data: params
      }).then((res) => {
        this.deviceLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.proDetailsDeviceMes
          let deviceData = {
            cardNum: resData.cardSize || 0,
            siteDevNum: resData.poSize || 0,
            swgNum: resData.gwSize || 0,
            swgOffNum: resData.gwOfflineSize || 0,
            bsLowNum: resData.poLowPowerSize || 0,
            cardLowNum: resData.cardLowPowerSize || 0,
            onlineNum: resData.deviceOnlineSize || 0
          }
          this.deviceData = deviceData
          if (n === 1) {
            this.deviceState1 = true
            this.resData1.deviceData = deviceData
          } else if (n === 7) {
            this.deviceState2 = true
            this.resData2.deviceData = deviceData
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
        this.deviceLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getDeviceSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.deviceLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzDetailsCardMes',
        data: params
      }).then((res) => {
        this.deviceLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.ogzDetailsDeviceMes
          let deviceData = {
            cardNum: resData.cardSize || 0,
            siteDevNum: resData.poSize || 0,
            swgNum: resData.gwSize || 0,
            swgOffNum: resData.gwOfflineSize || 0,
            bsLowNum: resData.poLowPowerSize || 0,
            cardLowNum: resData.cardLowPowerSize || 0,
            onlineNum: resData.deviceOnlineSize || 0
          }
          this.deviceData = deviceData
          if (n === 1) {
            this.deviceState1 = true
            this.resData1.deviceData = deviceData
          } else if (n === 7) {
            this.deviceState2 = true
            this.resData2.deviceData = deviceData
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
        this.deviceLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 人员在线人数趋势 */
    crewTrendChange (val) {
      if (val === 7) {
        if (this.crewTrendState1) {
          this.crewTrendSpan = 12
          this.crewTrendOption.legend.data = this.resData1.crewTrendData.legendData
          this.crewTrendOption.xAxis.data = this.resData1.crewTrendData.xAxisData
          this.crewTrendOption.series = this.resData1.crewTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getCrewTrendProData(val)
          } else if (this.orgType === 4) {
            this.getCrewTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.crewTrendState2) {
          this.crewTrendSpan = 24
          this.crewTrendOption.legend.data = this.resData2.crewTrendData.legendData
          this.crewTrendOption.xAxis.data = this.resData2.crewTrendData.xAxisData
          this.crewTrendOption.series = this.resData2.crewTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getCrewTrendProData(val)
          } else if (this.orgType === 4) {
            this.getCrewTrendSecData(val)
          }
        }
      }
    },
    getCrewTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.crewTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proDetailsUserOnlineMes',
        data: params
      }).then((res) => {
        this.crewTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.proDetailsOnlineUserTrend || []
          const crewTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
          let crewTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            crewTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            crewTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: crewTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            crewTrendData.xAxisData.push(inItem.date)
          })
          this.crewTrendOption.legend.data = crewTrendData.legendData
          this.crewTrendOption.xAxis.data = crewTrendData.xAxisData
          this.crewTrendOption.series = crewTrendData.seriesData
          if (n === 7) {
            this.crewTrendSpan = 12
            this.crewTrendState1 = true
            this.resData1.crewTrendData = crewTrendData
          } else if (n === 30) {
            this.crewTrendSpan = 24
            this.crewTrendState2 = true
            this.resData2.crewTrendData = crewTrendData
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
        this.crewTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getCrewTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.crewTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzDetailsUserOnlineMes',
        data: params
      }).then((res) => {
        this.crewTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.ogzDetailsOnlineUserTrend || []
          const crewTrendColors = ['#44bd8a', '#d8d8d8', '#62a8e8', '#fa6b67']
          let crewTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            crewTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            crewTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: crewTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            crewTrendData.xAxisData.push(inItem.date)
          })
          this.crewTrendOption.legend.data = crewTrendData.legendData
          this.crewTrendOption.xAxis.data = crewTrendData.xAxisData
          this.crewTrendOption.series = crewTrendData.seriesData
          if (n === 7) {
            this.crewTrendSpan = 12
            this.crewTrendState1 = true
            this.resData1.crewTrendData = crewTrendData
          } else if (n === 30) {
            this.crewTrendSpan = 24
            this.crewTrendState2 = true
            this.resData2.crewTrendData = crewTrendData
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
        this.crewTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    crewTrendRedraw (val) {
      this.crewTrendWidth = val.width
    },
    /* 采集卡、基站低电量数量趋势 */
    lowTrendChange (val) {
      if (val === 7) {
        if (this.lowTrendState1) {
          this.lowTrendSpan = 12
          this.lowTrendOption.legend.data = this.resData1.lowTrendData.legendData
          this.lowTrendOption.xAxis.data = this.resData1.lowTrendData.xAxisData
          this.lowTrendOption.series = this.resData1.lowTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getLowTrendProData(val)
          } else if (this.orgType === 4) {
            this.getLowTrendSecData(val)
          }
        }
      } else if (val === 30) {
        if (this.lowTrendState2) {
          this.lowTrendSpan = 24
          this.lowTrendOption.legend.data = this.resData2.lowTrendData.legendData
          this.lowTrendOption.xAxis.data = this.resData2.lowTrendData.xAxisData
          this.lowTrendOption.series = this.resData2.lowTrendData.seriesData
        } else {
          if (this.orgType === 3) {
            this.getLowTrendProData(val)
          } else if (this.orgType === 4) {
            this.getLowTrendSecData(val)
          }
        }
      }
    },
    getLowTrendProData (n) {
      let params = {
        project_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.lowTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proDetailsLowPowerMes',
        data: params
      }).then((res) => {
        this.lowTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.proDetailsLowPowerDeviceTrend || []
          const lowTrendColors = ['#fa6b67', '#62a8e8', '#d8d8d8', '#44bd8a']
          let lowTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            lowTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            lowTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: lowTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            lowTrendData.xAxisData.push(inItem.date)
          })
          this.lowTrendOption.legend.data = lowTrendData.legendData
          this.lowTrendOption.xAxis.data = lowTrendData.xAxisData
          this.lowTrendOption.series = lowTrendData.seriesData
          if (n === 7) {
            this.lowTrendSpan = 12
            this.lowTrendState1 = true
            this.resData1.lowTrendData = lowTrendData
          } else if (n === 30) {
            this.lowTrendSpan = 24
            this.lowTrendState2 = true
            this.resData2.lowTrendData = lowTrendData
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
        this.lowTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getLowTrendSecData (n) {
      let params = {
        ogz_id: this.orgBase,
        type: n
      }
      params = this.$qs.stringify(params)
      this.lowTrendLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzDetailsLowPowerMes',
        data: params
      }).then((res) => {
        this.lowTrendLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.ogzDetailsLowPowerCardTrend || []
          const lowTrendColors = ['#fa6b67', '#62a8e8', '#d8d8d8', '#44bd8a']
          let lowTrendData = {
            legendData: [],
            xAxisData: [],
            seriesData: []
          }
          resData.forEach((item, index) => {
            lowTrendData.legendData.push(item.lable)
            let itemData = []
            item.data.forEach(inItem => {
              let itemValue = inItem.size || 0
              itemData.push(itemValue)
            })
            lowTrendData.seriesData.push({
              name: item.lable,
              type: 'line',
              color: lowTrendColors[index],
              data: itemData
            })
          })
          resData[0].data.forEach(inItem => {
            lowTrendData.xAxisData.push(inItem.date)
          })
          this.lowTrendOption.legend.data = lowTrendData.legendData
          this.lowTrendOption.xAxis.data = lowTrendData.xAxisData
          this.lowTrendOption.series = lowTrendData.seriesData
          if (n === 7) {
            this.lowTrendSpan = 12
            this.lowTrendState1 = true
            this.resData1.lowTrendData = lowTrendData
          } else if (n === 30) {
            this.lowTrendSpan = 24
            this.lowTrendState2 = true
            this.resData2.lowTrendData = lowTrendData
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
        this.lowTrendLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 监控模块变化
    lowTrendRedraw (val) {
      this.lowTrendWidth = val.width
    },
    /* 详情 */
    // 在线人数
    crewClick (state) {
      this.crewState = state
      this.crewDialog = true
    },
    crewClose () {
      this.crewDialog = false
    },
    // 网关离线
    offClick () {
      this.offDialog = true
    },
    offClose () {
      this.offDialog = false
    },
    // 低电量
    lowClick (type) {
      this.lowType = type
      this.lowDialog = true
    },
    lowClose () {
      this.lowDialog = false
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
  .home-survey{
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
