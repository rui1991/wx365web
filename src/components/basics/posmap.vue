<template>
  <div class="posmap">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>基础配置</el-breadcrumb-item>
          <el-breadcrumb-item>地图管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside class="module-aside" width="280px">
          <el-tree
            :data="posTree"
            ref="posTree"
            :highlight-current="treeHighlight"
            default-expand-all
            node-key="id"
            :props="defaultProps"
            @node-click="handleNodeClick"></el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="item">
              <el-select v-model="posId" placeholder="请选择平面图" @change="posChange">
                <el-option
                  v-for="item in imgOptions"
                  :key="item.location_id"
                  :label="item.location_name"
                  :value="item.location_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="opeComDis" @click="comClick">编辑</el-button>
              <el-button type="danger" :disabled="opeDelDis" @click="delClick">删除</el-button>
            </div>
          </div>
          <div class="content">
            <div v-if="imgUrl">
              <div class="mapshow" v-if="!comState">
                <img :src="imgUrl" width="800" height="600" alt="">
                <div class="point" :title="item.name" v-for="item in opointData" :key="item.id" :style="{left: item.coordX -50 + 'px', top: item.coordY -20 + 'px'}">
                  <i class="el-icon-location"></i>
                  <p class="txt">{{ item.name }}</p>
                </div>
              </div>
              <div v-else>
                <div class="mapshow" ref="mapshow" @click="clickMap">
                  <img :src="imgUrl" width="800" height="600" alt="">
                  <div class="point" :title="item.name" v-for="item in pointData" :key="item.id" v-if="item.coordX !== ''" :style="{left: item.coordX -50 + 'px', top: item.coordY -20 + 'px'}">
                    <i class="el-icon-location"></i>
                    <p class="txt">{{ item.name }}</p>
                  </div>
                  <div class="point active" ref="activeHot" v-drag="greet" v-show="hotShow">
                    <i class="el-icon-location"></i>
                    <p class="txt">{{ comItem.name }}</p>
                  </div>
                </div>
                <div class="operate">
                  <el-button @click="resetForm">取消编辑</el-button>
                  <el-button type="primary" :disabled="comDisabled" @click="submitComfirm">保存热点</el-button>
                </div>
              </div>
            </div>
            <p class="hint" v-else>请选择关联平面图</p>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'posmap',
  data () {
    return {
      posTree: [],
      treeHighlight: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      imgOptions: [],
      posId: '',
      imgUrl: '',
      opointData: [],
      pointData: [],
      pointId: '',
      pointName: '',
      opeComDis: true,
      opeDelDis: true,
      comState: false,
      comItem: {
        id: '',
        name: '',
        coordX: '',
        coordY: '',
        state: false
      },
      hotShow: false,
      comDisabled: false
    }
  },
  created () {
    // 获取图片列表
    this.getImgOption()
    // 获取位置树
    this.getPositionTree()
  },
  mounted () {

  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 获取图片列表
    getImgOption () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/location/v1.0/selHPLocation',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const positionData = res.data.data1
          this.imgOptions = positionData.filter((item, index, array) => {
            return item.picture
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
    // 获取位置树
    getPositionTree () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionTree628',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const treeData = res.data.data1
          this.posTree = treeData
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
    // 切换位置
    posChange (id) {
      // 显示背景图
      const posItem = this.imgOptions.find(item => {
        return item.location_id === id
      })
      const img = posItem.picture
      this.imgUrl = this.sysetApi() + '/showImage?state=10&filename=' + img
      // 获取热点
      this.getPointData()
      // 重置
      this.resetForm()
    },
    // 获取热点
    getPointData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        location_id: this.posId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/location/v1.0/selLocationByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const points = res.data.data1.position
          let pointData = []
          points.forEach((item, index) => {
            if (item.xaxis !== '') {
              pointData.push({
                id: item.position_id,
                name: item.position_name,
                coordX: parseInt(item.xaxis),
                coordY: parseInt(item.yaxis)
              })
            }
          })
          this.opointData = pointData
          this.pointData = pointData
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
    /* 编辑 */
    comClick () {
      this.comState = true
      // 编辑按钮不可点击
      this.opeComDis = true
      // 初始化编辑数据
      this.pointData = JSON.parse(JSON.stringify(this.opointData))
    },
    // 点击位置树
    handleNodeClick (data) {
      if (!this.comState) {
        return
      }
      // 设置高亮
      this.treeHighlight = true
      // 保存当前点位ID和name
      this.pointName = data.name
      this.pointId = data.id
    },
    // 处理热点
    disposePosit () {
      // 处理以前热点
      if (this.comItem.state) {
        this.pointData.forEach(item => {
          if (item.id === this.comItem.id) {
            item.coordX = this.comItem.coordX
            item.coordY = this.comItem.coordY
          }
        })
      }
      // 处理当前热点
      const nowPointItem = this.pointData.find(item => {
        return item.id === this.pointId
      })
      if (nowPointItem) {
        this.comItem = {
          id: nowPointItem.id,
          name: nowPointItem.name,
          coordX: nowPointItem.coordX,
          coordY: nowPointItem.coordY,
          state: true
        }
        this.pointData.forEach(item => {
          if (item.id === this.comItem.id) {
            item.coordX = ''
            item.coordY = ''
          }
        })
        this.$refs.activeHot.style.left = (this.comItem.coordX - 50) + 'px'
        this.$refs.activeHot.style.top = (this.comItem.coordY - 20) + 'px'
      } else {
        this.comItem = {
          id: this.pointId,
          name: this.pointName,
          coordX: '',
          coordY: '',
          state: false
        }
      }
    },
    // 生成热点
    clickMap (el) {
      if (!this.comItem.id) {
        return
      }
      if (this.hotShow) {
        return
      }
      this.comItem.coordX = el.offsetX
      this.comItem.coordY = el.offsetY
      this.comItem.state = true
      this.$refs.activeHot.style.left = (el.offsetX - 50) + 'px'
      this.$refs.activeHot.style.top = (el.offsetY - 20) + 'px'
      // 添加到热点数组
      this.pointData.push({
        id: this.comItem.id,
        name: this.comItem.name,
        coordX: '',
        coordY: ''
      })
    },
    // 移动
    greet (val) {
      this.comItem.coordX = val.x + 50
      this.comItem.coordY = val.y + 20
    },
    // 重置
    resetForm () {
      this.comState = false
      // 编辑按钮可点击
      this.opeComDis = false
      // 地址树取消高亮
      this.treeHighlight = false
      // 初始化当前点位ID和name
      this.pointId = ''
      this.pointName = ''
      // 初始化编辑数据
      this.comItem = {
        id: '',
        name: '',
        coordX: '',
        coordY: '',
        state: false
      }
    },
    // 删除
    delClick () {
      this.comItem.coordX = ''
      this.comItem.coordY = ''
    },
    // 确定
    submitComfirm () {
      let pointData = JSON.parse(JSON.stringify(this.pointData))
      if (this.comItem.state) {
        pointData.forEach((item, index) => {
          if (item.id === this.comItem.id) {
            item.coordX = this.comItem.coordX
            item.coordY = this.comItem.coordY
          }
        })
      }
      let poins = pointData.filter((item, index, array) => {
        return item.coordX
      })
      this.pointData = poins
      this.sendComRequest()
    },
    // 提交
    sendComRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        location_id: this.posId,
        pomsg: JSON.stringify(this.pointData)
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/location/v1.0/altPositionAxis',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取热点
          this.getPointData()
          // 重置
          this.resetForm()
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
    drag: {
      bind (el, binding) {
        let oDiv = el
        oDiv.onmousedown = function (e) {
          let disX = e.clientX - oDiv.offsetLeft
          let disY = e.clientY - oDiv.offsetTop
          document.onmousemove = function (e) {
            let l = e.clientX - disX
            let t = e.clientY - disY
            if (l <= -50) {
              l = -50
            } else if (l >= 750) {
              l = 750
            }
            if (t <= -20) {
              t = -20
            } else if (t >= 580) {
              t = 580
            }
            oDiv.style.left = l + 'px'
            oDiv.style.top = t + 'px'
            // 将此时的位置传出去
            binding.value({x: l, y: t})
          }
          document.onmouseup = function (e) {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  watch: {
    pointId (newVal, oldVal) {
      if (newVal) {
        // 处理热点
        this.disposePosit()
      }
    },
    'comItem.coordX' (newVal, oldVal) {
      if (newVal === '') {
        this.hotShow = false
      } else {
        this.hotShow = true
      }
    },
    'comItem.state' (newVal, oldVal) {
      if (newVal) {
        this.opeDelDis = false
      } else {
        this.opeDelDis = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.posmap{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-content{
      height: 100%;
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        height: 100%;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid #cccccc;
      }
      .module-main{
        padding-left: 20px;
        padding-top: 0;
        padding-right: 0;
        padding-bottom: 0;
        .search{
          display: table;
          width: 100%;
          height: 60px;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              width: 70px;
              display: inline-block;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align: middle;
            text-align: right;
          }
        }
        .content{
          .mapshow{
            width: 800px;
            height: 600px;
            position: relative;
            margin: 20px auto 0;
            .point{
              position: absolute;
              width: 100px;
              text-align: center;
              cursor: pointer;
              i{
                color: #4e89c5;
                font-size: 24px;
              }
              .txt{
                width: 100%;
                text-align: center;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                color: #4e89c5;
                font-size: 12px;
              }
              &.active{
                i{
                  color: red;
                }
                .txt{
                  color: red;
                }
              }
            }
          }
          .operate{
            margin-top: 20px;
            text-align: center;
          }
          .hint{
            height: 60px;
            line-height: 60px;
            text-align: center;
            font-size: 14px;
            color: #999999;
          }
        }
      }
    }
  }
}
</style>
