<template>
  <div>
    <el-dialog title="编辑角色" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="autNames">
          <el-input type="textarea" :disabled="true" v-model="formData.autNames"></el-input>
          <el-button type="primary" @click="autDialog = true">选择权限</el-button>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model="formData.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 权限 -->
    <aut-module
      :parentDialog="autDialog"
      :parentIds="formData.autIds"
      @parentUpdata="autUpdata"
      @parentCancel="autCancel">
    </aut-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入权限组件
import autModule from '@/components/company/role-aut'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      sectorOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        autNames: '',
        autIds: [],
        remark: ''
      },
      disabled: false,
      autDialog: false
    }
  },
  components: {
    autModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    comInit () {
      this.formData = {
        name: '',
        autNames: '',
        autIds: [],
        remark: ''
      }
      this.getItemDetails()
    },
    // 获取详情
    getItemDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        role_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selRoleOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 权限
          const authority = itemData.permissions
          let autIds = []
          let autNames = []
          authority.forEach(item => {
            autNames.push(item.function_name)
            autIds.push(item.function_id)
          })
          autNames = autNames.join('、')
          this.formData = {
            name: itemData.role_name,
            autIds: autIds,
            autNames: autNames,
            remark: itemData.instructions
          }
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.addDisabled = false
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
      let autIds = this.formData.autIds
      autIds = autIds.join(',')
      let params = {
        user_id: this.userId,
        type: 1,
        role_id: this.parentId,
        role_name: this.formData.name,
        function_ids: autIds,
        remarks: this.formData.remark
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addRole1',
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
    /* 权限 */
    autUpdata (data) {
      this.formData.autNames = data.names
      this.formData.autIds = data.ids
      this.autDialog = false
    },
    autCancel () {
      this.autDialog = false
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
