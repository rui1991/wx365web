<template>
  <div>
    <el-dialog title="新增标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="标准名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入标准名称', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        remark: ''
      },
      disabled: false
    }
  },
  computed: {
    ...mapState('other', {
      orgType: state => state.normOrgan.type,
      companyId: state => state.normOrgan.companyId,
      projectId: state => state.normOrgan.projectId,
      parId: state => state.normTree.id,
      parDepth: state => state.normTree.depth,
      type: state => state.normTree.type,
      parPath: state => state.normTree.path
    })
  },
  methods: {
    /*
    * 参数说明：
    * ascription_type：Number  组织类型； 0：平台，1：企业， 2：项目
    * company_id：Number  所属企业ID
    * project_id：Number  所属项目ID
    * parent_id：Number  上级的id
    * sdt_type：Number  上级的id
    * depth: Number  第几层
    * s_type：Number  标准类型，1：设备标准类，2：巡检标准类；
    * path：String  路径，上级的路径 + 标准名称
    * sdt_name：String  标准名称
    * remarks：Number  备注
    * */

    addInit () {
      this.formData = {
        name: '',
        remark: ''
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
      const path = this.parPath + '>' + this.formData.name
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        parent_id: this.parId,
        sdt_type: this.parId,
        depth: this.parDepth + 1,
        s_type: this.type,
        path: path,
        sdt_name: this.formData.name,
        remarks: this.formData.remark
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addStandardsTree',
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
        this.addInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
