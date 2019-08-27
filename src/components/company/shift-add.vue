<template>
  <el-dialog title="新增班次" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
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
  props: ['parentDialog'],
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
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        work_name: this.formData.name,
        start_time: this.formData.startTime,
        end_time: this.formData.endTime
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/addScheduling',
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
  }
}
</script>

<style lang="less" scoped>

</style>
