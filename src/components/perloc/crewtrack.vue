<template>
  <div class="crewtrack">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>人员位置管理</el-breadcrumb-item>
          <el-breadcrumb-item>人员轨迹图</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="220px" class="module-aside">
          <transition-group tag="ul" class="track-ul">
            <li v-for="item in listData" :key="item.in_time" class="track-li">
              <span class="name">{{ item.position_name }}</span><span class="time">{{ item.in_time | formatDate('hh:mm:ss') }}</span>
            </li>
          </transition-group>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>创建时段</span>
                <el-date-picker
                  style="width: 180px;"
                  v-model="nowSearch.startDate"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  :time-arrow-control="true"
                  :clearable="false"
                  placeholder="选择日期时间">
                </el-date-picker>
              </div>
              <div class="item">
                <span>----</span>
                <el-date-picker
                  style="width: 180px;"
                  v-model="nowSearch.endDate"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                  :time-arrow-control="true"
                  :clearable="false"
                  placeholder="选择日期时间">
                </el-date-picker>
              </div>
              <div class="operate"></div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>选择人员</span>
                <el-select v-model="nowSearch.crew" style="width: 180px;" filterable placeholder="请选择人员">
                  <el-option
                    v-for="item in crewOptions"
                    :key="item.user_id"
                    :label="item.user_name"
                    :value="item.user_id">
                  </el-option>
                </el-select>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
              </div>
            </div>
          </div>
          <div class="nav">
            <div class="right">
              <div style="display: inline-block; margin-right: 30px;">
                <span style="margin-right: 5px;">播放速度</span>
                <el-select v-model="speed" placeholder="选择播放速度" style="width: 120px;" @change="showTrackLog">
                  <el-option
                    v-for="item in speedOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div style="display: inline-block;">
                <span style="margin-right: 5px;">平面图</span>
                <el-select v-model="posId" placeholder="请选择平面图" @change="posChange">
                  <el-option
                    v-for="item in imgOptions"
                    :key="item.location_id"
                    :label="item.location_name"
                    :value="item.location_id">
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
          <div style="position: relative;">
            <div class="mapshow">
              <img :src="imgUrl" width="800" height="600" alt="">
              <div class="point" :title="item.name" v-for="item in pointData" :key="item.id" v-show="item.id === pointId" :style="{left: item.coordX -50 + 'px', top: item.coordY -20 + 'px'}">
                <i class="iconfont icon-xunluorenyuan"></i>
                <p class="txt">{{ item.name }}</p>
              </div>
            </div>

          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'crewtrack',
  data () {
    return {
      search: {
        crew: '',
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        crew: '',
        startDate: '',
        endDate: ''
      },
      crewOptions: [],
      imgOptions: [],
      listData: [],
      posId: '',
      imgUrl: '',
      logData: [],
      pointData: [],
      total: 0,
      pointPage: 1,
      pointLimit: 50,
      pointId: '',
      trackTimer: null,
      speedOptions: [
        {
          label: '1X',
          value: 4000
        },
        {
          label: '2X',
          value: 2000
        },
        {
          label: '4X',
          value: 1000
        }
      ],
      speed: 2000
    }
  },
  created () {
    // 初始化时间
    const nowDay = this.$common.getNowDate('yyyy-mm-dd')
    this.search.startDate = nowDay + ' 00:00'
    this.search.endDate = this.$common.getNowDate('yyyy-mm-dd hh:mm')
    this.nowSearch.startDate = nowDay + ' 00:00'
    this.nowSearch.endDate = this.$common.getNowDate('yyyy-mm-dd hh:mm')
    // 获取项目人员
    this.getCrewOptions()
    // 获取图片列表
    this.getImgOption()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid
      }
    )
  },
  methods: {
    /* 人员 */
    getCrewOptions () {
      let params = {
        organize_id: this.nowOrgid,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewData = res.data.data1.users
          this.crewOptions = crewData
          this.search.crew = crewData[0].user_id
          this.nowSearch.crew = crewData[0].user_id
          // 获取列表数据
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 搜索 */
    searchList () {
      const startDate = this.nowSearch.startDate
      const endDate = this.nowSearch.endDate
      const fate = this.getDateDiff(startDate, endDate)
      if (fate) {
        this.$message({
          showClose: true,
          message: '查询时长不能超过24小时',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取跨越天数
    getDateDiff (startDate, endDate) {
      let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime()
      let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime()
      const seaDuration = endTime - startTime
      const maxDuration = 1000 * 60 * 60 * 24
      if (seaDuration > maxDuration) {
        return true
      } else {
        return false
      }
    },
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        userN_id: this.search.crew,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        type: 'name'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTrajectory',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 全部数据
          const logData = res.data.data1
          this.logData = logData
          // 总页数
          const total = logData.length
          this.total = total
          // 列表数据
          const listData = logData.slice(0, this.pointLimit)
          this.listData = listData
          // 初始化轨迹列表页数
          this.pointPage = 1
          // 轨迹列表
          this.showTrackLog()
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
    /* 轨迹图 */
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
    // 轨迹列表
    showTrackLog () {
      if (this.listData.length === 0) {
        return
      }
      // 先清除定时器
      clearInterval(this.trackTimer)
      // 获取第一个点
      this.pointId = this.listData[0].position_id || 0
      this.trackTimer = setInterval(() => {
        if (this.listData.length > 1) {
          this.listData.shift()
          this.pointId = this.listData[0].position_id || 0
          if (this.listData.length < 20 && this.pointPage * this.pointLimit < this.total) {
            const start = this.pointPage * this.pointLimit
            const end = this.pointPage * this.pointLimit + this.pointLimit
            const nowListData = this.logData.slice(start, end)
            this.listData = this.listData.concat(nowListData)
            this.pointPage++
          }
        } else {
          this.pointId = 0
          this.listData.shift()
          clearInterval(this.trackTimer)
        }
      }, this.speed)
    }
  },
  beforeDestroy () {
    // 清除轨迹列表定时器
    clearInterval(this.trackTimer)
  }
}
</script>

<style lang="less" scoped>
.crewtrack{
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
        border-radius: 6px;
        padding: 5px;
        border: 1px solid #cccccc;
        .track-ul{
          .track-li{
            padding-left: 10px;
            height: 35px;
            line-height: 35px;
            font-size: 0;
            span{
              display: inline-block;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 12px;
            }
            .name {
              width: 120px;
              padding-right: 10px;
            }
            .time {
              width: 60px;
            }
            &:first-of-type{
              span{
                color: red;
              }
            }
          }
        }
      }
      .module-main{
        padding-left: 20px;
        padding-top: 0;
        padding-right: 0;
        padding-bottom: 0;
        .search{
          padding-top: 5px;
          padding-bottom: 5px;
          .search-input{
            display: table;
            width: 100%;
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
        }
        .nav{
          padding-top: 20px;
          height: 60px;
        }
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
              color: red;
              font-size: 24px;
            }
            .txt{
              width: 100%;
              text-align: center;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              color: red;
              font-size: 12px;
            }
          }
          .cavsElem{
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      }
    }
  }
}
.v-enter,
.v-leave-to {
  opacity: 0;
  transform: translateY(80px);
}
.v-enter-active,
.v-leave-active {
  transition: all 0.6s ease;
}
.v-move {
  transition: all 0.6s ease;
}
.v-leave-active {
  position: absolute;
}
</style>
