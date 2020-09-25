<template>
  <el-dialog title="设置倍数" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="倍数" prop="rateNum">
        <el-input v-model.number="formData.rateNum" type="number" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* type  1:添加，2设置倍数，3：移除
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentDeviceNum'],
  data () {
    return {
      formLabelWidth: '100px',
      sectorOptions: [],
      rules: {
        rateNum: [
          { required: true, message: '请输入倍数', trigger: 'blur' }
        ]
      },
      formData: {
        rateNum: 1
      },
      disabled: false
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
    rateInit () {
      this.formData = {
        rateNum: 1
      }
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
        type: 2,
        user_id: this.userId,
        project_id: this.projectId,
        wm_number: this.parentDeviceNum,
        multiple: this.formData.rateNum
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setWaterMeter',
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
        this.rateInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
