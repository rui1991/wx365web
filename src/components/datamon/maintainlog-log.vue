<template>
  <div>
    <el-dialog :title="modTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="最后处理方式" prop="way">
          <el-select v-model="formData.way" placeholder="请选择处理方式">
            <el-option
              v-for="item in wayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="完成处理日期" prop="accomplishDate">
          <el-date-picker
            v-model="formData.accomplishDate"
            :clearable="false"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="维修结果说明" prop="resultExplain">
          <el-input type="textarea" maxlength="100" v-model.trim="formData.resultExplain"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" v-model.trim="formData.remark"></el-input>
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
/*
* 参数说明：
* ed_id 设备ID
* project_name 所属项目
* device_type 设备类型
* device_mac 设备MAC
* back_date 返回日期
* back_factory 是否返厂
* primary_inspect_explain 初检说明
* handle_state 处理状态
* handle_result 处理结果
* handle_continue_date 处理完成日期
* back_factory_explain 返厂维修结果说明
* remarks 备注
* 父组件参数说明
* parentIds 设备ID  1,2,3
* parentTypeid 记录类型；    1单个    2批量
* */
export default{
  props: ['parentDialog', 'parentIds', 'parentTypeid'],
  data () {
    return {
      modTitle: '记录维修过程',
      formLabelWidth: '110px',
      rules: {
        way: [
          { required: true, message: '请选择处理方式', trigger: 'change' }
        ],
        accomplishDate: [
          { required: true, message: '请选择完成处理日期', trigger: 'change' }
        ],
        resultExplain: [
          { required: true, message: '请输入维修结果说明', trigger: 'blur' }
        ]
      },
      formData: {
        disposeState: '已处理',
        way: '',
        accomplishDate: '',
        resultExplain: '',
        remark: ''
      },
      wayOptions: [
        {
          value: '寄回',
          label: '寄回'
        },
        {
          value: '报废',
          label: '报废'
        },
        {
          value: '回库',
          label: '回库'
        }
      ],
      disabled: false
    }
  },
  methods: {
    logInit () {
      this.formData = {
        disposeState: '已处理',
        way: '',
        accomplishDate: '',
        resultExplain: '',
        remark: ''
      }
      if (this.parentTypeid === 1) {
        this.modTitle = '记录维修过程'
      } else if (this.parentTypeid === 2) {
        this.modTitle = '批量记录维修过程'
      }
    },
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.parentTypeid === 1) {
            // 单个提交
            this.itemSendRequest()
          } else if (this.parentTypeid === 2) {
            // 批量提交
            this.batchSendRequest()
          }
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 单个提交
    itemSendRequest () {
      let params = {
        ed_id: this.parentIds,
        handle_state: this.formData.disposeState,
        handle_result: this.formData.way,
        handle_continue_date: this.formData.accomplishDate,
        back_factory_explain: this.formData.resultExplain,
        remarks: this.formData.remark
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.runApi() + '/proErrDeviceRepairOnly',
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
    // 批量提交
    batchSendRequest () {
      let params = {
        ed_ids: this.parentIds,
        handle_state: this.formData.disposeState,
        handle_result: this.formData.way,
        handle_continue_date: this.formData.accomplishDate,
        back_factory_explain: this.formData.resultExplain,
        remarks: this.formData.remark
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.runApi() + '/proErrDeviceRepairList',
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
        this.logInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
