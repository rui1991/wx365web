<template>
  <el-dialog title="点名详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420">
      <el-table-column prop="user_name" label="姓名"></el-table-column>
      <el-table-column prop="adate" label="日期"></el-table-column>
      <el-table-column prop="atime" label="点名时间段"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span>已打卡</span>
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
* sf: 打卡状态   1 已打卡；  2 未打卡
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentUid', 'parentDate'],
  data () {
    return {
      tableData: []
    }
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
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        userN_id: this.parentUid,
        this_date: this.parentDate
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selRollCallOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          const tableData = resData.filter(item => {
            return item.sf === 1
          })
          this.tableData = tableData
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

</style>
