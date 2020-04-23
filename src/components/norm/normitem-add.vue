<template>
  <div>
    <el-dialog title="新增检查项" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="检查项名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="表达方式" prop="way">
          <el-select v-model="formData.way" placeholder="请选择表达方式">
            <el-option
              v-for="item in wayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="表达值" prop="values" v-if="wayType === 1">
          <el-tag
            :key="tag"
            v-for="tag in formData.values"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model.trim="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+添加</el-button>
        </el-form-item>
        <el-form-item label="表达值" prop="valueText" v-else>
          <el-input v-model.trim="formData.valueText" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="默认值" prop="defValue" v-show="wayType === 1">
          <el-select v-model="formData.defValue" clearable placeholder="请选择默认值">
            <el-option
              v-for="item in valueOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="异常值" prop="abnValue" v-show="wayType === 1">
          <el-select
            v-model="formData.abnValue"
            multiple
            collapse-tags
            placeholder="请选择异常值">
            <el-option
              v-for="item in valueOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="要求" prop="content">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.content"></el-input>
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
      wayOptions: [
        {
          label: '单选',
          value: 1
        },
        {
          label: '多选',
          value: 2
        },
        {
          label: '文本框',
          value: 3
        },
        {
          label: '文本域',
          value: 4
        },
        {
          label: '图片',
          value: 5
        }
      ],
      wayType: 1,
      inputVisible: false,
      inputValue: '',
      valueOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入标准名称', trigger: 'blur' }
        ],
        way: [
          { required: true, message: '请选择表达方式', trigger: 'change' }
        ],
        values: [
          { type: 'array', required: true, message: '请至少设置一个表达值', trigger: 'blur' }
        ],
        valueText: [
          { required: true, message: '请输入表达值', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        way: 1,
        values: [],
        valueText: '',
        defValue: '',
        abnValue: [],
        content: ''
      },
      disabled: false
    }
  },
  computed: {
    ...mapState('other', {
      orgType: state => state.normOrgan.type,
      companyId: state => state.normOrgan.companyId,
      projectId: state => state.normOrgan.projectId,
      parId: state => state.normData.id,
      parPath: state => state.normData.path,
      typeid: state => state.normData.typeid
    })
  },
  methods: {
    /*
    * 参数说明：
    * ascription_type：Number  组织类型； 0：平台，1：企业， 2：项目
    * company_id：Number  所属企业ID
    * project_id：Number  所属项目ID
    * sdt_id：Number  检查项上级的sdt_id
    * sdt_type：String  检查项上级的sdt_type
    * path：String  检查项上级的路径
    * inspect_name：String  检查项名称
    * expression：Number  表达方式
    * expression_value：Array => String(',')  表达值
    * default_value：String  默认值
    * abnormal_value：Array => String(',')   异常值
    * inspect_contents：String   要求
    * */

    handleClose (tag) {
      this.formData.values.splice(this.formData.values.indexOf(tag), 1)
      // 默认值
      this.formData.defValue = ''
      // 异常值
      this.formData.abnValue = []
    },

    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm () {
      let inputValue = this.inputValue
      inputValue = inputValue.replace(/,/g, '')
      let temp = this.formData.values.find(item => {
        return item === inputValue
      })
      if (inputValue && !temp) {
        this.formData.values.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    // 初始化数据
    addInit () {
      this.formData = {
        name: '',
        way: 1,
        values: [],
        valueText: '',
        defValue: '',
        abnValue: [],
        content: ''
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
      let values = this.formData.values
      values = values.join(',')
      let abnValue = this.formData.abnValue
      abnValue = abnValue.join(',')
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_id: this.parId,
        sdt_type: this.typeid,
        path: this.parPath,
        inspect_name: this.formData.name,
        expression: this.formData.way,
        expression_value: values,
        default_value: this.formData.defValue,
        abnormal_value: abnValue,
        inspect_contents: this.formData.content
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addStandardsCheckMes',
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
    },
    'formData.way' (val, oldVal) {
      if (val === 1 || val === 2) {
        this.wayType = 1
      } else if (val === 3 || val === 4) {
        this.wayType = 2
        this.formData.valueText = '长度不得超过100个字符'
        this.formData.values = []
        this.formData.defValue = ''
        this.formData.abnValue = []
      } else if (val === 5) {
        this.wayType = 3
        this.formData.valueText = '最多可上传3张图片'
        this.formData.values = []
        this.formData.defValue = ''
        this.formData.abnValue = []
      }
    },
    'formData.values' (val, oldVal) {
      this.valueOptions = val
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
