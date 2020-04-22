<template>
  <el-dialog title="标准详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="模板名称">
        <el-input :disabled="true" v-model="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="模板类型">
        <el-input :disabled="true" v-model="formData.type"></el-input>
      </el-form-item>
      <el-form-item label="执行部门">
        <el-input :disabled="true" v-model="formData.sector"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input :disabled="true" type="textarea" v-model="formData.remark"></el-input>
      </el-form-item>
    </el-form>
    <el-table class="select-table" :data="itemTable" style="width: 100%" v-show="itemTable.length > 0">
      <el-table-column prop="path" :show-overflow-tooltip="true" label="路径"></el-table-column>
      <el-table-column prop="inspect_name" :show-overflow-tooltip="true" label="检查项"></el-table-column>
      <el-table-column prop="inspect_contents" :show-overflow-tooltip="true" label="检查内容及要求"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        type: '',
        sector: '',
        remark: ''
      },
      itemTable: []
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
      this.formData = {
        name: '',
        type: '',
        sector: '',
        remark: ''
      }
      this.itemTable = []
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        project_id: this.projectId,
        os_ids: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1[0]
          // 名称
          this.formData.name = itemData.standard_name
          // 类型
          const typeState = itemData.standard_type
          let type = ''
          if (typeState === 1) {
            type = '设备标准类'
          } else if (typeState === 2) {
            type = '巡检标准类'
          }
          this.formData.type = type
          // 执行部门
          this.formData.sector = itemData.ogz_name
          // 描述
          this.formData.remark = itemData.remarks

          // 检查项列表
          this.itemTable = itemData.details
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
    // 获取检查项详情
    getTemContent (ids) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        ins_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temData = res.data.data1
          this.formData.temData = temData
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
.norm{
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
