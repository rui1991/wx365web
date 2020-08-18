<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/bangle-monit">手环监控</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>手环围栏</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div id="container"></div>
      <el-collapse class="list-card" v-model="activeName" accordion v-show="listSwitch">
        <el-collapse-item name="1">
          <template slot="title">
            <i class="title-name">围栏列表</i>
          </template>
          <div class="list-search">
            <el-input v-model="searchText" placeholder="请输入内容"></el-input>
          </div>
          <div class="list">
            <div class="list-item" :class="{ active: itemId === item.id }" v-for="item in nowList" :key="item.car_number" @click="checkItemFence(item)">
              <i class="blue details">{{ item.enclosure_name }}</i>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="tool-card" v-show="operateStart !== 2">
        <div class="tool-switch bd-right">
          <a href="javascript:void(0);" class="blue" @click="toolSwitch = false" v-show="toolSwitch">收起&nbsp;<i class="el-icon-d-arrow-right"></i></a>
          <a href="javascript:void(0);" class="blue" @click="toolSwitch = true" v-show="!toolSwitch"><i class="el-icon-d-arrow-left"></i>&nbsp;展开</a>
        </div>
        <transition name="slide-tool">
          <div class="tool" v-show="toolSwitch">
            <div class="tool-item bd-right">
              <a href="javascript:void(0);" class="blue" @click="checkAllData">全部</a>
            </div>
            <div class="tool-item bd-right">
              <el-dropdown @command="drawStart">
                <a href="javascript:void(0);" class="blue">新增<i class="el-icon-arrow-down el-icon--right"></i></a>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="circle">圆形</el-dropdown-item>
                  <el-dropdown-item command="polygon">多边形</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </transition>
      </div>
      <div class="operate-card" v-show="operateStart === 1">
        <div class="operate-item">
          <el-button type="primary" round @click="detClick">查看详情</el-button>
        </div>
        <div class="operate-item">
          <el-button type="primary" round @click="comGraph">编辑图形</el-button>
        </div>
        <div class="operate-item">
          <el-button type="primary" round @click="comClick">编辑信息</el-button>
        </div>
        <div class="operate-item">
          <el-button type="danger" round @click="delClick">删除围栏</el-button>
        </div>
      </div>
      <div class="operate-card" v-show="operateStart === 2">
        <div class="operate-item">
          <el-button type="primary" round @click="cancelGraph">取消编辑</el-button>
        </div>
        <div class="operate-item">
          <el-button type="primary" round @click="endGraph">编辑完成</el-button>
        </div>
      </div>
    </div>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentType="graphType"
      :parentCenter="circleCenter"
      :parentRadius="circleRadius"
      :parentPath="polygonPath"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentForm="itemForm"
      @parentClose="detClose">
    </det-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentId="itemId"
      :parentForm="itemForm"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
