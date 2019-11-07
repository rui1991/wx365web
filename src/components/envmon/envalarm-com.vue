<template>
  <div>
    <!-- 编辑 -->
    <el-dialog title="编辑告警规则" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="告警设备" prop="ccdName">
          <el-input :disabled="true" type="textarea" v-model="formData.ccdName"></el-input>
          <!--<el-button type="primary" style="vertical-align: top;" @click="ccdDialog = true">选择设备</el-button>-->
        </el-form-item>
        <el-form-item label="告警推送人" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="formData.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="crewDialog = true">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 设备 -->
    <ccd-module
      :parentDialog="ccdDialog"
      :parentIds="formData.ccdId"
      @parentUpdata="ccdSelect"
      @parentCancel="ccdCancel">
    </ccd-module>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentIds="formData.crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入位置组件
import ccdModule from '@/components/envmon/envalarm-ccd'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox'
export default{
  props: ['parentDialog', 'parentId', 'parentFormData', 'parentCcdParam'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        ccdName: [
          { required: true, message: '请选择告警设备', trigger: 'change' }
        ],
        crewName: [
          { required: true, message: '请选择告警推送人', trigger: 'change' }
        ]
      },
      formData: {
        ccdName: '',
        ccdId: [],
        crewName: '',
        crewId: []
      },
      ccdDialog: false,
      crewDialog: false,
      disabled: false
    }
  },
  created () {

  },
  components: {
    ccdModule,
    crewModule
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
      this.formData = this.parentFormData
      this.ccdParam = this.parentCcdParam
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
      // 设备ID
      let ccdId = this.formData.ccdId
      ccdId = ccdId.join(',')
      // 告警人ID
      let crewId = this.formData.crewId
      crewId = crewId.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        alarm_node: this.formData.ccdName,
        alarm_node_id: ccdId,
        push_user: this.formData.crewName,
        push_user_id: crewId,
        // max_temperature: tempMaxVal,
        // min_temperature: tempMinVal,
        // max_humidity: moisMaxVal,
        // min_humidity: tempMinVal,
        // dry_wet: waterValue,
        // alarm_condition: content,
        las_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/setAlarm',
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
    },
    /* 设备选择 */
    ccdSelect (data) {
      this.formData.ccdName = data.names
      this.formData.ccdId = data.ids
      this.ccdDialog = false
    },
    ccdCancel () {
      this.ccdDialog = false
    },
    /* 人员选择 */
    crewUpdata (data) {
      this.formData.crewName = data.names
      this.formData.crewId = data.ids
      this.crewDialog = false
    },
    crewCancel () {
      this.crewDialog = false
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
