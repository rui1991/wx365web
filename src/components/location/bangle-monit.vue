<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item>GPS手环监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div id="container"></div>
      <el-collapse class="list-card" accordion>
        <el-collapse-item>
          <template slot="title">
            <i class="title-name">人员列表</i>
            <i class="title-value">{{ bangleNormal }}</i>
            <i class="title-value">{{ bangleAbnormal }}</i>
          </template>
          <div class="list-search">
            <el-input v-model="searchText" placeholder="请输入内容"></el-input>
          </div>
          <div class="list">
            <div class="list-item" :class="{ active: itemId === 1 }" v-for="item in nowList" :key="item.car_number" @click="listChange(1)">
              <div class="mes">
                <span>{{ item.car_number }}</span>
                <span>{{ item.car_type }}</span>
              </div>
              <a href="javascript:void(0);" class="blue details" @click.stop="checkItemTrack(item.gps_number)">轨迹</a>
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
              <a href="javascript:void(0);" class="blue">全部</a>
            </div>
            <div class="tool-item bd-right">
              <router-link class="blue" :to="{ path: '/main/bangle-fence' }">围栏</router-link>
            </div>
            <div class="tool-item bd-right">
              <a href="javascript:void(0);" class="blue">预警</a>
            </div>
            <div class="tool-item">
              <a href="javascript:void(0);" class="blue">全屏</a>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import AMap from 'AMap'
import { mapState } from 'vuex'
import icon from '../../assets/images/person.png'
export default{
  name: 'bangleMonit',
  data () {
    return {
      map: null,
      bangleNormal: 0,
      bangleAbnormal: 0,
      searchText: '',
      searchState: false,
      list: [],
      itemId: 0,
      toolSwitch: true,
      fenceData: [],
      monitTimer: null,
      speed: 10000,
      markerGroups: null,
      icon: icon
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
    // 获取手环列表
    this.getBangleList()
    // 启动定时器
    this.startTimer()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ]),
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
        gps_type: 0
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

    /* 获取手环列表 */
    getBangleList () {
      let params = {
        project_id: this.projectId,
        user_name: '',
        ogz_id: '',
        bracelet_type: '',
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsBraceletMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.list = res.data.data1.mes || []
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

    /* 查询人员实时位置 */
    // 启动定时器
    startTimer () {
      this.monitTimer = setInterval(() => {
        // 获取列表数据
        this.getBangleLocation()
      }, this.speed)
    },
    // 销毁定时器
    beforeDestroy () {
      // 清除轨迹列表定时器
      clearInterval(this.monitTimer)
    },
    getBangleLocation () {
      let params = {
        project_id: this.projectId,
        user_ogz_name: ''
        // gps_type: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selBraceletGpsRealTimeLocation',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          // 正常
          this.bangleNormal = resData.zc
          // 异常
          this.bangleAbnormal = resData.yc
          let gpsData = resData.gps.data
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
      data.forEach((item) => {
        var marker = new AMap.Marker({
          position: new AMap.LngLat(item.lon, item.lat),
          icon: this.icon,
          extData: {
            mid: item.mid
          }
        })
        markers.push(marker)
      })
      // 创建覆盖物群组，并将 marker 传给 OverlayGroup
      var overlayGroups = new AMap.OverlayGroup(markers)
      this.markerGroups = overlayGroups
      this.map.add(overlayGroups)
    },
    // 查看单个手环
    listChange (id) {
      this.itemId = id
      console.log(id)
    },
    // 查看单个轨迹
    checkItemTrack (id) {
      this.$router.push({
        path: '/main/bangle-monit-track',
        query: { id: id }
      })
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
          height: 56px;
          padding-left: 20px;
          padding-right: 20px;
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
        width: 360px;
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
