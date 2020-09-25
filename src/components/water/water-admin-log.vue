<template>
  <el-dialog title="历史抄表" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="dialog-search">
      <div class="date">
        <span>时段</span>
        <el-date-picker
          style="width: 280px;"
          v-model="date"
          type="daterange"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="dateChange">
        </el-date-picker>
      </div>
      <el-button type="primary" :disabled="deriveDisabled" @click="deriveClick">导出</el-button>
    </div>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420">
      <el-table-column type="index" width="55" label="序号"></el-table-column>
      <el-table-column prop="copy_date" :show-overflow-tooltip="true" label="抄表时间"></el-table-column>
      <el-table-column prop="copy_num" :show-overflow-tooltip="true" label="读表数"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentName', 'parentCode'],
  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      date: [],
      tableData: [],
      multipleSelection: [],
      disabled: true,
      deriveDisabled: false
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
    logInit () {
      // 获取当前月份
      const nowMonth = this.$common.getNowDate('yyyy-mm')
      const startDate = nowMonth + '-01'
      // 当前日期
      const nowDate = this.$common.getNowDate('yyyy-mm-dd')
      this.date = [startDate, nowDate]
      // 清空数据
      this.tableData = []
      // 获取月用水量详情
      this.getDetails()
    },
    // 选择时段
    dateChange () {
      // 获取月用水量详情
      this.getDetails()
    },
    // 获取月用水量详情
    getDetails () {
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        user_name: this.parentName,
        user_code: this.parentCode,
        start_date: this.date[0],
        end_date: this.date[1]
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selHistoryWaterMeterUse',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let resData = res.data.data1
          this.tableData = resData
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
    // 取消
    closeClick () {
      this.$emit('parentClose')
    },
    /* 导出 */
    deriveClick () {
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        user_name: this.parentName,
        user_code: this.parentCode,
        start_date: this.date[0],
        end_date: this.date[1]
      }
      params = this.$qs.stringify(params)
      this.deriveDisabled = true
      setTimeout(() => {
        this.deriveDisabled = false
      }, 5000)
      window.location.href = this.gpsApi() + '/waterMeterHistoryExport?' + params
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.logInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .dialog-search{
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .date{
      display: flex;
      align-items: center;
      span{
        margin-right: 5px;
      }
    }
  }
</style>
