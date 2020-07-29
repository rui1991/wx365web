<template>
  <el-dialog title="足迹详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="date">
      日期
      <el-date-picker
        v-model="date"
        value-format="yyyy-MM-dd"
        @change="dateChange"
        type="date"
        :clearable="false"
        placeholder="选择日期">
      </el-date-picker>
    </div>
    <el-table class="select-table" :data="tableData" style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="ct" :show-overflow-tooltip="true" label="时间"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="位置">
        <template slot-scope="scope">
          <span>{{ scope.row.city }}{{ scope.row.dist }}{{ scope.row.str }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="是否停留">
        <template slot-scope="scope">
          <span v-if="scope.row.tag === 0">经过</span>
          <span v-else-if="scope.row.tag === 1">{{ scope.row.ct | countDuration(scope.row.ut) }}</span>
          <span v-else-if="scope.row.tag === 2">没数据</span>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* type: 0 设置   1 清除
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentDeviceNum'],
  data () {
    return {
      date: '2020-07-23',
      tableData: []
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    spoorInit () {
      this.date = this.$common.getNowDate('yyyy-mm-dd')
      this.getSpoorList()
    },
    getSpoorList () {
      let params = {
        MID: this.parentDeviceNum,
        date: this.date
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selBraceletGpsTrajectory',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.data.pos || []
          let listData = []
          resData.forEach(item => {
            let itemArr = item.detail || []
            itemArr.forEach(inItem => {
              inItem.city = item.city
            })
            listData = listData.concat(itemArr)
          })
          this.tableData = listData
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
    // 选择日期
    dateChange () {
      this.getSpoorList()
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  filters: {
    countDuration (start, end) {
      let startTime = new Date(start).getTime()
      let endTime = new Date(end).getTime()
      let timeDiffer = endTime - startTime
      // 天
      let day = timeDiffer / (1000 * 60 * 60 * 24)
      day = Math.floor(day)
      // 时
      let hours = timeDiffer / (1000 * 60 * 60) - day * 24
      hours = Math.floor(hours)
      // 分
      let minute = timeDiffer / (1000 * 60) - (24 * 60 * day) - (60 * hours)
      minute = Math.floor(minute)
      // 秒
      let seconds = (timeDiffer / 1000) % 60
      if (day > 0) {
        return '停留' + day + '天' + hours + '小时' + minute + '分钟' + seconds + '秒'
      } else if (hours > 0) {
        return '停留' + hours + '小时' + minute + '分钟' + seconds + '秒'
      } else if (minute > 0) {
        return '停留' + minute + '分钟' + seconds + '秒'
      } else if (seconds > 0) {
        return '停留' + seconds + '秒'
      }
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.spoorInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .date {
    margin-bottom: 10px;
  }
</style>
