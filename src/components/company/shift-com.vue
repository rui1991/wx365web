<template>
  <el-dialog title="编辑班次" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item class="one-form" label="班次名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <div class="two-form">
        <el-form-item class="item" label="开始时间" prop="startTime">
          <el-time-picker
            style="width: 200px"
            arrow-control
            v-model="formData.startTime"
            :clearable="false"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="请选择开始时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item class="item" label="结束时间" prop="endTime">
          <el-time-picker
            style="width: 200px"
            arrow-control
            v-model="formData.endTime"
            :clearable="false"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="请选择结束时间">
          </el-time-picker>
        </el-form-item>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入班次名称', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },
      formData: {
        name: '',
        startTime: '',
        endTime: ''
      },
      disabled: false
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
    comInit () {
      this.formData = JSON.parse(JSON.stringify(this.parentForm))
    },
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    sendRequest () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        work_id: this.parentId,
        work_name: this.formData.name,
        start_time: this.formData.startTime,
        end_time: this.formData.endTime
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/alterScheduling',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
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
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.comInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.shift{
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
        display: table;
        width: 100%;
        height: 60px;
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
</style>
