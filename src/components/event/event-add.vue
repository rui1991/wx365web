<template>
  <div>
    <el-dialog title="新增事件" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="事件名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="formData.type" @change="typeChange" placeholder="请选择事件类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件状态" prop="state">
          <el-select v-model="formData.state" placeholder="请选择事件状态">
            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件紧急" prop="level">
          <el-select v-model="formData.level" :disabled="leveDisabled" placeholder="请选择事件紧急">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发生位置" prop="site">
          <el-input v-model="formData.site"></el-input>
          <el-button type="primary" @click="siteDialog = true">选择地址</el-button>
        </el-form-item>
        <el-form-item label="提醒给谁" prop="crew">
          <el-select v-model="formData.crew" multiple collapse-tags placeholder="请选择提醒人员">
            <el-option v-for="item in parentCrew" :key="item.user_id" :label="item.user_name" :value="item.user_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件内容" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :headers="reqHead"
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
  props: ['parentDialog', 'parentCrew'],
  data () {
    return {
      formLabelWidth: '100px',
      typeOptions: [
        {
          label: '设备',
          value: '0'
        },
        {
          label: '公告',
          value: '1'
        },
        {
          label: '日常',
          value: '6'
        }
      ],
      stateOptions: [
        {
          label: '已处理',
          value: '1'
        },
        {
          label: '未处理',
          value: '2'
        }
      ],
      levelOptions: [
        {
          label: '一般',
          value: '0'
        },
        {
          label: '重要',
          value: '1'
        },
        {
          label: '紧急',
          value: '2'
        }
      ],
      rules: {
        name: [
          { required: true, message: '请输入事件名称', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入事件内容', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        type: '6',
        state: '2',
        level: '0',
        site: '',
        crew: [],
        remark: ''
      },
      reqUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      imgLimit: 9,
      fileList: [],
      leveDisabled: false,
      disabled: false,
      siteDialog: false
    }
  },
  mounted () {
    // 设置上传图片地址
    this.reqUrl = this.sysetApi() + '/upload?state=2&user_id=' + this.userId
    // 设置上传参数
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
    }
  },
  components: {
    siteModule
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
    addInit () {
      this.formData = {
        name: '',
        type: '6',
        state: '2',
        level: '0',
        site: '',
        crew: [],
        remark: ''
      }
      this.fileList = []
    },
    // 选择类型
    typeChange (type) {
      if (type === '1') {
        this.formData.level = '2'
        this.leveDisabled = true
      } else {
        this.leveDisabled = false
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
      const fileList = this.fileList
      let fileName = []
      fileList.forEach(item => {
        fileName.push(item.response)
      })
      let imgUrls = fileName.join('/')
      if (imgUrls) {
        imgUrls = '/' + imgUrls
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        event_title: this.formData.name,
        event_type: this.formData.type,
        event_state: this.formData.state,
        event_level: this.formData.level,
        atuserid: this.formData.crew.join(','),
        atgroupid: '',
        event_content: this.formData.remark,
        address: this.formData.site,
        user_name: this.userName,
        add_info: imgUrls
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/addIEventNew',
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
