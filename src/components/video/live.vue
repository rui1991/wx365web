<template>
  <div class="video-live">
    <el-row :gutter="40">
      <el-col :span="8" class="item" v-for="item in listData" :key="item.Channel">
        <el-card :body-style="{ padding: '5px' }">
          <div @click="skipRoom(item.Channel)">
            <img :src="serve + item.SnapURL" width="100%" height="240" class="image">
            <div style="height: 40px; padding: 10px;">
              <span class="left">{{item.Name}}</span>
              <span class="right" v-if="item.Online === 1">在线</span>
              <span class="right" v-else>在线</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  data () {
    return {
      serve: '',
      listData: []
    }
  },
  created () {
    // 获取IP与端口
    this.getServerIp()
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
          this.serve = res.data.data1.mntList[0].mntip
          // 获取列表
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
    // 获取列表
    getListData () {
      this.$axios({
        method: 'get',
        url: this.serve + '/api/v1/getchannels'
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          // 全部数据
          const listData = res.data.EasyDarwin.Body.Channels
          this.listData = listData
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
    // 跳转
    skipRoom (channel) {
      this.$axios({
        method: 'get',
        url: this.serve + '/api/v1/getchannelstream?channel=' + channel
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          this.$router.push({path: '/main/video-liveroom', query: { serve: this.serve, channel: channel, name: res.data.EasyDarwin.Body.ChannelName, hls: res.data.EasyDarwin.Body.URL }})
        } else {
          this.$message({
            showClose: true,
            message: '播放失败！',
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
  }
}
</script>

<style lang="less" scoped>
.video-live{
  margin-top: 10px;
  .item{
    cursor: pointer;
  }
}
</style>
