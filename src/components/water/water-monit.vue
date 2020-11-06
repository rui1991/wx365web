<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>水表数据管理</el-breadcrumb-item>
        <el-breadcrumb-item>水表监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <el-row class="collect">
        <el-col :span="24">
          <div class="title">
            <span class="chunk"></span>
            <p class="txt">项目数据汇总</p>
          </div>
          <div class="collect-content">
            <div class="content-item">
              <span class="content-value blue">{{ collect.grandTotal }}m³</span>
              <span class="content-name">项目最新抄表总量</span>
            </div>
            <div class="content-item">
              <span class="content-value blue">{{ collect.lastWeek }}m³</span>
              <span class="content-name">项目近七天用水总量</span>
            </div>
            <div class="content-item">
              <span class="content-value blue">{{ collect.count }}台</span>
              <span class="content-name">水表台数</span>
            </div>
          </div>
          <div class="collect-chart">
            <div class="chart-item">
              <Chart :parOption="yearTrendOption" id="water_year_trend" :domWidth="domWidth"></Chart>
            </div>
            <div class="chart-item">
              <Chart :parOption="dayTrendOption" id="water_day_trend" :domWidth="domWidth"></Chart>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="detail">
        <div class="detail-search">
          <div class="title">
            <span class="chunk"></span>
            <p class="txt">项目各水表数据</p>
          </div>
          <div class="search-input">
            <span>水表名称</span>
            <el-input style="margin-left: 5px; width: 240px;" placeholder="请输入水表名称" v-model.trim="searchName"></el-input>
          </div>
        </div>
        <el-row :gutter="10">
          <el-col :span="12" v-for="item in nowDetailList" :key="item.user_code">
            <div class="item">
              <div class="item-head">
                <p class="name blue">{{ item.user_name }}</p>
                <el-select class="operate" v-model="item.type" style="width: 160px;" @change="itemTypeChange(item.user_code, item.type, item.multiple)">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="item-des">
                <div class="des">
                  <span class="des-value blue">{{ item.new_num }}m³</span>
                  <span class="des-name">最新抄表数</span>
                </div>
                <div class="des">
                  <span class="des-value blue">{{ item.all_num }}m³</span>
                  <span class="des-name">总用水量</span>
                </div>
              </div>
              <div class="item-chart">
                <Chart :parOption="item.option" :id="item.id" :domWidth="domWidth"></Chart>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
