<template>
  <div>
    <el-dialog title="新增标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="标准名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="标准类型" prop="type">
          <el-select v-model="formData.type" @change="typeChange" style="width: 160px;" placeholder="请选择标准类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行部门" prop="sector">
          <el-select v-model="formData.sector" style="width: 160px;" placeholder="请选择执行部门">
            <el-option
              v-for="item in parentSectors"
              :key="item.base_id"
              :label="item.name"
              :value="item.base_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
        </el-form-item>
        <el-form-item label="巡检标准" prop="itemIds">
          <el-input v-model="formData.itemIds" v-show="false" style="width: 60%;"></el-input>
          <el-button type="primary" @click="itemClick">选择标准</el-button>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="itemTable" style="width: 100%" v-show="itemTable.length > 0">
        <el-table-column prop="path" :show-overflow-tooltip="true" label="路径"></el-table-column>
        <el-table-column prop="inspect_name" :show-overflow-tooltip="true" label="检查项"></el-table-column>
        <el-table-column prop="inspect_contents" :show-overflow-tooltip="true" label="检查内容及要求"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 标准检查项 -->
    <tem-module
      :parentDialog="itemDialog"
      :parentId="sdtId"
      :parentType="sdtType"
      :parentIds="itemSelection"
      @parentUpdata="temUpdata"
      @parentCancel="temCancel">
    </tem-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入模板组件
import temModule from '@/components/polling/normoam-item'
export default{
  props: ['parentDialog', 'parentSectors'],
  data () {
    return {
      formLabelWidth: '100px',
      typeOptions: [],
      typeState: false,
      sdtId: 0,
      sdtType: 0,
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入模板类型', trigger: 'blur' }
        ],
        sector: [
          { required: true, message: '请选择执行部门', trigger: 'change' }
        ],
        itemIds: [
          { required: true, message: '请选择巡检标准', trigger: 'input' }
        ]
      },
      formData: {
        name: '',
        type: 2,
        sector: '',
        remark: '',
        itemIds: ''
      },
      itemTable: [],
      disabled: false,
      itemDialog: false,
      itemSelection: []
    }
  },
  components: {
    temModule
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
    addInit () {
      this.formData = {
        name: '',
        type: 2,
        sector: '',
        remark: '',
        itemIds: ''
      }
      this.itemTable = []
      // 获取标准类型
      if (this.typeState) {
        return
      }
      this.getNormType()
    },
    // 切换类型
    typeChange () {
      this.formData.itemIds = ''
      this.itemTable = []
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
        project_id: this.projectId,
        user_id: this.userId,
        standard_name: this.formData.name,
        standard_type: this.formData.type,
        ogz_id: this.formData.sector,
        remarks: this.formData.remark,
        sdd_ids: this.formData.itemIds
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addStandardsOgz',
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
    /* 标准类型 */
    getNormType () {
      let params = {
        ascription_type: 2,
        company_id: this.companyId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.typeState = true
          // 组织树
          const treeData = res.data.data1
          let typeOptions = []
          treeData.forEach(item => {
            typeOptions.push(
              {
                label: item.name,
                value: item.s_type,
                sdt_id: item.sdt_id,
                sdt_type: item.id
              }
            )
          })
          this.typeOptions = typeOptions
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
    /* 模板 */
    itemClick () {
      const typeOptions = this.typeOptions
      const type = this.formData.type
      const nowType = typeOptions.find(item => {
        return item.value === Number.parseInt(type)
      })
      this.sdtId = nowType.sdt_id
      this.sdtType = nowType.sdt_type
      let itemIds = this.formData.itemIds
      if (itemIds) {
        this.itemSelection = itemIds.split(',')
      } else {
        this.itemSelection = []
      }
      this.itemDialog = true
    },
    temUpdata (obj) {
      const itemIds = obj.ids.join(',')
      this.formData.itemIds = itemIds
      this.itemTable = obj.itemData
      this.itemDialog = false
    },
    temCancel () {
      this.itemDialog = false
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.addInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
