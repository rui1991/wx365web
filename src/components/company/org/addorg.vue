<template>
  <div class="org-item">
    <h3 class="title">{{ titleName }}</h3>
    <el-form :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
      <el-form-item :label="name" prop="name">
        <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="上级机构" prop="parent">
        <el-input :disabled="true" v-model="addForm.parentName"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="addForm.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="addForm.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="site" prop="site" v-show="$route.query.type === 2">
        <el-input v-model.trim="addForm.site" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="addForm.remark"></el-input>
      </el-form-item>
      <el-form-item :label="state" prop="state">
        <el-radio-group v-model="addForm.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
      <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'addorg',
  data () {
    return {
      titleName: '新增机构',
      name: '机构名称',
      state: '机构状态',
      site: '机构地址',
      mesHint: '机构新增成功！',
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        linkman: [
          {required: true, message: '请输入联系人', trigger: 'blur'}
        ]
      },
      addForm: {
        type: '',
        name: '',
        parentName: '',
        parentId: '',
        linkman: '',
        phone: '',
        site: '',
        remark: '',
        state: 0
      },
      addDisabled: false
    }
  },
  created () {

  },
  mounted () {
    if (this.$route.query.type === 2) {
      this.titleName = '新增分公司'
      this.name = '分公司名称'
      this.site = '分公司地址'
      this.state = '分公司状态'
      this.mesHint = '分公司新增成功！'
    } else if (this.$route.query.type === 3) {
      this.titleName = '新增项目'
      this.name = '项目名称'
      this.site = '项目地址'
      this.state = '项目状态'
      this.mesHint = '项目新增成功！'
    } else if (this.$route.query.type === 4) {
      this.titleName = '新增部门'
      this.name = '部门名称'
      this.site = '部门地址'
      this.state = '部门状态'
      this.mesHint = '部门新增成功！'
    }
    // 类型
    const type = this.$route.query.type
    this.addForm.type = type
    // 上级
    this.addForm.parentName = JSON.parse(JSON.stringify(this.orgName))
    this.addForm.parentId = JSON.parse(JSON.stringify(this.orgId))
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.org.orgId,
        orgName: state => state.org.orgName,
        orgType: state => state.org.orgType
      }
    )
  },
  methods: {
    // 验证表单
    submitAddForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendAddRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetAddForm () {
      if (this.companyId === 1) {
        if (this.orgType === 0) {
          this.$router.push({ path: '/main/oorgan/empty' })
        } else if (this.orgType === 1) {
          this.$router.push({ path: '/main/oorgan/conffirm/comclient' })
        } else if (this.orgType === 2) {
          this.$router.push({ path: '/main/oorgan/conffirm/comorg' })
        } else {
          this.$router.push({ path: '/main/oorgan/comorg' })
        }
      } else {
        if (this.orgType === 1) {
          this.$router.push({ path: '/main/corgan/comfirm' })
        } else {
          this.$router.push({ path: '/main/corgan/comorg' })
        }
      }
    },
    // 提交
    sendAddRequest () {
      let params = {
        user_id: this.userId,
        parent_id: this.addForm.parentId,
        organize_type: this.addForm.type,
        user_name: this.addForm.linkman,
        user_phone: this.addForm.phone,
        organize_name: this.addForm.name,
        com_state: this.addForm.state,
        address: this.addForm.site,
        remarks: this.addForm.remark
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/addOrganizeTree',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: this.mesHint,
            type: 'success'
          })
          // 刷新树
          this.$emit('parentRefresh')
          // 返回上级编辑
          this.resetAddForm()
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
    }
  }
}
</script>

<style lang="less" scoped>
  .org-item{
    width: 600px;
    margin: 0 auto;
    .title {
      height: 60px;
      text-align: center;
      line-height: 60px;
      font-size: 16px;
      font-weight: 600;
    }
    .operate {
      margin-top: 50px;
      text-align: center;
    }
  }
</style>
