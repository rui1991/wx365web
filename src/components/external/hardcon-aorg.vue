<template>
  <el-dialog title="新增组织" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="组织名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="组织类型" prop="type">
        <el-input v-model.trim="formData.type" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="打卡URL" prop="upurl">
        <el-input v-model.trim="formData.upurl" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="心跳URL" prop="beaturl">
        <el-input v-model.trim="formData.beaturl" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="有效期" prop="indate">
        <el-input v-model.trim="formData.indate" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default{
  props: ['parentDialog', 'parentId', 'parentName'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入组织名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入组织类型', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        type: '',
        upurl: '',
        beaturl: '',
        indate: ''
      },
      disabled: false
    }
  },
  created () {

  },
  methods: {
    // 初始化数据
    orgInit () {
      this.formData = {
        name: '',
        type: '',
        upurl: '',
        beaturl: '',
        indate: ''
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
        parent_ogz: this.parentId,
        parent_name: this.parentName,
        ogz_name: this.formData.name,
        ogz_type: this.formData.type,
        up_url: this.formData.upurl,
        heartbeat_url: this.formData.beaturl,
        close_date: this.formData.indate
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.deviceApi() + '/device/v1/addOgz',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
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
        this.orgInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
