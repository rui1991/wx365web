<template>
  <div class="module-container">
    <div id="container"></div>
    <el-collapse class="list-card" v-model="activeName" accordion>
      <el-collapse-item name="1">
        <template slot="title">
          <i class="title-name">车辆列表</i>
          <i class="title-value blue" @click="checkCarDetails('0')">{{ bangleNormal }}</i>
          <i class="title-value red" @click="checkCarDetails('1')">{{ bangleAbnormal }}</i>
        </template>
        <div class="list-search">
          <el-input v-model="searchText" placeholder="请输入内容"></el-input>
        </div>
        <div class="list">
          <div class="list-item" :class="{ active: itemId === item.gps_number }" v-for="item in nowList" :key="item.car_number" @click="checkItemDevice(item.gps_number, item.car_number)">
            <div class="mes">
              <span>{{ item.car_number }}({{ item.car_type | filterCarType }})</span>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div class="tool-card">
      <div class="tool-switch bd-right">
        <a href="javascript:void(0);" class="blue" @click="toolSwitch = false" v-show="toolSwitch">收起&nbsp;<i class="el-icon-d-arrow-right"></i></a>
        <a href="javascript:void(0);" class="blue" @click="toolSwitch = true" v-show="!toolSwitch"><i class="el-icon-d-arrow-left"></i>&nbsp;展开</a>
      </div>
      <transition name="slide-tool">
        <div class="tool" v-show="toolSwitch">
          <div class="tool-item bd-right">
            <a href="javascript:void(0);" class="blue" @click="checkItemDevice()"><i class="iconfont iconliebiao"></i>&nbsp;全部</a>
          </div>
          <div class="tool-item bd-right">
            <el-popover
              placement="bottom"
              trigger="hover">
              <el-table :data="alarmData" max-height="360">
                <el-table-column type="index" width="50" label="序号"></el-table-column>
                <el-table-column width="120" property="car_numbers" label="车辆"></el-table-column>
                <el-table-column width="100" label="车种">
                  <template slot-scope="scope">
                    <span>{{ scope.row.car_type | filterCarType }}</span>
                  </template>
                </el-table-column>
                <el-table-column width="100" property="ev" label="类型"></el-table-column>
                <el-table-column label="内容" width="280" :show-overflow-tooltip="true">
                  <template slot-scope="scope">
                    <el-popover
                      placement="top-start"
                      title="位置"
                      width="300"
                      trigger="hover"
                      @show="alarmPositionShow(scope.row.content)"
                      v-if="scope.row.ev === '越界'"
                      :content="alarmContent">
                      <a href="javascript:void(0);" class="blue" slot="reference">查看位置</a>
                    </el-popover>
                    <span v-else>{{ scope.row.content }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <a href="javascript:void(0);" class="red" slot="reference"><i class="iconfont icongaojing2"></i>&nbsp;预警<i v-show="alarmData.length > 0" class="red">&nbsp;({{ alarmData.length }})</i></a>
            </el-popover>
          </div>
        </div>
      </transition>
    </div>
    <!-- 人员状态详情 -->
    <car-module
      :parentDialog="carDialog"
      :parentState="carState"
      :parentData="carNowData"
      @parentClose="carClose">
    </car-module>
  </div>
</template>

<script>
import AMap from 'AMap'
import icon from '../assets/images/car.png'
// 引入人员状态详情组件
import carModule from '@/components/location/vehicle-monit-car'
export default{
  name: 'monitvehicle',
  data () {
    return {
      map: null,
      activeName: '1',
      bangleNormal: 0,
      bangleAbnormal: 0,
      carAllData: [],
      carNowData: [],
      carState: '0',
      searchText: '',
      carNumber: '',
      icon: icon,
      list: [],
      itemId: 0,
      toolSwitch: true,
      fenceData: [],
      monitTimer: null,
      speed: 60000,
      markerGroups: null,
      alarmData: [],
      alarmContent: '',
      carDialog: false
    }
  },
  created () {

  },
  mounted () {
    let pointLon = Number.parseFloat(this.$route.query.pointLon) || 116.434381
    let pointLat = Number.parseFloat(this.$route.query.pointLat) || 39.898515
    this.map = new AMap.Map('container', {
      center: [pointLon, pointLat],
      zoom: 15
    })
    // 获取围栏
    this.getFenceData()
    // 获取车辆列表
    this.getVehicleList()
    // 获取列表数据
    this.getVehicleLocation()
    // 启动定时器
    this.startTimer()
  },
  components: {
    carModule
  },
  computed: {
    nowList () {
      let search = this.searchText
      let reg = new RegExp(search, 'i')
      if (search) {
        return this.list.filter(item => {
          if (item.car_number.match(reg)) {
            return item
          }
        })
      }
      return this.list
    }
  },
  methods: {
    /* 创建围栏组 */
    // 获取围栏数据
    getFenceData () {
      let params = {
        project_id: this.$route.query.projectId,
        gps_type: 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsEnclosure',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const fenceData = res.data.data1
          this.createFenceGroup(fenceData)
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
    // 创建围栏组
    createFenceGroup (data) {
      data.forEach(item => {
        let graphGroup = []
        let type = item.enc_type
        if (type === 0) {
          let radius = item.radius
          let point = item.central_point.split(',')
          let center = point.map(item => {
            return Number.parseFloat(item)
          })
          let circle = this.drawCircle(radius, center)
          graphGroup.push(circle)
        } else if (type === 1) {
          let pathStr = item.xy
          if (pathStr) {
            let pathArr = pathStr.split('/')
            let path = []
            pathArr.forEach(item => {
              let pathItem = item.split(',').map(inItem => {
                return Number.parseFloat(inItem)
              })
              path.push(pathItem)
            })
            let polygon = this.drawPolygon(path)
            graphGroup.push(polygon)
          }
        }
        // 创建覆盖物群组
        let overlayGroup = new AMap.OverlayGroup(graphGroup)
        // 添加到地图实例上
        this.map.add(overlayGroup)
      })
    },
    // 绘制圆形
    drawCircle (radius, center) {
      return new AMap.Circle({
        center: center,
        radius: radius,
        strokeColor: '#ff33ff',
        strokeOpacity: 0.2,
        strokeWeight: 3,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        strokeStyle: 'solid'
      })
    },
    // 绘制多边形
    drawPolygon (path) {
      return new AMap.Polygon({
        path: path,
        strokeColor: '#ff33ff',
        strokeOpacity: 0.2,
        strokeWeight: 3,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        strokeStyle: 'solid'
      })
    },

    /* 获取车辆列表 */
    getVehicleList () {
      let params = {
        project_id: this.$route.query.projectId,
        car_number: '',
        ogz_id: '',
        car_type: '',
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsCarMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.mes || []
          this.list = resData.filter(item => {
            return item.gps_number
          })
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
    // 查看车辆状态详情
    checkCarDetails (state) {
      this.carState = state
      let carAllData = this.carAllData
      let carNowData = []
      if (state === '0') {
        carNowData = carAllData.filter(item => {
          return item.state === '正常'
        })
      } else if (state === '1') {
        carNowData = carAllData.filter(item => {
          return item.state === '异常'
        })
      }
      this.carNowData = carNowData
      this.carDialog = true
    },
    // 关闭人员状态详情
    carClose () {
      this.carDialog = false
    },

    /* 查询人员实时位置 */
    // 启动定时器
    startTimer () {
      this.monitTimer = setInterval(() => {
        // 获取列表数据
        this.getVehicleLocation()
      }, this.speed)
    },
    // 获取实时数据
    getVehicleLocation () {
      let params = {
        project_id: this.$route.query.projectId,
        car_number: this.carNumber
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selCarGpsRealTimeLocation',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          // 正常
          this.bangleNormal = resData.zc || 0
          // 异常
          this.bangleAbnormal = resData.yc || 0
          // 设备状态数据
          this.carAllData = resData.userList || []
          // 告警
          this.alarmData = resData.alarms || []
          // 绘制标记
          let gpsData = resData.gps.data || []
          this.drawMarkerGroup(gpsData)
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
    // 绘制标记
    drawMarkerGroup (data) {
      if (this.markerGroups) {
        this.markerGroups.clearOverlays()
      }
      let markers = []
      let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)})
      data.forEach((item, index) => {
        var marker = new AMap.Marker({
          position: new AMap.LngLat(item.lon, item.lat),
          // icon: 'https://webapi.amap.com/images/car.png',
          icon: this.icon,
          extData: {
            mid: item.mid
          }
        })
        let content = `<div class="marker-content"><p style="line-height: 35px; text-align: center; color: #272727; font-weight: 600;">${item.name_ogz}</p><p>设备号：${item.mid}</p><p>位置：${item.str}</p></div>`
        if (item.Desc) {
          content += `<p>设备状态：${item.Desc}</p>`
        } else {
          content += `<p>设备状态：正常</p>`
        }
        marker.content = content
        marker.on('mouseover', e => {
          infoWindow.setContent(e.target.content)
          infoWindow.open(this.map, e.target.getPosition())
        })
        marker.on('mouseout', e => {
          infoWindow.close()
        })
        markers.push(marker)
      })
      // 创建覆盖物群组，并将 marker 传给 OverlayGroup
      var overlayGroups = new AMap.OverlayGroup(markers)
      this.markerGroups = overlayGroups
      this.map.add(overlayGroups)
    },
    // 查看全部
    checkAllDevice () {
      this.itemId = ''
      this.carNumber = ''
      this.getVehicleLocation()
    },
    // 查看单个车辆
    checkItemDevice (id = '', num = '') {
      this.itemId = id
      this.carNumber = num
      this.getVehicleLocation()
    },
    // 查看告警位置
    alarmPositionShow (point) {
      if (!point) {
        this.alarmContent = ''
        return
      }
      AMap.plugin('AMap.Geocoder', () => {
        var geocoder = new AMap.Geocoder({
          city: '全国'
        })
        let lnglat = point.split(',')
        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.alarmContent = result.regeocode.formattedAddress
          }
        })
      })
    }
  },
  filters: {
    filterCarType (num) {
      if (!num) return ''
      let typeName = ''
      switch (num) {
        case 1:
          typeName = '运输车'
          break
        case 2:
          typeName = '洒水车'
          break
        case 3:
          typeName = '扫地车'
          break
        case 4:
          typeName = '压缩车'
          break
        case 5:
          typeName = '环卫车'
          break
        case 6:
          typeName = '垃圾车'
          break
        case 7:
          typeName = '巡逻车'
          break
      }
      return typeName
    }
  },
  // 销毁定时器
  beforeDestroy () {
    // 清除轨迹列表定时器
    clearInterval(this.monitTimer)
  }
}
</script>

<style lang="less" scoped>
  .slide-tool-enter-active {
    transition: all .3s ease;
  }
  .slide-tool-leave-active {
    transition: all .5s ease;
  }
  .slide-tool-enter, .slide-tool-leave-to {
    transform: translateX(270px);
    opacity: 0;
  }
  .module-container{
    width: 100%;
    height: 100%;
    position: relative;
    #container{
      width: 100%;
      height: 100%;
    }
    .list-card{
      width: 240px;
      padding-left: 10px;
      padding-right: 10px;
      position: absolute;
      left: 20px;
      top: 80px;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
      .title-name{
        font-size: 16px;
        color: #272727;
      }
      .title-value{
        font-size: 16px;
        margin-left: 10px;
      }
      .list-search{
        opacity: 0.8;
        padding-top: 5px;
        padding-bottom: 5px;
      }
      .list{
        max-height: 420px;
        overflow: auto;
        .list-item{
          display: flex;
          height: 46px;
          padding-left: 10px;
          padding-right: 10px;
          border-top: 1px solid #cdcdcd;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          .mes{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          &.active{
            background: #bed5ec;
          }
        }
      }
    }
    .tool-card{
      position: absolute;
      right: 20px;
      top: 20px;
      padding-top: 3px;
      padding-bottom: 3px;
      flex-direction: row;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
      display: flex;
      overflow: hidden;
      .tool-switch{
        width: 90px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tool{
        display: flex;
        width: 180px;
        .tool-item{
          flex-grow: 1;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .bd-right{
        border-right: 1px solid #cdcdcd;
      }
    }
  }
</style>
