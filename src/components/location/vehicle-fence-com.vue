<template>
  <div>
    <el-dialog title="编辑围栏" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="parentForm" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="围栏名称" prop="name">
          <el-input v-model.trim="parentForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="车辆" prop="carNums">
          <el-input :disabled="true" type="textarea" v-model="parentForm.carNums"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="deviceDialog = true">选择车辆</el-button>
        </el-form-item>
<!--        <el-form-item label="时速" prop="speed">-->
<!--          <el-input v-model.number="parentForm.speed" type="number" auto-complete="off">-->
<!--            <template slot="append">km/h</template>-->
<!--          </el-input>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 车辆设备 -->
    <device-module
      :parentDialog="deviceDialog"
      :parentProid="projectId"
      :parentFence="parentId"
      :parentIds="parentForm.deviceId"
      @parentUpdata="deviceUpdata"
      @parentCancel="deviceCancel">
    </device-module>
  </div>
</template>

<script>
/*
* type: 0新增，1编辑，2删除
* gps_type:  0手环    1车辆
* parentType: 图形类型  circle圆形   polygon多边形
* parentCenter：lng,lat  圆形中心点
* parentRadius： 圆形半径
* parentPath：lng,lat/lng,lat/lng,lat 多边形路径
* */
import { mapState } from 'vuex'
// 引入手环设备组件
import deviceModule from '@/components/location/vehicle-checkbox'
export default{
  props: ['parentDialog', 'parentId', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入围栏名称', trigger: 'blur' }
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
        gps_type: 1,
        enclosure_name: this.parentForm.name,
        enc_type: this.parentForm.graphType,
        speed_limit: this.parentForm.speed,
        gps_id: deviceId
      }
      if (this.parentForm.graphType === 0) {
        params.central_point = this.parentForm.circleCenter
        params.radius = this.parentForm.circleRadius
      } else if (this.parentForm.graphType === 1) {
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
      this.parentForm.carNums = data.names
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
