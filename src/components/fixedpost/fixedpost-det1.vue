<template>
  <el-dialog title="打卡详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog" class="fixedpost-rep">
    <div
      style="min-height: 120px;"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.6)">
      <el-table class="select-table" :data="tableData1" style="width: 100%" max-height="450" v-show="parentType === 1">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="times" label="时间"></el-table-column>
        <el-table-column prop="user_name" label="当班人"></el-table-column>
      </el-table>
      <el-table class="select-table" :data="tableData2" style="width: 100%" max-height="450" v-show="parentType === 2">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="times" label="时间"></el-table-column>
        <el-table-column prop="failed_record" label="打卡结果"></el-table-column>
      </el-table>
      <el-table class="select-table" :data="tableData3" style="width: 100%" max-height="450" v-show="parentType === 3">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="times" label="时间"></el-table-column>
        <el-table-column prop="abnormal_record" label="打卡结果"></el-table-column>
      </el-table>
      <p style="font-size: 12px; color: red; line-height: 30px;" v-show="parentType === 3">*有感模式下固定岗在规定时间段内打卡次数超过10次为异常</p>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentDate', 'parentPos', 'parentType'],
  data () {
    return {
      loading: false,
      tableData1: [],
      tableData2: [],
      tableData3: []
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
    /*
    * 参数说明：
    *   parentType： 1.打卡成功   2.未打卡   3.打卡异常
    * */
    // 初始化数据
    detInit () {
      const type = this.parentType
      if (type === 1) {
        this.tableData1 = []
        this.getSucessDet()
      } else if (type === 2) {
        this.tableData2 = []
        this.getFailedDet()
      } else if (type === 3) {
        this.tableData3 = []
        this.getAbnormalDet()
      }
    },
    // 成功详情
    getSucessDet () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentPos,
        this_date: this.parentDate
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selSucessPermanent',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.tableData1 = res.data.data1
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 未打卡详情
    getFailedDet () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentPos,
        this_date: this.parentDate
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selFailedPermanent',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.tableData2 = res.data.data1
        } else {
          this.loading = false
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
    // 异常详情
    getAbnormalDet () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentPos,
        this_date: this.parentDate
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selAbnormalPermanent',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.tableData3 = res.data.data1
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
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
