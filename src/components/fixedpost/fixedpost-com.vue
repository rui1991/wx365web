<template>
  <el-dialog title="编辑打卡规则" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="add">
      <el-button type="primary" @click="addTime">添加时段</el-button>
    </div>
    <div class="times">
      <el-row class="times-item" v-for="(item, index) in times" :key="index">
        <el-col :span="14">
          时间段：
          <el-time-picker
            style="width: 240px;"
            is-range
            arrow-control
            v-model="item.time"
            :clearable="false"
            value-format="HH:mm"
            format="HH:mm"
            :time-arrow-control="true"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围">
          </el-time-picker>
        </el-col>
        <el-col :span="6">
          <el-input v-model.number="item.frequency" auto-complete="off" type="number">
            <template slot="append">次</template>
          </el-input>
        </el-col>
        <el-col :span="4" class="icon">
          <i class="el-icon-delete red" style="cursor: pointer;" @click="delTime(index)"></i>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentTimes'],
  data () {
    return {
      times: [],
      disabled: true
    }
  },
  created () {

  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 初始化数据
    comInit () {
      const times = this.formatTimes()
      const length = times.length
      if (length === 0) {
        this.disabled = true
      } else {
        this.disabled = false
      }
      this.times = times
    },
    formatTimes () {
      const timeData = this.parentTimes
      let times = []
      timeData.forEach(item => {
        times.push(
          {
            time: item.time.split('-'),
            frequency: item.frequency
          }
        )
      })
      return times
    },
    // 添加时段
    addTime () {
      this.times.push(
        {
          time: ['00:00', '23:59'],
          frequency: 1
        }
      )
    },
    // 删除时段
    delTime (index) {
      this.times.splice(index, 1)
    },
    // 确定
    submitForm () {
      // 全部时段
      const allData = this.times
      let allTime = []
      let detTime = []
      allData.forEach(item => {
        let frequency = Number.parseInt(item.frequency)
        if (frequency <= 0) {
          frequency = 1
        }
        const detItem = this.proTimeNode(item.time[0], item.time[1], frequency)
        detTime = detTime.concat(detItem)
        allTime.push(
          {
            time: item.time[0] + '-' + item.time[1],
            frequency: frequency
          }
        )
      })
      allTime = JSON.stringify(allTime)
      detTime = detTime.join('/')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.parentId,
        all: allTime,
        det: detTime
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/setPermanentPosition',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 刷新列表
          this.$emit('parentUpdata')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    },
    // 处理时间段
    proTimeNode (time1, time2, count) {
      // 开始时间
      const startTime = this.proTimeSecond(time1)
      // 结束时间
      const endTime = this.proTimeSecond(time2)
      // 单位时间
      const unitTime = Math.round((endTime - startTime) / count)
      // 时间段
      let timeNodes = []
      for (let i = 0; i < count; i++) {
        let startNode = startTime + unitTime * i
        startNode = this.formatTimeNode(startNode)
        let endNode = startTime + unitTime * (i + 1)
        endNode = this.formatTimeNode(endNode)
        let nodeItem = startNode + '-' + endNode
        timeNodes.push(nodeItem)
      }
      return timeNodes
    },
    // 格式化秒数
    proTimeSecond (time) {
      const timeArr = time.split(':')
      const minute = Number.parseInt(timeArr[0])
      const second = Number.parseInt(timeArr[1])
      return minute * 60 + second
    },
    // 格式化时间
    formatTimeNode (time) {
      let minute = Number.parseInt(time / 60) + ''
      if (minute === '24') {
        return '23:59'
      }
      minute = minute.padStart(2, '0')
      let second = time % 60 + ''
      second = second.padStart(2, '0')
      return minute + ':' + second
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.comInit()
      }
    },
    times (val, oldVal) {
      if (this.parentDialog) {
        if (val.length === 0) {
          this.disabled = true
        } else {
          this.disabled = false
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .add{
    margin-bottom: 10px;
    text-align: right;
  }
  .times{
    .times-item {
      margin-bottom: 10px;
      .icon{
        line-height: 40px;
        text-align: right;
        font-size: 20px;
      }
    }
  }
</style>
