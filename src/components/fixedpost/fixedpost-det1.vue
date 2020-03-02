<template>
  <el-dialog title="打卡详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="450">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="times" label="时间"></el-table-column>
      <el-table-column label="打卡结果">
        <template slot-scope="scope">
          <span v-if="parentType === 1">{{ scope.row.sucess_record }}</span>
          <span v-else-if="parentType === 2">{{ scope.row.failed_record }}</span>
          <span v-else-if="parentType === 3">{{ scope.row.abnormal_record }}</span>
        </template>
      </el-table-column>
    </el-table>
    <p style="font-size: 12px; color: red; line-height: 30px;" v-show="parentType === 3">*规定时间段内打卡次数超过10次为异常</p>
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
    // 初始化数据
    detInit () {
      this.tableData = []
      const type = this.parentType
      if (type === 1) {
        this.getSucessDet()
      } else if (type === 2) {
        this.getFailedDet()
      } else if (type === 3) {
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
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selSucessPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1
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
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selFailedPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1
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
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selAbnormalPermanent',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1
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
.fixedpost{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              width: 70px;
              display: inline-block;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align: middle;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
