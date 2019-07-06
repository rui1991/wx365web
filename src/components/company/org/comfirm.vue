<template>
  <div class="org-item">
    <h3 class="title">编辑企业</h3>
    <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-select style="width: 100%;" v-model="comForm.linkman" filterable placeholder="请选择联系人">
          <el-option
            v-for="item in crewOptions"
            :key="item.user_id"
            :label="item.user_name"
            :value="item.user_phone">
            <span style="float: left">{{ item.user_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.user_phone }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">保 存</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'comfirm',
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入企业名称', trigger: 'blur'}
        ],
        linkman: [
          {required: true, message: '请选择联系人', trigger: 'change'}
        ]
      },
      comForm: {
        name: '',
        linkman: '',
        nature: '',
        area: '',
        trade: '',
        scale: '',
        state: 0
      },
      comDisabled: false,
      crewOptions: []
    }
  },
  created () {

  },
  mounted () {
    // 获取企业人员
    this.getCrewOptions()
    // 获取详情
    this.getFirmDet()
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.org.orgId,
        baseId: state => state.org.baseId,
        orgType: state => state.org.orgType
      }
    )
  },
  methods: {
    // 获取人员
    getCrewOptions () {
      let params = {
        organize_id: this.orgId,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 100000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewOptions = res.data.data1.users
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
    // 获取详情
    getFirmDet () {
      let params = {
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.orgType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        this.detDisabled = false
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.comForm = {
            name: itemData.ogz_name,
            linkman: itemData.ogz_phone,
            nature: itemData.nature,
            area: itemData.area,
            trade: itemData.industry,
            scale: itemData.size,
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
        this.detDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 验证表单
    submitComForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendComRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetComForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    sendComRequest () {
      const phone = this.comForm.linkman
      const crewItem = this.crewOptions.find(item => {
        return item.user_phone === phone
      })
      const uname = crewItem.user_name
      let params = {
        user_id: this.userId,
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.orgType,
        ogz_name: this.comForm.name,
        parent_up_id: 1,
        user_name: uname,
        ogz_phone: phone,
        nature: this.comForm.nature,
        area: this.comForm.area,
        industry: this.comForm.trade,
        size: this.comForm.scale,
        ogz_state: this.comForm.state,
        address: '',
        remarks: ''
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altOrganizeTree',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '企业编辑成功！',
            type: 'success'
          })
          // 刷新树
          this.$emit('parentChange')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.comDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    orgId (newVal, oldVal) {
      // 重置表单
      this.$refs['ruleComForm'].resetFields()
      // 获取详情
      this.getOrganDet()
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
