<template>
  <div class="orange-module">
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="formData.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="formData.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="企业性质" prop="nature">
        <el-select style="width: 100%;" v-model="formData.nature" clearable placeholder="请选择企业性质">
          <el-option
            v-for="item in natureOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="行政区域" prop="area">
        <el-input v-model.trim="formData.area" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属行业" prop="trade">
        <el-select style="width: 100%;" v-model="formData.trade" clearable placeholder="请选择所属行业">
          <el-option
            v-for="item in tradeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="企业规模" prop="scale">
        <el-select style="width: 100%;" v-model="formData.scale" clearable placeholder="请选择企业规模">
          <el-option
            v-for="item in scaleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="坐标" prop="coord">
        <el-input :disabled="true" v-model="formData.coord" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="mapDialog = true">选择坐标</el-button>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="formData.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="module-operate">
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
* 编辑企业(黑卡)
* */
import { mapState } from 'vuex'
// 引入地图组件
import mapModule from '@/components/company/organ-map'
export default{
  props: ['parentOrgId', 'parentOrgType', 'parentBaseId'],
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
      formLabelWidth: '100px',
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
      formData: {
        parentId: 1,
        name: '',
        linkman: '',
        phone: '',
        nature: '',
        area: '',
        trade: '',
        scale: '',
        coord: '',
        state: 0
      },
      disabled: false,
      mapDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 获取详情
    this.getDetails()
  },
  components: {
    mapModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    getDetails () {
      let params = {
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        base_id: this.parentBaseId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.formData = {
            parentId: 1,
            name: itemData.ogz_name,
            linkman: itemData.user_name,
            phone: itemData.ogz_phone,
            nature: itemData.nature || '',
            area: itemData.area || '',
            trade: itemData.industry || '',
            scale: itemData.size || '',
            coord: itemData.coordinate || '',
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
      let params = {
        user_id: this.userId,
        base_id: this.parentBaseId,
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        ogz_name: this.formData.name,
        parent_up_id: this.formData.parentId,
        user_name: this.formData.linkman,
        ogz_phone: this.formData.phone,
        nature: this.formData.nature,
        area: this.formData.area,
        industry: this.formData.trade,
        size: this.formData.scale,
        coordinate: this.formData.coord,
        ogz_state: this.formData.state,
        address: '',
        remarks: ''
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altOrganizeTree',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '企业编辑成功！',
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
