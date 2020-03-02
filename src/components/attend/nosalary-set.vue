<template>
  <div>
    <el-dialog title="设置地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="进入地址" prop="inIds">
          <el-input type="textarea" maxlength="100" disabled placeholder="请选择进入地址" v-model="formData.inNames"></el-input>
          <el-button type="primary" @click="inClick">选择地址</el-button>
        </el-form-item>
        <el-form-item label="离开地址" prop="outIds">
          <el-input type="textarea" maxlength="100" disabled placeholder="请选择离开地址" v-model="formData.outNames"></el-input>
          <el-button type="primary" @click="outClick">选择地址</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <site-module
      :parentDialog="siteDialog"
      :parentIds="ids"
      @parentUpdata="siteUpdata"
      @parentCancel="siteCancel">
    </site-module>
  </div>
</template>

<script>
import {mapState} from 'vuex'
// 引入地址组件
import siteModule from '@/components/attend/nosalary-site'
export default {
  props: ['parentDialog'],
  data () {
    let checkSite = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请选择离开地址'))
      } else {
        let inIds = this.formData.inIds
        let state = false
        for (let i = 0; i < value.length; i++) {
          if (inIds.indexOf(value[i]) !== -1) {
            state = true
            break
          }
        }
        if (state) {
          callback(new Error('离开地址与进入地址重复'))
        } else {
          callback()
        }
      }
    }
    return {
      formLabelWidth: '100px',
      rules: {
        inIds: [
          { type: 'array', required: true, message: '请选择进入地址', trigger: 'change' }
        ],
        outIds: [
          { required: true, validator: checkSite, trigger: 'change' }
        ]
      },
      formData: {
        inNames: '',
        inIds: [],
        outNames: '',
        outIds: []
      },
      disabled: false,
      siteDialog: false,
      ids: [],
      type: ''
    }
  },
  components: {
    siteModule
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
    setInit () {
      this.formData = {
        inNames: '',
        inIds: [],
        outNames: '',
        outIds: []
      }
      this.getDetails()
    },
    // 查询
    getDetails () {
      let params = {
        project_id: this.projectId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/att/selAttPo',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          if (itemData.length === 0) {
            return
          }
          const inData = itemData[0]
          const outData = itemData[1]
          let inNames = ''
          let inIds = ''
          let outNames = ''
          let outIds = ''
          if (inData.att_type === 0) {
            inNames = inData.position_name || ''
            inIds = inData.position_id || ''
            inIds = inIds.split(',')
            outNames = outData.position_name || ''
            outIds = outData.position_id || ''
            outIds = outIds.split(',')
          } else if (inData.att_type === 1) {
            inNames = outData.position_name || ''
            inIds = outData.position_id || ''
            inIds = inIds.split(',')
            outNames = inData.position_name || ''
            outIds = inData.position_id || ''
            outIds = outIds.split(',')
          }
          this.formData = {
            inNames: inNames,
            inIds: inIds,
            outNames: outNames,
            outIds: outIds
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
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
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
      // 进入
      let inIds = this.formData.inIds
      inIds = inIds.join(',')
      // 离开
      let outIds = this.formData.outIds
      outIds = outIds.join(',')
      let params = {
        project_id: this.projectId,
        user_id: this.userId,
        in_att: inIds,
        out_att: outIds
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/att/addAttPo',
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
    // 进入
    inClick () {
      this.ids = this.formData.inIds
      this.type = 'in'
      this.siteDialog = true
    },
    // 离开
    outClick () {
      this.ids = this.formData.outIds
      this.type = 'out'
      this.siteDialog = true
    },
    // 确定
    siteUpdata (data) {
      let ids = data.ids
      let names = data.names.join('、')
      if (this.type === 'in') {
        this.formData.inNames = names
        this.formData.inIds = ids
      } else if (this.type === 'out') {
        this.formData.outNames = names
        this.formData.outIds = ids
      }
      this.siteDialog = false
    },
    // 取消
    siteCancel () {
      this.siteDialog = false
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.setInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
