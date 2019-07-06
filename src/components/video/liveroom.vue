<template>
  <div class="video-liveroom">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>视频监控</el-breadcrumb-item>
      <el-breadcrumb-item><router-link to="/main/video-plaza">视频广场</router-link></el-breadcrumb-item>
      <el-breadcrumb-item>视频直播</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="title">
      <el-button type="primary" class="btn" icon="iconfont icon-return" @click="returnBack">返回</el-button>
      <p class="name">{{name}}</p>
    </div>
    <div class="content">
      <div class="player">
        <video-player class="video-player vjs-custom-skin"
                      ref="videoPlayer"
                      :playsinline="true"
                      :options="videoOptions"

        ></video-player>
      </div>
      <div class="operate">
        <el-button type="primary" :disabled="recordDisabled" @click="getVideoToken">开始录像</el-button>
        <el-button type="primary" :disabled="!recordDisabled" @click="endClick">停止录像</el-button>
        <p class="hint" v-show="recordDisabled">录制时长：{{recordDuration}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入视频播放组件
import 'videojs-flash'
// import 'videojs-contrib-hls'
// 引入md5
import Md5 from 'js-md5'
export default{
  name: 'videoLiveroom',
  data () {
    return {
      name: '',
      videoOptions: {
        autoplay: true,
        controls: true,
        height: '560',
        techOrder: ['flash', 'html5'],
        sourceOrder: true,
        flash: {
          hls: { withCredentials: false },
          swf: './static/media/video-js.swf'
        },
        html5: { hls: { withCredentials: false } },
        sources: [
          {
            type: 'rtmp/hls',
            src: ''
          }
        ],
        poster: '',
        notSupportedMessage: '此视频暂无法播放，请稍后再试'
      },
      basics: {
        serve: '',
        userName: '',
        userPwd: ''
      },
      playBeat: null,
      recordBeat: null,
      recordDisabled: false,
      recordCount: 0,
      recordDuration: '00:00:00'
    }
  },
  created () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', true)
    // 获取播放参数
    this.name = this.$route.query.name
    this.videoOptions.sources[0].src = this.$route.query.hls
    // 获取IP与端口
    this.getServerIp()
    // 心跳定时器
    this.playBeat = setInterval(() => {
      this.sendHeartbeat()
    }, 60000)
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
    // 获取IP与端口
    getServerIp () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        page: 1,
        limit1: 1,
        conditions: ''
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/selMntip',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          if (res.data.data1.mntList.length === 0) {
            return
          }
          this.basics = {
            serve: res.data.data1.mntList[0].mntip,
            userName: res.data.data1.mntList[0].login_name,
            userPwd: res.data.data1.mntList[0].login_pwd
          }
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
    // 获取token
    getVideoToken () {
      let userPwd = this.basics.userPwd
      userPwd = Md5(userPwd)
      this.$axios({
        method: 'get',
        url: this.basics.serve + '/api/v1/login?username=' + this.basics.userName + '&password=' + userPwd
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          const videoToken = res.data.EasyDarwin.Body.Token
          this.videoToken = videoToken
          this.startClick()
        } else {
          this.$message({
            showClose: true,
            message: '视频服务器登录失败',
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
    // 开始录制
    startClick () {
      let params = {
        mnturl: this.basics.serve + '/api/v1/startrecord?channel=' + this.$route.query.channel,
        token: this.videoToken
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/sendURL',
        data: params
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          this.recordDisabled = true
          this.$message({
            showClose: true,
            message: '视频已开始录制！'
          })
          this.recordBeat = setInterval(() => {
            let count = this.recordCount++
            let hours = Math.floor(count / 3600)
            hours < 10 ? hours = '0' + hours : hours = hours + ''
            let minute = Math.floor(count % 3600 / 60)
            minute < 10 ? minute = '0' + minute : minute = minute + ''
            let second = Math.floor(count % 3600 % 60)
            second < 10 ? second = '0' + second : second = second + ''
            const recordDuration = `${hours}:${minute}:${second}`
            this.recordDuration = recordDuration
          }, 1000)
        } else {
          this.$message({
            showClose: true,
            message: '视频录制失败！',
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '视频录制失败！',
          type: 'error'
        })
      })
    },
    // 结束录制
    endClick () {
      let params = {
        mnturl: this.basics.serve + '/api/v1/stoprecord?channel=' + this.$route.query.channel,
        token: this.videoToken
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/sendURL',
        data: params
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          this.recordDisabled = false
          this.$message({
            showClose: true,
            message: '视频录制成功！',
            type: 'success'
          })
          // 清除录制时长
          this.recordCount = 0
          this.recordDuration = '00:00:00'
          // 清除录制时长定时器
          clearInterval(this.recordBeat)
        } else {
          this.$message({
            showClose: true,
            message: '视频录制失败！',
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '视频录制失败！',
          type: 'error'
        })
      })
    },
    // 发送心跳
    sendHeartbeat () {
      this.$axios({
        method: 'get',
        url: this.$route.query.serve + '/api/v1/getchannelstream?channel=' + this.$route.query.channel
      }).then((res) => {}).catch(() => {
        this.$message({
          showClose: true,
          message: '发送心跳失败！',
          type: 'error'
        })
      })
    },
    // 返回
    returnBack () {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    // 设置全局项目启用
    this.$store.commit('setProDisabled', false)
    // 清除录制时长定时器
    clearInterval(this.recordBeat)
    // 清除心跳定时器
    clearInterval(this.playBeat)
    // 销毁播放器
    this.$refs.videoPlayer.dispose()
  }
}
</script>

<style lang="less" scoped>
.video-liveroom{
  padding-top: 20px;
  .title{
    height: 60px;
    margin-top: 20px;
    position: relative;
    background-color: #f1f1f1;
    .btn{
      position: absolute;
      left: 20px;
      top: 10px;
    }
    .name{
      line-height: 60px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      color: #142c4b;
    }
  }
  .content{
    padding: 10px;
    .operate{
      margin-top: 10px;
      .hint{
        display: inline-block;
        margin-left: 20px;
        line-height: 35px;
        color: red;
      }
    }
  }
}
</style>