/*
* type:  0新增，1编辑，2删除
* gps_type:    0手环    1车辆
* enc_type:   0圆形    1多边形
* central_point: 中心点
* radius： 半径
* xy： 多边形坐标   1.2/3,4/5,6
* speed_limit: 车辆速度限制
* enclosure_name： 围栏名称
* gps_id：设备ID
* */
import AMap from 'AMap'
import { mapState, mapActions } from 'vuex'
// 引入新增组件
import addModule from '@/components/location/bangle-fence-add'
// 引入编辑组件
import detModule from '@/components/location/bangle-fence-det'
// 引入编辑组件
import comModule from '@/components/location/bangle-fence-com'
// 引入删除组件
import delModule from '@/components/location/bangle-fence-del'
export default{
  name: 'bangleFence',
  data () {
    return {
      map: null,
      activeName: '1',
      searchText: '',
      list: [],
      itemData: {},
      itemForm: {
        graphType: 0,
        circleCenter: '',
        circleRadius: '',
        polygonPath: '',
        name: '',
        crewName: '',
        deviceId: []
      },
      itemId: 0,
      toolSwitch: true,
      listSwitch: true,
      mouseTool: null,
      overlayGroup: null,
      graphType: '',
      overlay: null,
      circleCenter: '',
      circleRadius: 0,
      polygonPath: '',
      addDialog: false,
      detDialog: false,
      comDialog: false,
      operateStart: 0,
      graphEditor: null,
      delDialog: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
  },
  mounted () {
    let _map = null
    let _mouseTool = null
    _map = new AMap.Map('container', {
      center: [116.434381, 39.898515],
      zoom: 16
    })
    _map.plugin(['AMap.MouseTool'], () => {
      // 在地图中添加MouseTool插件
      _mouseTool = new AMap.MouseTool(_map)
    })
    this.map = _map
    this.mouseTool = _mouseTool
    // 获取项目坐标
    this.getProjectDetails()
    // 获取围栏列表
    this.getListData()
  },
  components: {
    addModule,
    detModule,
    comModule,
    delModule
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
          if (item.enclosure_name.match(reg)) {
            return item
          }
        })
      }
      return this.list
    }
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    // 获取项目详情
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
    // 获取围栏列表
    getListData () {
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
          this.list = res.data.data1
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

    /* 展示所有围栏 */
    checkAllData () {
      this.itemId = 0
      this.operateStart = 0
      // 清除所有图形
      this.map.clearMap()
      let graphGroup = []
      this.list.forEach(item => {
        let type = item.enc_type
        if (type === 0) {
          let radius = item.radius
          let point = item.central_point.split(',')
          let center = point.map(item => {
            return Number.parseFloat(item)
          })
          let circle = new AMap.Circle({
            center: center,
            radius: radius,
            strokeColor: '#ff33ff',
            strokeOpacity: 0.2,
            strokeWeight: 3,
            fillColor: '#1791fc',
            fillOpacity: 0.4,
            strokeStyle: 'solid'
          })
          graphGroup.push(circle)
        } else {
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
            let polygon = new AMap.Polygon({
              path: path,
              strokeColor: '#ff33ff',
              strokeOpacity: 0.2,
              strokeWeight: 3,
              fillColor: '#1791fc',
              fillOpacity: 0.4,
              strokeStyle: 'solid'
            })
            graphGroup.push(polygon)
          }
        }
      })
      // 创建覆盖物群组
      let overlayGroup = new AMap.OverlayGroup(graphGroup)
      this.overlayGroup = overlayGroup
      // 添加到地图实例上
      this.map.add(overlayGroup)
      // this.overlayGroup.show()
    },
    /* 新增围栏 */
    addUpdata () {
      this.addDialog = false
      // 清除所有图形
      this.map.clearMap()
      this.overlay = null
      // 显示列表
      this.listSwitch = true
      // 获取围栏列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
      // 清除所有图形
      this.map.clearMap()
      this.overlay = null
      // 显示列表
      this.listSwitch = true
    },

    /* 绘制图形 */
    // 开始绘制
    drawStart (type) {
      this.itemId = 0
      // 隐藏列表
      this.listSwitch = false
      // 隐藏操作面板
      this.operateStart = 0
      // 清除所有图形
      this.map.clearMap()
      this.overlay = null
      this.graphType = type
      const graphOptions = {
        strokeColor: '#ff33ff',
        strokeOpacity: 0.2,
        strokeWeight: 3,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        strokeStyle: 'solid'
      }
      if (type === 'circle') {
        this.mouseTool.circle(graphOptions)
      } else if (type === 'polygon') {
        this.mouseTool.polygon(graphOptions)
      }
      // 开启监听绘图事件
      this.watchDrawEvent()
    },
    // 绘制完成
    watchDrawEvent () {
      this.mouseTool.on('draw', (e) => {
        // 保存围栏对象
        this.overlay = e.obj
        // 关闭当前鼠标操作对象
        this.mouseTool.close()
        // 获取围栏参数
        if (this.graphType === 'circle') {
          // 获取圆形中心点
          let centerObj = this.overlay.getCenter()
          let circleCenter = centerObj.lng + ',' + centerObj.lat
          this.circleCenter = circleCenter
          // 获取圆形半径
          let circleRadius = this.overlay.getRadius()
          this.circleRadius = circleRadius
        } else if (this.graphType === 'polygon') {
          // 获取多边形路径
          let path = this.overlay.getPath()
          let pathOptions = path.map(item => {
            return item.lng + ',' + item.lat
          })
          if (pathOptions.length > 0) {
            this.polygonPath = pathOptions.join('/')
          } else {
            this.polygonPath = ''
          }
        }
        // 开启新增会话框
        this.addDialog = true
      })
    },

    /* 查看单个围栏 */
    checkItemFence (data) {
      this.itemData = data
      this.itemId = data.id
      this.operateStart = 1
      // 清除所有图形
      this.map.clearMap()
      this.overlay = null
      if (data.enc_type === 0) {
        const radius = data.radius
        let point = data.central_point.split(',')
        let center = point.map(item => {
          return Number.parseFloat(item)
        })
        this.drawCircle(radius, center)
      } else if (data.enc_type === 1) {
        let pathStr = data.xy
        if (pathStr) {
          let pathArr = pathStr.split('/')
          let path = []
          pathArr.forEach(item => {
            let pathItem = item.split(',').map(inItem => {
              return Number.parseFloat(inItem)
            })
            path.push(pathItem)
          })
          this.drawPolygon(path)
        }
      }
    },
    // 绘制圆形
    drawCircle (radius, center) {
      let _map = this.map
      let circle = new AMap.Circle({
        center: center,
        radius: radius,
        strokeColor: '#ff33ff',
        strokeOpacity: 0.2,
        strokeWeight: 3,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        strokeStyle: 'solid'
      })
      this.overlay = circle
      _map.add(circle)
      // 缩放地图到合适的视野级别
      _map.setFitView([ circle ])
      _map.plugin(['AMap.CircleEditor'], () => {
        this.graphEditor = new AMap.CircleEditor(_map, circle)
      })
    },
    // 绘制多边形
    drawPolygon (path) {
      let _map = this.map
      let polygon = new AMap.Polygon({
        path: path,
        strokeColor: '#ff33ff',
        strokeOpacity: 0.2,
        strokeWeight: 3,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        strokeStyle: 'solid'
      })
      this.overlay = polygon
      _map.add(polygon)
      // 缩放地图到合适的视野级别
      _map.setFitView([ polygon ])
      _map.plugin(['AMap.PolyEditor'], () => {
        this.graphEditor = new AMap.PolyEditor(_map, polygon)
      })
    },

    /* 详情 */
    detClick () {
      this.itemForm = {
        graphType: this.itemData.enc_type,
        circleCenter: this.itemData.central_point,
        circleRadius: this.itemData.radius,
        polygonPath: this.itemData.xy,
        name: this.itemData.enclosure_name,
        crewName: this.itemData.user_names,
        deviceId: []
      }
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 编辑围栏 */
    // 编辑图形
    comGraph () {
      this.operateStart = 2
      this.graphEditor.open()
    },
    // 取消编辑图形
    cancelGraph () {
      this.operateStart = 1
      this.graphEditor.close()
    },
    // 完成编辑图形
    endGraph () {
      // 关闭编辑对象
      this.graphEditor.close()
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        type: 1,
        id: this.itemData.id,
        gps_type: 0,
        enclosure_name: this.itemData.enclosure_name,
        enc_type: this.itemData.enc_type,
        speed_limit: 0,
        gps_id: this.itemData.gps_ids
      }
      if (this.itemData.enc_type === 0) {
        // 获取圆形中心点
        let centerObj = this.overlay.getCenter()
        let circleCenter = centerObj.lng + ',' + centerObj.lat
        params.central_point = circleCenter
        // 获取圆形半径
        let circleRadius = this.overlay.getRadius()
        params.radius = circleRadius
      } else if (this.itemData.enc_type === 1) {
        // 获取多边形路径
        let path = this.overlay.getPath()
        let pathOptions = path.map(item => {
          return item.lng + ',' + item.lat
        })
        if (pathOptions.length > 0) {
          params.xy = pathOptions.join('/')
        } else {
          params.xy = ''
        }
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsEnclosure',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '图形编辑成功！',
            type: 'success'
          })
          this.operateStart = 1
          // 获取围栏列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 编辑信息
    comClick () {
      let gpsids = this.itemData.gps_ids
      let deviceId = []
      if (gpsids) {
        deviceId = gpsids.split(',').map(item => {
          return Number.parseInt(item)
        })
      }
      this.itemForm = {
        graphType: this.itemData.enc_type,
        circleCenter: this.itemData.central_point,
        circleRadius: this.itemData.radius,
        polygonPath: this.itemData.xy,
        name: this.itemData.enclosure_name,
        crewName: this.itemData.user_names,
        deviceId: deviceId
      }
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 获取围栏列表
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 删除 */
    delClick () {
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      this.itemId = 0
      this.operateStart = 0
      // 清除所有图形
      this.map.clearMap()
      // 获取围栏列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    },
    // 返回上一级
    returnBack () {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
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
          height: 46px;
          padding-left: 20px;
          padding-right: 20px;
          border-top: 1px solid #cdcdcd;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
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
    .operate-card{
      width: 140px;
      padding-top: 10px;
      position: absolute;
      right: 20px;
      bottom: 20px;
      border-radius: 6px;
      background: #ffffff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
      .operate-item{
        margin-bottom: 10px;
        display: flex;
        justify-content: center;
      }
    }
  }
</style>
