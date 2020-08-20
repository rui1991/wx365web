<template>
  <div>
    <el-dialog title="编辑车辆" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="parentForm" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="车牌号" prop="mark">
          <el-input v-model.trim="parentForm.mark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备号" prop="deviceNum">
          <el-input v-model.trim="parentForm.deviceNum" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="车辆类型" prop="type">
          <el-select v-model="parentForm.type" placeholder="请选择车辆类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="sector">
          <el-select v-model="parentForm.sector" disabled placeholder="请选择所属部门" >
            <el-option
              v-for="item in parentSectorOptions"
              :key="item.base_id"
              :label="item.name"
              :value="item.base_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人员" prop="crewName">
          <el-input :disabled="true" v-model="parentForm.crewName"></el-input>
          <el-button type="primary" :disabled="crewDisabled" @click="crewClick">选择人员</el-button>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="parentForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentOrgid="orgId"
      :parentIds="parentForm.crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
/*
* type: 0  添加车辆   1编辑车辆
* car_number：车牌号
* gps_number: 设备号
* car_type：车辆类型
* ogz_id：部门id(base_id)
* users: 人员
* remarks：备注
* */
import { mapState } from 'vuex'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox3'
export default{
  props: ['parentDialog', 'parentSectorOptions', 'parentId', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      typeOptions: [
        {
          label: '运输车',
          value: 1
        },
        {
          label: '洒水车',
          value: 2
        },
        {
          label: '扫地车',
          value: 3
        },
        {
          label: '压缩车',
          value: 4
        },
        {
          label: '环卫车',
          value: 5
        },
        {
          label: '垃圾车',
          value: 6
        },
        {
          label: '巡逻车',
          value: 7
        }
      ],
      rules: {
        mark: [
          { required: true, message: '请输入车牌号', trigger: 'blur' }
        ],
        deviceNum: [
          { required: true, message: '请输入设备号', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择车辆类型', trigger: 'change' }
        ],
        sector: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ]
      },
      disabled: false,
      crewDialog: false,
      crewDisabled: true,
      orgId: 0
    }
  },
  components: {
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    comInit () {

    },
    // 切换部门
    sectionChang () {
      this.parentForm.crewName = ''
      this.parentForm.crewId = []
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
        car_id: this.parentId,
        car_number: this.parentForm.mark,
        car_type: this.parentForm.type,
        ogz_id: this.parentForm.sector,
        gps_number: this.parentForm.deviceNum,
        remarks: this.parentForm.remark
      }
      let crewId = this.parentForm.crewId
      if (crewId.length > 0) {
        crewId = crewId.join(',')
        params.users = crewId
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsCar',
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
    },
    /* 人员 */
    crewClick () {
      // 组织ID
      const sector = this.parentForm.sector
      const nowSector = this.parentSectorOptions.find(item => {
        return item.base_id === sector
      })
      this.orgId = nowSector.id
      this.crewDialog = true
    },
    crewUpdata (data) {
      this.parentForm.crewName = data.names
      this.parentForm.crewId = data.ids
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
    },
    'parentForm.sector' (val, oldVal) {
      if (val) {
        this.crewDisabled = false
      } else {
        this.crewDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
