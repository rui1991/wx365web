<template>
  <el-dialog title="规则详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" stripe style="width: 100%" max-height="420">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="start_time" label="开始时间"></el-table-column>
      <el-table-column prop="end_time" label="结束时间"></el-table-column>
      <el-table-column label="打卡次数">
        <template slot-scope="scope">
          <span>1</span>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentTimes'],
  data () {
    return {
      tableData: []
    }
  },
  methods: {
    detInit () {
      const times = this.parentTimes
      let tableData = []
      times.forEach(item => {
        const time = item.time.split('-')
        const detItem = this.proTimeDet(time[0], time[1], item.frequency)
        tableData = tableData.concat(detItem)
      })
      this.tableData = tableData
    },
    // 处理时间段
    proTimeDet (time1, time2, count) {
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
        timeNodes.push(
          {
            start_time: startNode,
            end_time: endNode
          }
        )
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
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
