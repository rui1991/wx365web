<template>
  <div class="orange-module">
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="分公司名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="上级机构" prop="parent">
        <el-input :disabled="true" v-model="formData.parentName"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="formData.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="formData.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="角色分配" prop="roles">
        <el-select style="width: 100%;" v-model="formData.roles" multiple collapse-tags placeholder="请选择角色">
          <el-option
            v-for="item in roleOptions"
            :key="item.role_id"
            :label="item.role_name"
            :value="item.role_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分公司地址" prop="area">
        <el-input v-model.trim="formData.area" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="坐标" prop="coord">
        <el-input :disabled="true" v-model="formData.coord" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="mapDialog = true">选择坐标</el-button>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="formData.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="module-operate" v-if="authority.indexOf(11) !== -1">
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
    <!-- 地图坐标 -->
    <map-module
      :parentDialog="mapDialog"
      :parentCoord="formData.coord"
      @parentUpdata="mapUpdata"
      @parentCancel="mapCancel">
    </map-module>
  </div>
</template>

<script>
/*
* 编辑分公司（黑卡）
* */
import { mapState } from 'vuex'
// 引入地图组件
import mapModule from '@/components/company/organ-map'
export default{
  props: ['parentOrgId', 'parentOrgType', 'parentBaseId'],
  data () {
    return {
      formLabelWidth: '100px',
      roleOptions: [],
      rules: {
        name: [
          {required: true, message: '请输入分公司名称', trigger: 'blur'}
        ],
        linkman: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        roles: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      formData: {
        parentId: 1,
        parentName: '',
        name: '',
        linkman: '',
        phone: '',
        roles: [],
        area: '',
        coord: '',
        remark: '',
        state: 0
      },
      disabled: false,
      mapDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 获取角色列表
    this.getRoleOptions()
    // 获取详情
    this.getDetails()
  },
  components: {
    mapModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      authority: state => state.detAuthority.organ
    })
  },
  methods: {
    // 获取详情
    getDetails () {
      let params = {
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        base_id: this.parentBaseId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.3/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          let roleIds = itemData.role_id || ''
          let roleArr = []
          if (roleIds) {
            roleArr = roleIds.split(',')
          }
          let roles = roleArr.map(item => {
            return Number.parseInt(item)
          })
          this.formData = {
            parentId: itemData.parent_up_id,
            parentName: itemData.parent_up_name || '',
            name: itemData.ogz_name || 1,
            linkman: itemData.user_name || '',
            phone: itemData.ogz_phone || '',
            roles: roles,
            area: itemData.address || '',
            coord: itemData.coordinate || '',
            remark: itemData.remarks,
            state: 0
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
      let roles = this.formData.roles
      roles = roles.join(',')
      let params = {
        user_id: this.userId,
        base_id: this.parentBaseId,
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        ogz_name: this.formData.name,
        parent_up_id: this.formData.parentId,
        user_name: this.formData.linkman,
        ogz_phone: this.formData.phone,
        role_ids: roles,
        address: this.formData.area,
        nature: '',
        area: '',
        industry: '',
        size: '',
        coordinate: this.formData.coord,
        remarks: this.formData.remark,
        ogz_state: this.formData.state
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.3/altOrganizeTree',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '分公司编辑成功',
            type: 'success'
          })
          // 刷新树
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
    /* 角色 */
    getRoleOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selRole',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.roleOptions = res.data.data1 || []
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
    /* 地图坐标 */
    mapUpdata (data) {
      this.formData.coord = data
      this.mapDialog = false
    },
    mapCancel () {
      this.mapDialog = false
    }
  },
  watch: {
    parentOrgId (val, old) {
      // 重置表单
      this.resetForm('ruleForm')
      // 获取详情
      this.getDetails()
    }
  }
}
</script>

<style lang="less" scoped>
  .orange-module{
    width: 600px;
    margin: 0 auto;
    .module-operate {
      margin-top: 30px;
      text-align: center;
    }
  }
</style>
