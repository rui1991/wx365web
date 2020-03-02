<template>
  <div class="video-record">
    <div class="search">
      <div class="item">
        <span>录制设备</span>
        <el-select v-model="search.channel" style="width: 160px;" filterable @change="channelChange" placeholder="请选择录制设备">
          <el-option
            v-for="item in channelOptions"
            :key="item.Channel"
            :label="item.Name"
            :value="item.Channel">
          </el-option>
        </el-select>
      </div>
      <div class="item">
        <span>选择年月</span>
        <el-date-picker
          style="width: 160px;"
          v-model="search.month"
          type="month"
          :clearable="false"
          value-format="yyyy-MM"
          @change="monthChange"
          placeholder="请选择年月">
        </el-date-picker>
      </div>
      <div class="item">
        <span>录制日期</span>
        <el-select v-model="search.date" style="width: 160px;" filterable @change="getDayRecord" placeholder="请选择录制日期">
          <el-option
            v-for="item in dateOptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </div>
      <div class="operate"></div>
    </div>
    <div class="list">
      <el-row :gutter="40">
        <el-col :span="8" class="item" v-for="item in listData" :key="item.startAt">
          <el-card :body-style="{ padding: '5px' }">
            <div style="text-align: center;">
              <img src="../../assets/images/snap.png" height="220" alt="">
            </div>
            <div class="hint">
              <p style="line-height: 30px; color: #00a65a;">录制时间：{{item.startAt | filterDate}}</p>
              <p style="line-height: 30px; color: #00a65a;">录制时长：{{item.duration | filterDuration}}</p>
            </div>
            <div style="height: 40px;">
              <el-button type="primary" @click="playClick(item.hls)">播放</el-button>
              <el-button type="primary" :disabled="downDisabled" @click="downClick(item.startAt)">下载</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- 播放 -->
    <el-dialog title="播放录像" :visible.sync="playDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="body-top">
        <h5 class="title">播放录像</h5>
      </div>
      <div class="body-content">
        <video-player class="video-player vjs-custom-skin"
                      ref="videoPlayer"
                      :playsinline="true"
                      :options="videoOptions"
                      @play="onPlayerPlay($event)"
        ></video-player>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closedClick">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import 'videojs-contrib-hls'
export default{
  data () {
    return {
      serve: '',
      search: {
        channel: '',
        month: '',
        date: ''
      },
      channelOptions: [],
      dateOptions: [],
      listData: [],
      playDialog: false,
      videoOptions: {
        autoplay: true,
        controls: true,
        height: '480',
        techOrder: ['html5'],
        sourceOrder: true,
        html5: { hls: { withCredentials: false } },
        sources: [
          {
            withCredentials: false,
            type: 'application/x-mpegURL',
            src: ''
          }
        ],
        notSupportedMessage: '此视频暂无法播放，请稍后再试'
      },
      whetherPlay: false,
      downDisabled: false
    }
  },
  created () {
    // 获取当前月份
    let mydata = new Date()
    let year = mydata.getFullYear()
    let month = mydata.getMonth() + 1 + ''
    month = month.padStart(2, '0')
    this.search.month = year + '-' + month
    // 获取IP与端口
    this.getServerIp()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  filters: {
    filterDate (value) {
      if (!value) return ''
      const year = value.substr(0, 4)
      const month = value.substr(4, 2)
      const day = value.substr(6, 2)
      const hour = value.substr(8, 2)
      const minutes = value.substr(10, 2)
      const seconds = value.substr(12, 2)
      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    },
    filterDuration (value) {
      if (!value) return ''
      const hours = Math.floor(value / 3600)
      const minute = Math.floor(value % 3600 / 60)
      const second = Math.floor(value % 3600 % 60)
      if (hours > 0) {
        return `${hours}时${minute}分${second}秒`
      } else if (minute > 0) {
        return `${minute}分${second}秒`
      } else {
        return `${second}秒`
      }
    }
  },
  methods: {
    // 获取IP与端口
    getServerIp () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
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
          this.serve = res.data.data1.mntList[0].mntip
          // 获取设备通道
          this.getChannelOptions()
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
    // 获取设备通道
    getChannelOptions () {
      this.$axios({
        method: 'get',
        url: this.serve + '/api/v1/getchannels'
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          // 全部数据
          const channelOptions = res.data.EasyDarwin.Body.Channels
          this.channelOptions = channelOptions
          if (channelOptions.length === 0) {
            return
          }
          this.search.channel = channelOptions[0].Channel
          // 按月查询录像
          this.getMonthRecord()
        } else {
          this.$message({
            showClose: true,
            message: '服务器连接失败！',
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
    // 切换通道
    channelChange () {
      // 清空日期
      this.search.date = ''
      // 清空列表
      this.listData = ''
      // 按月查询
      this.getMonthRecord()
    },
    monthChange () {
      // 清空日期
      this.search.date = ''
      // 清空列表
      this.listData = ''
      // 按月查询
      this.getMonthRecord()
    },
    // 切换月
    // 按月查询录像
    getMonthRecord () {
      let month = this.search.month
      month = month.replace(/-/g, '')
      this.$axios({
        method: 'get',
        url: this.serve + '/api/v1/record/querymonthly?id=' + this.search.channel + '&period=' + month
      }).then((res) => {
        let monthData = res.data
        monthData = monthData.split('')
        let dateOptions = []
        monthData.forEach((item, index) => {
          if (item === '1') {
            let day = index + 1
            let dateItem = this.search.month + '-' + day
            dateOptions.push(dateItem)
          }
        })
        this.dateOptions = dateOptions
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 按日查询录像
    getDayRecord () {
      let date = this.search.date
      if (!date) {
        return
      }
      date = date.replace(/-/g, '')
      this.$axios({
        method: 'get',
        url: this.serve + '/api/v1/record/querydaily?id=' + this.search.channel + '&period=' + date
      }).then((res) => {
        this.listData = res.data.list
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 播放
    playClick (hls) {
      this.playDialog = true
      const hlsUrl = this.serve + hls
      this.videoOptions.sources[0].src = hlsUrl
    },
    onPlayerPlay () {
      this.whetherPlay = true
    },
    // 关闭
    closedClick () {
      this.playDialog = false
    },
    // 下载
    downClick (time) {
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.serve + '/api/v1/record/download/' + this.search.channel + '/' + time
    }
  },
  beforeDestroy () {
    if (this.whetherPlay) {
      this.$refs.videoPlayer.dispose()
    }
  }
}
</script>

<style lang="less" scoped>
.video-record{
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
        margin-right: 5px;
        display: inline-block;
        line-height: 34px;
        font-size: 14px;
      }
    }
    .operate{
      display: table-cell;
    }
  }
}
</style>
