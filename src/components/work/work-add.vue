<template>
  <div>
    <el-dialog title="新增工单" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="工单名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="发生地址" prop="site">
          <el-input v-model="formData.site"></el-input>
          <el-button type="primary" @click="siteDialog = true">选择地址</el-button>
        </el-form-item>
        <el-form-item label="业务类别" prop="sort">
          <el-select style="width: 100%;" v-model="formData.sort" clearable placeholder="请选择业务类别">
            <el-option
              v-for="item in parentSort"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="派单" prop="crew">
          <el-select style="width: 100%;" v-model="formData.crew" clearable placeholder="请选择执行人员">
            <el-option
              v-for="item in parentCrew"
              :key="item.user_id"
              :label="item.user_name"
              :value="item.user_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :file-list="fileList"
        :multiple="true"
        :limit="imgLimit"
        list-type="picture">
        <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip" style="padding-left: 100px; color: red;">只能上传jpg/png文件，大小不超过2048kb，且最多只能上传9张！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 地址 -->
    <site-module
      :parentDialog="siteDialog"
      @parentUpdata="siteUpdata"
      @parentCancel="siteCancel">
    </site-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入地址组件
import siteModule from '@/components/work/work-site'
export default{
  props: ['parentDialog', 'parentSort', 'parentCrew'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入工单名称', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        site: '',
        sort: '',
        crew: '',
        remark: ''
      },
      reqUrl: '',
      imgLimit: 9,
      fileList: [],
      disabled: false,
      siteDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 设置上传地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id' + this.userId
  },
  components: {
    siteModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    ),
    navActive: {
      get () {
        return this.$store.state.workNavActive
      },
      set (value) {
        this.$store.commit('setWorkNav', value)
      }
    }
  },
  methods: {
    addInit () {
      this.formData = {
        name: '',
        site: '',
        sort: '',
        crew: '',
        remark: ''
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
      let fileName = []
      fileList.forEach(item => {
        fileName.push(item.response)
      })
      const imgUrls = fileName.join('/')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        wo_name: this.formData.name,
        address: this.formData.site,
        business_type: this.formData.sort,
        content: this.formData.remark,
        wo_from: '维修报修',
        accept_user: this.formData.crew,
        isd_id: '',
        attachment: imgUrls
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/addWo',
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
    /* 地址 */
    siteUpdata (name) {
      this.formData.site = name
      this.siteDialog = false
    },
    siteCancel () {
      this.siteDialog = false
    },
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      this.fileList = fileList
    },
    // 上传图片失败
    handleError () {
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
  }
}
</script>

<style lang="less" scoped>

</style>
