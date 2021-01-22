<template>
  <el-dialog title="SOS号码设置" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="divide-from" :model="formData" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="SOS号码1">
        <el-input v-model.trim="formData.phone1" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="SOS号码2">
        <el-input v-model.trim="formData.phone2" auto-complete="off"></el-input>
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
* type: 0  添加   1编辑    2删除
* gps_number: 设备号
* gps_phone: 通讯卡
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentUid', 'parentPhone'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        phone1: '',
        phone2: ''
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
    sosInit () {
      if (this.parentPhone) {
        let phone = this.parentPhone.split(',')
        this.formData.phone1 = phone[0]
        this.formData.phone2 = phone[1] || ''
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
      let phone1 = this.formData.phone1
      let phone2 = this.formData.phone2
      let phone = ''
      if (phone1) {
        if (phone2) {
          phone = phone1 + ',' + phone2
        } else {
          phone = phone1
        }
      } else {
        if (phone2) {
          phone = phone2
        }
      }
      let params = {
        uid: this.parentUid,
        sos_phone: phone
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsBraceletSos',
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
        this.sosInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
