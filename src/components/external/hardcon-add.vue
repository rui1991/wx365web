<template>
  <!-- 新增 -->
  <el-dialog title="新增设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="设备类型" prop="type">
        <el-select style="width: 100%;" v-model="formData.type" placeholder="请选择设备类型">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备mac" prop="mac">
        <el-input v-model.trim="formData.mac" auto-complete="off"></el-input>
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
  props: ['parentDialog', 'parentId'],
  data () {
    let checkMac = (rule, value, callback) => {
      let regex = /^[a-zA-Z0-9]*$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac格式有误，请认真核对'))
        }
      } else {
        callback(new Error('请输入设备的mac地址'))
      }
    }
    return {
      typeOptions: [
        {
          label: '采集器',
          value: 'cjk'
        },
        {
          label: '数据网关',
          value: 'sjwg'
        }
      ],
      formLabelWidth: '100px',
      rules: {
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        mac: [
          { required: true, validator: checkMac, trigger: 'blur' }
        ]
      },
      formData: {
        type: 'cjk',
        mac: ''
      },
      disabled: false
    }
  },
  created () {

  },
  methods: {
    // 初始化数据
    addInit () {
      this.formData = {
        type: 'cjk',
        mac: ''
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
      let mac = this.formData.mac
      mac = mac.replace(/:/g, '').toLowerCase()
      let params = {
        ogz_id: this.parentId,
        device_type: this.formData.type,
        mac: mac
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.deviceApi() + '/device/v1/addDevice',
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
        this.addInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
