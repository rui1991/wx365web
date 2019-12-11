<template>
  <el-dialog title="追加日志" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="添加消息" prop="content">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.content"></el-input>
      </el-form-item>
    </el-form>
    <el-upload
      class="upload-demo"
      :action="reqUrl"
      :headers="reqHead"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :multiple="false"
      :file-list="fileList"
      list-type="picture">
      <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip" style="padding-left: 100px; color: red;">只能上传jpg/png文件，大小不超过2048kb，且只能上传一张！</div>
    </el-upload>
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
    return {
      formLabelWidth: '100px',
      rules: {
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      },
      formData: {
        content: ''
      },
      reqUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      fileList: [],
      disabled: false
    }
  },
  created () {

  },
  mounted () {
    // 设置上传图片地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id=' + this.userId
    // 设置上传参数
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
    }
  },
  computed: {
    ...mapState('user', [
      'userId',
      'userName'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    logInit (id) {
      this.formData = {
        content: ''
      }
      this.fileList = []
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
      const fileList = this.fileList
      let imgUrl = ''
      if (fileList.length > 0) {
        imgUrl = fileList[0].response
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        wo_id: this.parentId,
        user_name: this.userName,
        follow_content: this.formData.content,
        follow_attachment: imgUrl
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/addWoFollow',
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
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      this.fileList = fileList
    },
    // 上传图片失败
    handleError (err, file, fileList) {
      this.$message({
        showClose: true,
        message: '上传图片失败，请稍后再试！',
        type: 'error'
      })
    },
    // 删除图片
    handleRemove (file, fileList) {
      this.fileList = fileList
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
.work-item{
  .paging{
    margin-top: 20px;
  }
}
</style>
