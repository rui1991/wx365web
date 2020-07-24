<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item>GPS车辆监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div id="container"></div>
      <el-collapse class="list-card" accordion>
        <el-collapse-item>
          <template slot="title">
            <i class="title-name">车辆列表</i>
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
              <router-link class="blue" :to="{ path: '/main/vehicle-fence' }">围栏</router-link>
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
import { mapState } from 'vuex'
import AMap from 'AMap'
export default{
  name: 'vehicleMonit',
  data () {
    return {
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
      toolSwitch: true
    }
  },
  created () {

  },
  mounted () {
    this.map = new AMap.Map('container', {
      center: [116.434381, 39.898515],
      zoom: 14
    })
    // 获取项目坐标
    this.getProjectDetails()
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
    // 查看单个车辆
    listChange (id) {
      this.itemId = id
      console.log(id)
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
