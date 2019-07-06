<template>
  <div class="org-item">
    <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="comForm.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="comForm.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="企业性质" prop="nature">
        <el-select style="width: 100%;" v-model="comForm.nature" clearable placeholder="请选择企业性质">
          <el-option
            v-for="item in natureOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="行政区域" prop="area">
        <el-input v-model.trim="comForm.area" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属行业" prop="trade">
        <el-select style="width: 100%;" v-model="comForm.trade" clearable placeholder="请选择所属行业">
          <el-option
            v-for="item in tradeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="企业规模" prop="scale">
        <el-select style="width: 100%;" v-model="comForm.scale" clearable placeholder="请选择企业规模">
          <el-option
            v-for="item in scaleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="comForm.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'comclient',
  data () {
    return {
      natureOptions: [
        {
          value: '民营企业',
          label: '民营企业'
        },
        {
          value: '国有企业',
          label: '国有企业'
        },
        {
          value: '合资企业',
          label: '合资企业'
        }
      ],
      tradeOptions: [
        {
          value: '互联网行业',
          label: '互联网行业'
        },
        {
          value: '制造行业',
          label: '制造行业'
        },
        {
          value: '贸易/物流',
          label: '贸易/物流'
        },
        {
          value: '建筑/房地产',
          label: '建筑/房地产'
        },
        {
          value: '金融行业',
          label: '金融行业'
        },
        {
          value: '服务业',
          label: '服务业'
        },
        {
          value: '政府/事业单位',
          label: '政府/事业单位'
        },
        {
          value: '教育行业',
          label: '教育行业'
        },
        {
          value: '文化传媒行业',
          label: '文化传媒行业'
        },
        {
          value: '企业服务',
          label: '企业服务'
        },
        {
          value: '医疗医药',
          label: '医疗医药'
        },
        {
          value: '其他组织',
          label: '其他组织'
        }
      ],
      scaleOptions: [
        {
          value: '100以下',
          label: '100以下'
        },
        {
          value: '100-499',
          label: '100-499'
        },
        {
          value: '500-999',
          label: '500-999'
        },
        {
          value: '1000以上',
          label: '1000以上'
        }
      ],
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入企业名称', trigger: 'blur'}
        ],
        linkman: [
          { required: true, message: '请选择联系人', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请选择联系电话', trigger: 'blur' }
        ],
        area: [
          { required: true, message: '请输入行政区域', trigger: 'blur' }
        ]
      },
      comForm: {
        type: '',
        name: '',
        parentId: 1,
        linkman: '',
        phone: '',
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
    // this.getCrewOptions()
    // 获取详情
    this.getClientDet()
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
    getClientDet () {
      let params = {
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.orgType
      }
      params = this.$qs.stringify(params)
      this.detDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        this.detDisabled = false
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.comForm = {
            type: this.orgType,
            name: itemData.ogz_name,
            parentId: 1,
            linkman: itemData.user_name,
            phone: itemData.ogz_phone,
            nature: itemData.nature || '',
            area: itemData.area || '',
            trade: itemData.industry || '',
            scale: itemData.size || '',
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
    // 提交
    sendComRequest () {
      // const phone = this.comForm.linkman
      // const crewItem = this.crewOptions.find(item => {
      //   return item.user_phone === phone
      // })
      // const uname = crewItem.user_name
      let params = {
        user_id: this.userId,
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.comForm.type,
        ogz_name: this.comForm.name,
        parent_up_id: this.comForm.parentId,
        user_name: this.comForm.linkman,
        ogz_phone: this.comForm.phone,
        nature: this.comForm.nature,
        area: this.comForm.area,
        industry: this.comForm.trade,
        size: this.comForm.scale,
        ogz_state: this.comForm.state,
        address: '',
        remarks: ''
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altOrganizeTree',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '企业编辑成功！',
            type: 'success'
          })
          // 传递刷新指令
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
        this.addDisabled = false
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
      // 获取企业人员
      this.getCrewOptions()
      // 获取详情
      this.getClientDet()
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
