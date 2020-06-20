<template>
  <div>
    <el-dialog title="编辑用户" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <p style="height: 30px; color: #f04645;" v-show="sectorDisabled">提示：如需更换所属部门请先解绑卡片！</p>
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model.trim="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="工号" prop="worknum">
          <el-input v-model.trim="formData.worknum"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model.trim="formData.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门" prop="sectorName">
          <el-input :disabled="true" v-model="formData.sectorName"></el-input>
          <el-button type="primary" :disabled="sectorDisabled" @click="sectorDialog = true">选择部门</el-button>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" filterable placeholder="请选择用户角色">
            <el-option
              v-for="item in parentRoles"
              :key="item.role_id"
              :label="item.role_name"
              :value="item.role_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="授权范围" prop="accreditName">
          <el-input type="textarea" :disabled="true" v-model="formData.accreditName"></el-input>
          <el-button type="primary" @click="accreditDialog = true">选择范围</el-button>
        </el-form-item>
        <el-form-item label="技能" prop="skills">
          <el-select v-model="formData.skills" multiple collapse-tags placeholder="请选择技能">
            <el-option
              v-for="item in skillOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 黑卡部门 -->
    <sectorbc-module
      v-if="parentType === 1"
      :parentDialog="sectorDialog"
      :parentOrgId="parentOrgId"
      @parentUpdata="sectorUpdata"
      @parentCancel="sectorCancel">
    </sectorbc-module>
    <!-- 客户部门 -->
    <sectorkh-module
      v-else-if="parentType === 2"
      :parentDialog="sectorDialog"
      @parentUpdata="sectorUpdata"
      @parentCancel="sectorCancel">
    </sectorkh-module>
    <!-- 黑卡授权范围 -->
    <accreditbc-module
      v-if="parentType === 1"
      :parentDialog="accreditDialog"
      :parentOrgId="parentOrgId"
      :parentId="formData.accreditId"
      @parentUpdata="accreditUpdata"
      @parentCancel="accreditCancel">
    </accreditbc-module>
    <!-- 客户授权范围 -->
    <accreditkh-module
      v-if="parentType === 2"
      :parentDialog="accreditDialog"
      :parentId="formData.accreditId"
      @parentUpdata="accreditUpdata"
      @parentCancel="accreditCancel">
    </accreditkh-module>
  </div>
</template>

<script>
/*
* 说明：
*   编辑用户模块
*   parentType：父级类型 1：黑卡   2：客户
*   parentOrgId：组织id(用于黑卡获取组织树)
*   parentOrgId：组织id(企业id)
* */
import { mapState } from 'vuex'
// 引入黑卡部门组件
import sectorbcModule from '@/components/company/userBC-sector'
// 引入客户部门组件
import sectorkhModule from '@/components/company/userKH-sector'
// 引入黑卡授权范围组件
import accreditbcModule from '@/components/company/userBC-accredit'
// 引入客户授权范围组件
import accreditkhModule from '@/components/company/userKH-accredit'
export default{
  props: ['parentDialog', 'parentType', 'parentRoles', 'parentOrgId', 'parentComId', 'parentId'],
  data () {
    let checkWorknum = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]+$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的工号格式有误，请认真核对'))
        }
      } else {
        callback()
      }
    }
    let checkPhone = (rule, value, callback) => {
      let regex = /^1[3|4|5|6|7|8|9][0-9]{9}$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('手机号码格式错误'))
        }
      } else {
        callback(new Error('请输入手机号码'))
      }
    }
    return {
      formLabelWidth: '100px',
      companyId: 0,
      skillOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        worknum: [
          { required: false, validator: checkWorknum, trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: checkPhone, trigger: 'blur' }
        ],
        sectorName: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        accreditName: [
          { required: true, message: '请选择授权范围', trigger: 'change' }
        ]
      },
      formData: {
        name: '',
        worknum: '',
        ophone: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: [],
        skills: []
      },
      disabled: false,
      sectorDialog: false,
      accreditDialog: false,
      sectorDisabled: false
    }
  },
  created () {

  },
  components: {
    sectorbcModule,
    sectorkhModule,
    accreditbcModule,
    accreditkhModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    comInit () {
      // 设置企业ID
      this.companyId = this.parentComId
      // 清空数据
      this.formData = {
        name: '',
        worknum: '',
        ophone: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: [],
        skills: []
      }
      // 获取详情
      this.getDetails()
      // 判断是否要获取技能选项
      if (this.skillOptions.length === 0) {
        // 获取技能选项列表
        this.getSkillData()
      }
    },
    // 获取详情
    getDetails () {
      let params = {
        userN_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUserOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 企业ID
          this.companyId = itemData.company_id
          // 是否绑定卡片
          const mac = itemData.card_mac || ''
          if (mac) {
            this.sectorDisabled = true
          } else {
            this.sectorDisabled = false
          }
          // 授权范围
          const accredits = itemData.userOgzs || []
          let accreditName = []
          let accreditId = []
          accredits.forEach(item => {
            accreditName.push(item.organize_name)
            accreditId.push(item.organize_id)
          })
          accreditName = accreditName.join('、')
          // 技能
          const userSkills = itemData.userSkls
          let skills = []
          userSkills.forEach(item => {
            skills.push(item.skills_id)
          })
          this.formData = {
            name: itemData.user_name,
            worknum: itemData.pin || '',
            ophone: itemData.user_phone,
            phone: itemData.user_phone,
            sectorName: itemData.organize_name,
            sectorId: itemData.ogz_id,
            role: itemData.role_id,
            accreditName: accreditName,
            accreditId: accreditId,
            skills: skills
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
      // 权限范围
      let accreditId = this.formData.accreditId
      accreditId = accreditId.join(',')
      // 技能
      let skills = this.formData.skills
      skills = skills.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        userN_id: this.parentId,
        user_name: this.formData.name,
        pin: this.formData.worknum,
        old_phone: this.formData.ophone,
        user_phone: this.formData.phone,
        ogz_id: this.formData.sectorId,
        role_id: this.formData.role,
        organize_ids: accreditId,
        skills_id: skills
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altUser',
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
    /* 部门 */
    sectorUpdata (data) {
      this.formData.sectorName = data.name
      this.formData.sectorId = data.id
      this.sectorDialog = false
    },
    sectorCancel () {
      this.sectorDialog = false
    },
    /* 授权范围 */
    accreditUpdata (data) {
      this.formData.accreditName = data.names
      this.formData.accreditId = data.ids
      this.accreditDialog = false
    },
    accreditCancel () {
      this.accreditDialog = false
    },
    /* 技能 */
    getSkillData (skills) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selSkillTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const skillData = res.data.data1
          let skillOptions = []
          skillData.forEach(item => {
            skillOptions.push({
              name: item.name,
              id: item.children[0].id
            })
          })
          this.skillOptions = skillOptions
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
