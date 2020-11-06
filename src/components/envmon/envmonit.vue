<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>环境监控管理</el-breadcrumb-item>
        <el-breadcrumb-item>环境监控设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="nav">
        <el-radio-group v-model="navActive">
          <el-radio-button :label="1" v-if="envccd">环境监控传感器</el-radio-button>
          <el-radio-button :label="2" v-if="envswg">环境监控网关</el-radio-button>
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
import { mapState } from 'vuex'
export default{
  name: 'envmonit',
  data () {
    return {
      navActive: '1'
    }
  },
  created () {
    if (this.envccd) {
      this.$router.push({ path: '/main/envmonit/envccd' })
      this.navActive = '1'
    } else if (this.envswg) {
      this.$router.push({ path: '/main/envmonit/envswg' })
      this.navActive = '2'
    }
  },
  computed: {
    ...mapState('user', {
      envccd: state => state.modAuthority.envccd,
      envswg: state => state.modAuthority.envswg
    })
  },
  watch: {
    navActive (val, oldVal) {
      if (val === 1) {
        this.$router.push({ path: '/main/envmonit/envccd' })
      } else if (val === 2) {
        this.$router.push({ path: '/main/envmonit/envswg' })
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
