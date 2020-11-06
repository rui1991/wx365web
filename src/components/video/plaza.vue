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
            <el-radio-button :label="1" v-if="authority.indexOf(211) !== -1">直播广场</el-radio-button>
            <el-radio-button :label="2" v-if="authority.indexOf(212) !== -1">录像广场</el-radio-button>
          </el-radio-group>
        </div>
        <video-live v-if="plazaType === 1"></video-live>
        <video-record v-else-if="plazaType === 2"></video-record>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    if (this.authority.indexOf(211) !== -1) {
      this.plazaType = 1
    } else if (this.authority.indexOf(212) !== -1) {
      this.plazaType = 2
    }
  },
  components: {
    videoLive,
    videoRecord
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.videoPlaza,
      authority: state => state.detAuthority.videoPlaza
    }),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
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
