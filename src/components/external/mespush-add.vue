<template>
  <!-- 新增 -->
  <el-dialog title="新增设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model.trim="formData.projectName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="消息类型" prop="type">
        <el-select style="width: 100%;" v-model="formData.type" placeholder="请选择消息类型">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentName', 'parentId'],
  data () {
    return {
      typeOptions: [
        {
          label: '巡检任务',
          value: 1
        },
        {
          label: '固定岗',
          value: 2
        }
      ],
      formLabelWidth: '100px',
      rules: {
        projectName: [
          { required: true, message: '请选择项目', trigger: 'blue' }
        ],
        type: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ]
      },
      formData: {
        projectName: '',
        type: 1
      },
      disabled: false
    }
  },
  created () {

  },
  methods: {
    // 初始化数据
    addInit () {
      this.formData = {
        projectName: this.parentName,
        type: 1
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
        state: 0,
        project_id: this.parentId,
        type: this.formData.type
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/pushSetOO',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
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
