<template>
  <el-dialog title="定位频率" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="频率" prop="count">
        <el-input placeholder="请输入频率" type="number" v-model.number="formData.count">
          <template slot="append">秒</template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
/*
* type: 0  添加   1编辑    2删除
* gps_number: 设备号
* fqcy: 频率
* */
export default{
  props: ['parentDialog', 'parentGpsType', 'parentDeviceNum', 'parentFreqNum'],
  data () {
    let checkCount = (rule, value, callback) => {
      if (Number.isInteger(value)) {
        if (value < 10) {
          callback(new Error('频率最低不得低于10秒'))
        } else {
          callback()
        }
      } else {
        callback(new Error('频率必须为整数'))
      }
    }
    return {
      formLabelWidth: '100px',
      rules: {
        count: [
          { required: true, validator: checkCount, trigger: 'blur' }
        ]
      },
      formData: {
        count: 60
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
    freqInit () {
      if (this.parentFreqNum) {
        this.formData.count = Number.parseInt(this.parentFreqNum)
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
        // type: 1,
        // user_id: this.userId,
        // project_id: this.projectId,
        gps_type: this.parentGpsType,
        gps_number: this.parentDeviceNum,
        fqcy: this.formData.count
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsLocationFrequency',
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
        this.freqInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
