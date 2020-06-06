<template>
  <div class="video-plaza">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>视频监控</el-breadcrumb-item>
          <el-breadcrumb-item>视频广场</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="nav">
          <el-radio-group v-model="plazaType">
            <el-radio-button :label="1">直播广场</el-radio-button>
            <el-radio-button :label="2">录像广场</el-radio-button>
          </el-radio-group>
        </div>
        <video-live v-if="plazaType === 1"></video-live>
        <video-record v-else-if="plazaType === 2"></video-record>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// 导入直播广场
import videoLive from '@/components/video/live'
// 导入录像广场
import videoRecord from '@/components/video/record'
export default{
  name: 'videoPlaza',
  data () {
    return {
      plazaType: 1
    }
  },
  created () {

  },
  components: {
    videoLive,
    videoRecord
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.video-plaza{
  height: 100%;
  padding-bottom: 20px;
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
    }
  }
}
</style>
