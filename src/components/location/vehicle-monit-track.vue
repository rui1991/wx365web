<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/vehicle-monit">车辆监控</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>车辆轨迹</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div id="container"></div>
      <el-collapse class="list-card" v-model="activeName" accordion>
        <el-collapse-item name="1">
          <template slot="title">
            <i class="title-name">{{this.$route.query.name}}的轨迹</i>
          </template>
          <div class="list-search">
            <div class="date">
              <el-date-picker
                v-model="date"
                value-format="yyyy-MM-dd"
                @change="dateChange"
                type="date"
                :clearable="false"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="hint">跨越<i class="red">{{ cityNum }}</i>个城市<i class="red">{{ spoorNum }}</i>个轨迹</div>
          </div>
          <div class="list">
            <el-timeline :reverse="true">
              <el-timeline-item
                v-for="(item, index) in list"
                :key="index"
                :timestamp="item.ct">
                <p style="font-size: 12px;">{{item.str}}</p>
                <p class="red" style="font-size: 12px;" v-if="item.tag === 1">{{ item.ct | countDuration(item.ut) }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="tool-card">
        <div class="tool-item">
          <el-button type="primary" round @click="startAnimation">开始动画</el-button>
        </div>
        <div class="tool-item">
          <el-button type="primary" round @click="pauseAnimation">暂停动画</el-button>
        </div>
        <div class="tool-item">
          <el-button type="primary" round @click="resumeAnimation">继续动画</el-button>
        </div>
        <div class="tool-item">
          <el-button type="primary" round @click="stopAnimation">停止动画</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AMap from 'AMap'
import { mapState } from 'vuex'
import icon from '../../assets/images/car.png'
export default {
  name: 'bangleMonitTrack',
  data () {
    return {
      map: null,
      activeName: '1',
      date: this.$common.getNowDate('yyyy-mm-dd'),
      cityNum: 0,
      spoorNum: 0,
      list: [],
      icon: icon,
      lineArr: [],
      marker: null,
      duration: 200,
      polyline: null
    }
  },
  created () {

  },
  mounted () {
    this.map = new AMap.Map('container', {
      center: [116.434381, 39.898515],
      zoom: 16
    })
    // 获取项目坐标
    this.getProjectDetails()
    // 获取围栏
    this.getFenceData()
    // 获取人员轨迹
    this.getTrackList()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 获取项目坐标
    getProjectDetails () {
      let params = {
        organize_id: this.projectOrgId,
        organize_type: 3,
        base_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let coord = res.data.data1.coordinate || ''
          if (!coord) return
          let mapCenter = coord.split(',').map(item => {
            return Number.parseFloat(item)
          })
          // 设置地图中心坐标
          this.map.setCenter(mapCenter)
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

    /* 创建围栏组 */
    // 获取围栏数据
    getFenceData () {
      let params = {
        project_id: this.projectId,
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

    // 选择日期
    dateChange () {
      // 清除所有覆盖物
      this.map.clearMap()
      // 获取轨迹
      this.getTrackList()
    },
    // 查询人员轨迹
    getTrackList () {
      let params = {
        MID: this.$route.query.id,
        date: this.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setCarGpsTrajectory',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.data.pos || []
          // 城市数
          this.cityNum = resData.length
          // 列表
          let listData = []
          resData.forEach(item => {
            listData = listData.concat(item.detail)
          })
          // 足迹数
          this.spoorNum = listData.length
          this.list = listData
          // 绘制轨迹
          this.drawTrack()
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
    // 绘制轨迹
    drawTrack () {
      let list = this.list
      let lineArr = []
      list.forEach(item => {
        let dataItem = [item.lon, item.lat]
        lineArr.push(dataItem)
      })
      this.lineArr = lineArr
      let marker = new AMap.Marker({
        map: this.map,
        position: lineArr[0],
        // icon: 'https://webapi.amap.com/images/car.png',
        icon: this.icon,
        offset: new AMap.Pixel(-9, -24),
        autoRotation: true
        // angle: -90
      })
      this.marker = marker
      // 绘制轨迹
      let polyline = new AMap.Polyline({
        map: this.map,
        path: lineArr,
        showDir: true,
        strokeColor: '#28F',
        strokeWeight: 6
      })
      this.polyline = polyline
      let passedPolyline = new AMap.Polyline({
        map: this.map,
        // path: lineArr,
        strokeColor: '#AF5',
        strokeWeight: 6
      })

      this.marker.on('moving', e => {
        passedPolyline.setPath(e.passedPath)
      })
      // 调整地图
      this.map.setFitView()
    },
    // 开始动画
    startAnimation () {
      this.marker.moveAlong(this.lineArr, this.duration)
    },
    // 暂停动画
    pauseAnimation () {
      this.marker.pauseMove()
    },
    // 继续动画
    resumeAnimation () {
      this.marker.resumeMove()
    },
    // 停止动画
    stopAnimation () {
      this.marker.stopMove()
    }
  },
  filters: {
    countDuration (start, end) {
      let startTime = new Date(start).getTime()
      let endTime = new Date(end).getTime()
      let timeDiffer = endTime - startTime
      // 天
      let day = timeDiffer / (1000 * 60 * 60 * 24)
      day = Math.floor(day)
      // 时
      let hours = timeDiffer / (1000 * 60 * 60) - day * 24
      hours = Math.floor(hours)
      // 分
      let minute = timeDiffer / (1000 * 60) - (24 * 60 * day) - (60 * hours)
      minute = Math.floor(minute)
      // 秒
      let seconds = (timeDiffer / 1000) % 60
      if (day > 0) {
        return '停留' + day + '天' + hours + '小时' + minute + '分钟' + seconds + '秒'
      } else if (hours > 0) {
        return '停留' + hours + '小时' + minute + '分钟' + seconds + '秒'
      } else if (minute > 0) {
        return '停留' + minute + '分钟' + seconds + '秒'
      } else if (seconds > 0) {
        return '停留' + seconds + '秒'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
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
  .module-container .module-main{
    padding: 0;
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
      background: rgba(255, 255, 255, 0.9);
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
        .date{
          display: flex;
          height: 45px;
          align-items: center;
        }
        .hint{
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 16px;
        }
      }
      .list{
        max-height: 420px;
        overflow: auto;
      }
    }
    .tool-card{
      width: 140px;
      padding-top: 10px;
      position: absolute;
      right: 20px;
      bottom: 20px;
      border-radius: 6px;
      background: #ffffff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
      .tool-item{
        margin-bottom: 10px;
        display: flex;
        justify-content: center;
      }
    }
  }
</style>
