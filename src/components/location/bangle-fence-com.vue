<template>
  <div>
    <el-dialog title="编辑围栏" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="parentForm" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="围栏名称" prop="name">
          <el-input v-model.trim="parentForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="parentForm.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="deviceDialog = true">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 手环设备 -->
    <device-module
      :parentDialog="deviceDialog"
      :parentProid="projectId"
      :parentIds="parentForm.deviceId"
      @parentUpdata="deviceUpdata"
      @parentCancel="deviceCancel">
    </device-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入手环设备组件
import deviceModule from '@/components/location/bangle-checkbox'
export default{
  props: ['parentDialog', 'parentId', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入围栏名称', trigger: 'blur' }
        ],
        crewName: [
          { required: true, message: '请选择关联人员', trigger: 'change' }
        ]
      },
      disabled: false,
      deviceDialog: false
    }
  },
  components: {
    deviceModule
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
      let deviceId = this.parentForm.deviceId
      deviceId = deviceId.join(',')
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        type: 1,
        id: this.parentId,
        gps_type: 0,
        enclosure_name: this.parentForm.name,
        enc_type: this.parentForm.graphType,
        speed_limit: 0,
        gps_id: deviceId
      }
      if (this.parentForm.graphType === 0) {
        params.central_point = this.parentForm.circleCenter
        params.radius = this.parentForm.circleRadius
      } else if (this.parentType === 1) {
        params.xy = this.parentForm.polygonPath
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsEnclosure',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
          // 刷新列表
          this.$emit('parentUpdata')
          this.$message({
            showClose: true,
            message: '围栏编辑成功！',
            type: 'success'
          })
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
    },
    /* 手环设备 */
    deviceUpdata (data) {
      this.parentForm.crewName = data.names
      this.parentForm.deviceId = data.ids
      this.deviceDialog = false
    },
    deviceCancel () {
      this.deviceDialog = false
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>

</style>
