<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/vehicle-monit">GPS车辆监控</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>车辆围栏</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div id="container"></div>
      <el-collapse class="list-card" accordion>
        <el-collapse-item>
          <template slot="title">
            <i class="title-name">围栏列表</i>
            <i class="title-value">18</i>
            <i class="title-value">12</i>
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
              <a href="javascript:void(0);" class="blue details">轨迹</a>
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
              <el-dropdown @command="drawStart">
                <a href="javascript:void(0);" class="blue">新增<i class="el-icon-arrow-down el-icon--right"></i></a>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="circle">圆形</el-dropdown-item>
                  <el-dropdown-item command="polygon">多边形</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addCancel"
      @parentCancel="addCancel">
    </add-module>
  </div>
</template>

<script>
/*
* gps_type:    0手环    1车辆
* */
import { mapState, mapActions } from 'vuex'
import AMap from 'AMap'
// 引入新增组件
import addModule from '@/components/location/bangle-fence-add'
export default{
  name: 'bangleFence',
  data () {
    return {
      parentPathName: '',
      map: null,
      searchText: '',
      list: [
        {
          car_number: '粤B85D25',
          car_type: '垃圾车'
        },
        {
          car_number: '粤B83D28',
          car_type: '运输车'
        },
        {
          car_number: '粤B825L3',
          car_type: '垃圾车'
        },
        {
          car_number: '粤BC5C36',
          car_type: '洒水车'
        }
      ],
      itemId: 0,
      toolSwitch: true,
      mouseTool: null,
      circleCenter: '',
      circleRadius: 0,
      graphType: '',
      overlay: null,
      polygonPath: '',
      addDialog: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
  },
  mounted () {
    this.map = new AMap.Map('container', {
      center: [116.434381, 39.898515],
      zoom: 16
    })
    this.map.plugin(['AMap.MouseTool'], () => {
      // 在地图中添加MouseTool插件
      this.mouseTool = new AMap.MouseTool(this.map)
    })
    // 获取项目坐标
    this.getProjectDetails()
  },
  components: {
    addModule
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
    // 查看单个围栏
    listChange (id) {
      this.itemId = id
      console.log(id)
    },
    // 监听绘图事件
    /* 绘制图形 */
    // 开始绘制
    drawStart (type) {
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
          this.circleCenter = centerObj.lng + ',' + centerObj.lat
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

    /* 新增围栏 */
    addCancel () {
      this.addDialog = false
      this.map.remove(this.overlay)
      this.overlay = null
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
        width: 270px;
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
