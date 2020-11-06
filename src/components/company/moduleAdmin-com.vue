<template>
  <div class="orange-module">
    <h3 class="module-title">编辑模块</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="上级模块">
        <el-input :disabled="true" v-model="parentFuPath"></el-input>
      </el-form-item>
      <el-form-item label="模块名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="全路径">
        <el-input :disabled="true" v-model.trim="allPath" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div class="module-operate">
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">保 存</el-button>
    </div>
  </div>
</template>

<script>
/*
* 新增分公司、项目、部门
* */
import { mapState } from 'vuex'
export default{
  props: ['parentFuId', 'parentId', 'parentName', 'parentFuPath'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入模块名称', trigger: 'blur'}
        ]
      },
      formData: {
        name: ''
      },
      disabled: false
    }
  },
  created () {

  },
  mounted () {

  },
  components: {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    allPath () {
      if (this.parentFuPath) {
        return this.parentFuPath + '>' + this.formData.name
      } else {
        return this.formData.name
      }
    }
  },
  methods: {
    comInit () {
      // 重置表单
      this.resetForm('ruleForm')
      this.formData.name = this.parentName
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
        parent_fun_id: this.parentFuId,
        function_id: this.parentId,
        function_name: this.formData.name,
        all_name: this.allPath,
        describe: ''
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/altFun',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '模块编辑成功',
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
    }
  },
  watch: {
    parentId (val, oldVal) {
      if (val) {
        this.comInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .orange-module{
    width: 600px;
    margin: 0 auto;
    .module-title{
      height: 40px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }
    .module-operate {
      margin-top: 30px;
      text-align: center;
    }
  }
</style>
