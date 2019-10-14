<template>
  <div>
    <!-- 新增 -->
    <el-dialog title="新增网关" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="网关名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="网关ID" prop="id">
          <el-input v-model.trim="formData.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="授权码" prop="code">
          <el-input v-model.trim="formData.code" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="网关位置" prop="posName">
          <el-input :disabled="true" v-model="formData.posName"></el-input>
          <el-button type="primary" @click="posDialog = true">选择位置</el-button>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model.trim="formData.longitude" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model.trim="formData.latitude" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.describe"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 位置 -->
    <pos-module
      :parentDialog="posDialog"
      @parentSelect="posSelect"
      @parentCancel="posCancel">
    </pos-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入位置组件
import posModule from '@/components/facility/hardfac-pos'
export default{
  props: ['parentDialog'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入网关名称', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '请输入网关ID', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        posName: [
          { required: true, message: '请选择网关位置', trigger: 'change' }
        ]
      },
      formData: {
        name: '',
        id: '',
        code: '',
        posName: '',
        posId: '',
        longitude: '',
        latitude: '',
        describe: ''
      },
      posDialog: false,
      disabled: false
    }
  },
  created () {

  },
  components: {
    posModule
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
    // 初始化数据
    addInit () {
      this.formData = {
        name: '',
        id: '',
        code: '',
        posName: '',
        posId: '',
        longitude: '',
        latitude: '',
        describe: ''
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
        project_id: this.projectId,
        name: this.formData.name,
        gatewayEUI: this.formData.id,
        gatewaySeq: this.formData.code,
        longitude: this.formData.longitude,
        latitude: this.formData.latitude,
        location_id: this.formData.posId,
        description: this.formData.describe
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/addGw',
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
    },
    /* 位置选择 */
    posSelect (data) {
      this.formData.posName = data.name
      this.formData.posId = data.id
      this.posDialog = false
    },
    posCancel () {
      this.posDialog = false
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
