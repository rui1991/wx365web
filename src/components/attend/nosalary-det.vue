<template>
  <el-dialog title="出勤详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="det-title">
      <span>{{ parentUname }}</span>
      <span>{{ parentUsector }}</span>
      <span>{{ parentUdate }}</span>
    </div>
    <el-table class="select-table" :data="tableData" style="width: 100%;">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="in_time" label="进入时间"></el-table-column>
      <el-table-column prop="in_position_name" label="进入位置" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="out_time" label="离开时间"></el-table-column>
      <el-table-column prop="out_position_name" label="离开位置" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="att_long" label="出勤时长"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentUname', 'parentUid', 'parentUsector', 'parentUdate'],
  data () {
    return {
      tableData: []
    }
  },
  created () {

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
  methods: {
    detInit () {
      this.tableData = []
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        user_id: this.parentUid,
        project_id: this.projectId,
        at_date: this.parentUdate
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/att/selAttReportDetails',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1.dates
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
.det-title{
  height: 35px;
  display: flex;
  span{
    flex-grow: 1;
    font-size: 14px;
    color: #4fa5f2;
  }
}
</style>
