<template>
  <div>
    <el-dialog title="录入" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="所属项目" prop="proName">
          <el-input v-model.trim="formData.proName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择设备类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model.trim="formData.deviceId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="返回日期" prop="returnDate">
          <el-date-picker
            v-model="formData.returnDate"
            :clearable="false"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否返厂维修" prop="whetherMaintain">
          <el-radio-group v-model="formData.whetherMaintain">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="初检说明" prop="explain">
          <el-input type="textarea" maxlength="100" v-model.trim="formData.explain"></el-input>
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
* */
export default{
  props: ['parentDialog'],
  data () {
    return {
      formLabelWidth: '110px',
      rules: {
        proName: [
          { required: true, message: '请输入所属项目', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        deviceId: [
          { required: true, message: '请输入设备ID', trigger: 'blur' }
        ],
        returnDate: [
          { required: true, message: '请选择返回日期', trigger: 'change' }
        ],
        whetherMaintain: [
          { required: true, message: '请选择是否返厂维修', trigger: 'change' }
        ],
        explain: [
          { required: true, message: '请输入初检说明', trigger: 'blur' }
        ]
      },
      formData: {
        proName: '',
        type: '',
        deviceId: '',
        returnDate: '',
        whetherMaintain: '是',
        explain: ''
      },
      typeOptions: [
        {
          value: '无感采集卡',
          label: '无感采集卡'
        },
        {
          value: '有感采集卡',
          label: '有感采集卡'
        },
        {
          value: '无感基站',
          label: '无感基站'
        },
        {
          value: '数据网关',
          label: '数据网关'
        },
        {
          value: 'lora卡片',
          label: 'lora卡片'
        },
        {
          value: 'lora网关',
          label: 'lora网关'
        },
        {
          value: '传感器',
          label: '传感器'
        },
        {
          value: '手环',
          label: '手环'
        },
        {
          value: '车载',
          label: '车载'
        },
        {
          value: '其他',
          label: '其他'
        }
      ],
      disabled: false
    }
  },
  methods: {
    addInit () {
      this.formData = {
        proName: '',
        type: '',
        deviceId: '',
        returnDate: this.$common.getNowDate('yyyy-mm-dd'),
        whetherMaintain: '是',
        explain: ''
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
      let params = {
        project_name: this.formData.proName,
        device_type: this.formData.type,
        device_mac: this.formData.deviceId,
        back_date: this.formData.returnDate,
        back_factory: this.formData.whetherMaintain,
        primary_inspect_explain: this.formData.explain
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.runApi() + '/proErrDeviceAdd',
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
