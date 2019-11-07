<template>
  <div class="envmonit">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>环境监控管理</el-breadcrumb-item>
          <el-breadcrumb-item>环境监控设置</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="nav">
          <el-radio-group v-model="navActive">
            <el-radio-button :label="1">环境监控传感器</el-radio-button>
            <el-radio-button :label="2">环境监控网关</el-radio-button>
          </el-radio-group>
        </div>
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive"/>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default{
  name: 'envmonit',
  data () {
    return {
      navActive: '1'
    }
  },
  created () {
    const nowPath = this.$route.path
    if (nowPath === '/main/envmonit/envccd') {
      this.navActive = '1'
    } else if (nowPath === '/main/envmonit/envswg') {
      this.navActive = '2'
    }
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
 .envmonit{
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
     .module-main{
       padding: 10px;
       margin-left: 20px;
       margin-right: 20px;
       background: #ffffff;
       .nav{
         padding-bottom: 20px;
       }
     }
   }
 }
</style>
