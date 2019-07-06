<template>
  <div class="org-item">
    <h3 class="title">新增企业</h3>
    <el-form :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="addForm.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="addForm.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="企业性质" prop="nature">
        <el-select style="width: 100%;" v-model="addForm.nature" clearable placeholder="请选择企业性质">
          <el-option
            v-for="item in natureOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="行政区域" prop="area">
        <el-input v-model.trim="addForm.area" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属行业" prop="trade">
        <el-select style="width: 100%;" v-model="addForm.trade" clearable placeholder="请选择所属行业">
          <el-option
            v-for="item in tradeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="企业规模" prop="scale">
        <el-select style="width: 100%;" v-model="addForm.scale" clearable placeholder="请选择企业规模">
          <el-option
            v-for="item in scaleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="addForm.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button @click="resetAddForm">取 消</el-button>
      <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'addclient',
  data () {
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
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: checkPhone, trigger: 'blur' }
        ],
        area: [
          { required: true, message: '请输入行政区域', trigger: 'change' }
        ],
        state: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      addForm: {
        type: '',
        parentId: '',
        name: '',
        linkman: '',
        phone: '',
        nature: '',
        area: '',
        trade: '',
        scale: '',
        state: 0
      },
      addDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 类型
    const type = this.$route.query.type
    this.addForm.type = type
    // 上级
    this.addForm.parentId = JSON.parse(JSON.stringify(this.orgId))
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId,
        orgId: state => state.org.orgId
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
      this.$router.push({ path: '/main/oorgan/empty' })
    },
    // 提交
    sendAddRequest () {
      let params = {
        user_id: this.userId,
        parent_id: this.addForm.parentId,
        organize_type: this.addForm.type,
        organize_name: this.addForm.name,
        user_name: this.addForm.linkman,
        user_phone: this.addForm.phone,
        nature: this.addForm.nature,
        area: this.addForm.area,
        industry: this.addForm.trade,
        size: this.addForm.scale,
        com_state: this.addForm.state
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
            message: '企业新增成功！',
            type: 'success'
          })
          // 刷新树
          this.$emit('parentRefresh')
          // 返回
          this.$router.push({ path: '/main/oorgan/empty' })
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
