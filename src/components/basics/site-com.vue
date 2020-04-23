<template>
  <el-dialog title="编辑地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="上级位置" prop="parentPath">
        <el-input :disabled="true" v-model="formData.parentPath"></el-input>
      </el-form-item>
      <el-form-item label="地址名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="区域类型" prop="areaType">
        <el-select style="width: 100%;" v-model="formData.areaType" placeholder="请选择区域类型">
          <el-option
            v-for="item in areaOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="地址类型" prop="type">
        <el-select style="width: 100%;" v-model="formData.type" @change="typeChange" placeholder="请选择地址类型">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="地址标签" prop="mac">
        <el-input v-model.trim="formData.mac" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="关联标准" prop="norm">
        <el-select style="width: 100%;" v-model="formData.norm" multiple collapse-tags  clearable filterable placeholder="请选择标准">
          <el-option
            v-for="item in normOptions"
            :key="item.os_id"
            :label="item.standard_name"
            :value="item.os_id">
            <span style="float: left">{{ item.standard_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.ogz_name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    let checkMac = (rule, value, callback) => {
      let regex = /^[a-zA-Z0-9]{8,12}$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac格式有误，请认真核对'))
        }
      } else {
        callback()
      }
    }
    return {
      formLabelWidth: '100px',
      areaOptions: [
        {
          label: '楼栋',
          value: 0
        },
        {
          label: '单元',
          value: 1
        },
        {
          label: '楼层',
          value: 2
        },
        {
          label: '办公区域',
          value: 3
        },
        {
          label: '商铺',
          value: 4
        },
        {
          label: '卫生间',
          value: 5
        },
        {
          label: '停车场',
          value: 6
        },
        {
          label: '公共区域',
          value: 7
        },
        {
          label: '外围',
          value: 8
        },
        {
          label: '岗亭',
          value: 9
        }
      ],
      typeOptions: [
        {
          label: '巡检地址',
          value: 0
        },
        {
          label: '设备地址',
          value: 7
        },
        {
          label: '固定岗位',
          value: 6
        }
      ],
      normOptions: [],
      normState: false,
      rules: {
        name: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ],
        areaType: [
          { required: true, message: '请选择区域类型', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择地址类型', trigger: 'change' }
        ],
        mac: [
          { validator: checkMac, trigger: 'blur' }
        ]
      },
      formData: {
        parent: '',
        parentPath: '',
        name: '',
        areaType: 0,
        type: 0,
        mac: '',
        norm: [],
        remark: ''
      },
      disabled: false
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    comInit () {
      this.formData = {
        parent: '',
        parentPath: '',
        name: '',
        areaType: 0,
        type: 0,
        mac: '',
        norm: [],
        remark: ''
      }
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selApkPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          const type = itemData.position_type
          const normIds = itemData.os_ids
          let norm = []
          if (normIds) {
            let ids = normIds.split(',')
            norm = ids.map(item => {
              return Number.parseInt(item)
            })
          }
          // Mac地址
          this.formData = {
            parent: itemData.parent_po_id,
            parentPath: itemData.parent_address || '',
            name: itemData.position_name,
            areaType: itemData.area_type,
            type: type,
            mac: itemData.position_mac || '',
            norm: norm,
            remark: itemData.instructions
          }
          // 获取标准
          this.normOptions = []
          if (type === 0) {
            this.getNormOptions(2)
          } else if (type === 7) {
            this.getNormOptions(1)
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
    // 切换地址类型
    typeChange (value) {
      this.normOptions = []
      this.formData.norm = []
      if (value === 0) {
        this.getNormOptions(2)
      } else if (value === 7) {
        this.getNormOptions(1)
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
      // MAC地址
      let mac = this.formData.mac
      mac = this.formatSetMac(mac)
      // 标准
      let norm = this.formData.norm
      norm = norm.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentId,
        parent_po_id: this.formData.parent,
        position_name: this.formData.name,
        area_type: this.formData.areaType,
        position_type: this.formData.type,
        position_mac: mac,
        os_ids: norm,
        instructions: this.formData.remark
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/standard/alterPosition',
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
    // 格式化设置Mac地址
    formatSetMac (str) {
      if (!str) { return '' }
      const mac = str.replace(/:/g, '')
      let value = mac.toLowerCase()
      return value
    },
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    },
    /* 获取标准 */
    getNormOptions (type = '') {
      let params = {
        project_id: this.projectId,
        standard_type: type,
        standard_name: '',
        ogz_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.normOptions = res.data.data1.mes
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