/*
* type: 7近七天    30当月     365今年
* */
import { mapState } from 'vuex'
// 引入chart
import Chart from '@/components/public/chart'
export default{
  name: 'waterMonit',
  data () {
    return {
      domWidth: this.$common.getDomClientSize().width,
      collect: {
        grandTotal: 0,
        lastWeek: 0,
        count: 0
      },
      yearTrendOption: {
        title: {
          text: '项目本年度用水总量趋势',
          x: 'center',
          bottom: '0px',
          textStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: '#272727'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let tip = ''
            if (params != null && params.length > 0) {
              tip += '月份：' + params[0].name + '<br/>'
              tip += '用水总量：' + params[0].value + 'm³'
            }
            return tip
          }
        },
        grid: {
          top: '8%',
          left: '3%',
          right: '4%',
          bottom: '10%',
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
        series: [{
          data: [],
          color: '#fa6b67',
          type: 'line'
        }]
      },
      dayTrendOption: {
        title: {
          text: '项目近七天用水总量趋势',
          x: 'center',
          bottom: '0px',
          textStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: '#272727'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let tip = ''
            if (params != null && params.length > 0) {
              tip += '月份：' + params[0].name + '<br/>'
              tip += '用水总量：' + params[0].value + 'm³'
            }
            return tip
          }
        },
        grid: {
          top: '8%',
          left: '3%',
          right: '4%',
          bottom: '10%',
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
        series: [{
          data: [],
          color: '#fa6b67',
          type: 'line'
        }]
      },
      searchName: '',
      typeOptions: [
        {
          value: 7,
          label: '近七天'
        },
        {
          value: 30,
          label: '当月'
        },
        {
          value: 365,
          label: '今年'
        }
      ],
      detailList: [],
      itemCode: '',
      itemType: 7
    }
  },
  created () {

  },
  mounted () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 监控窗口变化
    window.onresize = () => {
      const domWidth = this.$common.getDomClientSize().width
      this.domWidth = domWidth
    }
    // 获取年汇总数据
    this.getYearCollectData()
    // 获取近七日汇总数据
    this.getDayCollectData()
    // 获取各水表数据
    this.getDetailList()
  },
  components: {
    Chart
  },
  computed: {
    ...mapState('other', [
      'projectId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.waterMonit
    }),
    nowDetailList () {
      let search = this.searchName
      let reg = new RegExp(search, 'i')
      if (search) {
        return this.detailList.filter(item => {
          if (item.user_name.match(reg)) {
            return item
          }
        })
      }
      return this.detailList
    }
  },
  methods: {
    // 获取年汇总数据数据
    getYearCollectData () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/proWaterMeterMonthDataSummary',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          // 项目累计用水总量
          this.collect.grandTotal = resData.proNewSumMes || 0
          // 年图表
          let xAxisData = []
          let seriesData = []
          resData.monthUseCompare.forEach(item => {
            xAxisData.push(item.month)
            let num = item.num || 0
            seriesData.push(num)
          })
          this.yearTrendOption.xAxis.data = xAxisData
          this.yearTrendOption.series[0].data = seriesData
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
    // 获取近七日汇总数据数据
    getDayCollectData () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/proWaterMeterWeekDataSummary',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          // 项目近七天用水总量
          this.collect.lastWeek = resData.proNearSumMes || 0
          // 项目近七天用水总量
          this.collect.count = resData.wwSize || 0
          // 七日图表
          let xAxisData = []
          let seriesData = []
          resData.nearDayUseCompare.forEach(item => {
            xAxisData.push(item.date)
            let num = item.num || 0
            seriesData.push(num)
          })
          this.dayTrendOption.xAxis.data = xAxisData
          this.dayTrendOption.series[0].data = seriesData
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
    // 获取各水表数据
    getDetailList () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/proWaterMeterWeekDataSummaryOnlyMain',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let detailList = []
          resData.forEach((item, index) => {
            let xAxisData = []
            let seriesData = []
            item.mes.nearDayUseCompare.forEach(inItem => {
              xAxisData.push(inItem.date)
              let num = inItem.num || 0
              seriesData.push(num)
            })
            let listItem = {
              id: 'water_detail_item' + (index + 1),
              type: 7,
              user_code: item.user_code,
              user_name: item.user_name,
              multiple: item.multiple,
              new_num: item.mes.newNum,
              all_num: item.mes.proNearSumMes,
              option: {
                title: {
                  text: '用水量趋势',
                  x: 'center',
                  bottom: '0px',
                  textStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#272727'
                  }
                },
                tooltip: {
                  trigger: 'axis',
                  formatter: function (params) {
                    let tip = ''
                    if (params != null && params.length > 0) {
                      tip += '时间：' + params[0].name + '<br/>'
                      tip += '用水总量：' + params[0].value + 'm³'
                    }
                    return tip
                  }
                },
                grid: {
                  top: '8%',
                  left: '3%',
                  right: '4%',
                  bottom: '10%',
                  containLabel: true
                },
                xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: xAxisData,
                  axisLabel: {
                    interval: 0,
                    rotate: 40
                  }
                },
                yAxis: {
                  type: 'value'
                },
                series: [{
                  data: seriesData,
                  color: '#fa6b67',
                  type: 'line'
                }]
              }
            }
            detailList.push(listItem)
          })
          this.detailList = detailList
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
    // 切换类型
    itemTypeChange (code, type, multiple) {
      this.itemCode = code
      this.itemCode = type
      // 查询单个详情
      this.getItemDetails(code, type, multiple)
    },
    // 查询单个详情
    getItemDetails (code, type, multiple) {
      let params = {
        project_id: this.projectId,
        user_code: code,
        type: type,
        multiple: multiple || 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/proWaterMeterWeekDataSummaryOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let xAxisData = []
          let seriesData = []
          resData.nearDayUseCompare.forEach(item => {
            let date = item.date || item.month
            xAxisData.push(date)
            let num = item.num || 0
            seriesData.push(num)
          })
          let option = {
            title: {
              text: '用水量趋势',
              x: 'center',
              bottom: '0px',
              textStyle: {
                fontSize: 16,
                fontWeight: '500',
                color: '#272727'
              }
            },
            tooltip: {
              trigger: 'axis',
              formatter: function (params) {
                let tip = ''
                if (params != null && params.length > 0) {
                  tip += '时间：' + params[0].name + '<br/>'
                  tip += '用水总量：' + params[0].value + 'm³'
                }
                return tip
              }
            },
            grid: {
              top: '8%',
              left: '3%',
              right: '4%',
              bottom: '10%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: xAxisData,
              axisLabel: {
                interval: 0,
                rotate: 40
              }
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              data: seriesData,
              color: '#fa6b67',
              type: 'line'
            }]
          }
          let newNum = resData.newNum
          let allNum = resData.proNearSumMes
          this.detailList.map(item => {
            if (item.user_code === code) {
              item.type = type
              item.option = option
              item.new_num = newNum
              item.all_num = allNum
            }
            return item
          })
          // this.detailList = detailList
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
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .module-container{
    .module-main{
      overflow-x: hidden;
      padding: 0;
      background-color: transparent;
      .collect{
        padding-top: 10px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 10px;
        background: #ffffff;
        .title{
          height: 35px;
          display: flex;
          align-items: center;
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
        .collect-content{
          height: 80px;
          display: flex;
          align-items: center;
          .content-item{
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .content-value{
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .content-name{
              color: #272727;
            }
          }
        }
        .collect-chart{
          display: flex;
          .chart-item{
            width: 50%;
            height: 280px;
          }
        }
      }
      .detail{
        margin-top: 20px;
        .detail-search{
          height: 60px;
          padding-left: 20px;
          padding-right: 20px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #cdcdcd;
          background: #ffffff;
          .title{
            display: flex;
            align-items: center;
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
          .search-input{
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
        }
        .item{
          padding: 10px 20px;
          margin-bottom: 5px;
          background: #ffffff;
          .item-head{
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item-des{
            height: 60px;
            display: flex;
            align-items: center;
            .des{
              display: flex;
              flex-grow: 1;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              .des-value{
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 5px;
              }
              .des-name{
                color: #272727;
              }
            }
          }
          .item-chart{
            width: 100%;
            height: 280px;
          }
        }
      }
    }
  }
</style>
