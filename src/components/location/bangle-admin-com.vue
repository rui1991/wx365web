<template>
  <el-dialog title="编辑手环" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="divide-from" :model="parentForm" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="手环IMEI" prop="deviceNum">
        <el-input v-model.trim="parentForm.deviceNum" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属部门" prop="sector">
        <el-select v-model="parentForm.sector" disabled placeholder="请选择所属部门">
          <el-option
            v-for="item in parentSectorOptions"
            :key="item.base_id"
            :label="item.name"
            :value="item.base_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="绑定人" prop="crewId">
        <el-select v-model="parentForm.crewId" clearable filterable placeholder="请选择绑定人">
          <el-option
            v-for="item in crewOptions"
            :key="item.user_id"
            :label="item.user_name"
            :value="item.user_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="通讯卡" prop="mesCard">
        <el-input v-model.trim="parentForm.mesCard" auto-complete="off"></el-input>
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
  props: ['parentDialog', 'parentSectorOptions', 'parentId', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      crewOptions: [],
      rules: {
        deviceNum: [
          { required: true, message: '请输入手环IMEI', trigger: 'blur' }
        ],
        sector: [
          { required: true, message: '请输选择所属部门', trigger: 'change' }
        ]
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
    comInit () {
      // 获取部门人员
      const sector = this.parentForm.sector
      this.getCrewData(sector)
    },
    // 切换部门
    sectionChang (val) {
      // 清空已选人员
      this.parentForm.crewId = ''
      // 获取部门人员
      this.getCrewData(val)
    },
    // 获取部门人员
    getCrewData (id) {
      let params = {
        ogz_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsBraceletCanBindUsers',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewOptions = res.data.data1 || []
          if (this.parentForm.crewId) {
            crewOptions.push({
              user_id: this.parentForm.crewId,
              user_name: this.parentForm.crewName
            })
          }
          this.crewOptions = crewOptions
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
        type: 1,
        user_id: this.userId,
        project_id: this.projectId,
        bracelet_id: this.parentId,
        gps_number: this.parentForm.deviceNum,
        ogz_id: this.parentForm.sector,
        bind_user: this.parentForm.crewId,
        gps_phone: this.parentForm.mesCard
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsBracelet',
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

</style>
