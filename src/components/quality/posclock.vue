<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
        <el-breadcrumb-item>位置打卡记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="nav">
        <el-radio-group v-model="navActive" @change="navChange">
          <el-radio-button :label="1">位置打卡记录汇总</el-radio-button>
          <el-radio-button :label="2">人员打卡记录详情</el-radio-button>
        </el-radio-group>
      </div>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"/>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"/>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default{
  name: 'posclock',
  data () {
    return {
      navActive: ''
    }
  },
  mounted () {
    const navActive = this.posclockNav
    this.navActive = navActive
    if (navActive === 1) {
      this.$router.push({ path: '/main/posclock/posclockall' })
    } else if (navActive === 2) {
      this.$router.push({ path: '/main/posclock/posclockdet' })
    }
  },
  computed: {
    ...mapState('other', [
      'companyId',
      'projectId',
      'posclockNav'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setPosclockNav'
    ]),
    navChange (val) {
      this.setPosclockNav(val)
      if (val === 1) {
        this.$router.push({ path: '/main/posclock/posclockall' })
      } else if (val === 2) {
        this.$router.push({ path: '/main/posclock/posclockdet' })
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .module-main .nav{
    padding-bottom: 20px;
  }
</style>
