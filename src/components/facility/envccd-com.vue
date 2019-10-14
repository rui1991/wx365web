<template>
  <div>
    <!-- 编辑 -->
    <el-dialog title="编辑设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-input :disabled="true" v-model.trim="formData.type" auto-complete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="设备类型" prop="type">-->
          <!--<el-select :disabled="true" v-model="formData.type" placeholder="请选择设备类型">-->
            <!--<el-option-->
              <!--v-for="item in typeOptions"-->
              <!--:key="item.value"-->
              <!--:label="item.label"-->
              <!--:value="item.value">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="授权码" prop="code">-->
          <!--<el-input v-model.trim="formData.code" auto-complete="off"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="设备位置" prop="posName">
          <el-input :disabled="true" v-model="formData.posName"></el-input>
          <el-button type="primary" @click="posDialog = true">选择位置</el-button>
        </el-form-item>
        <el-form-item label="DevEui" prop="DevEui">
          <el-input :disabled="true" v-model.trim="formData.DevEui" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="AppEui" prop="AppEui">
          <el-input :disabled="true" v-model.trim="formData.AppEui" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="AppKey" prop="AppKey">
          <el-input :disabled="true" v-model.trim="formData.AppKey" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="心跳时间" prop="beat">
          <el-input placeholder="请输入心跳时间" type="number" v-model="formData.beat">
            <template slot="append">分钟</template>
          </el-input>
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
  props: ['parentDialog', 'parentId', 'parentData'],
  data () {
    return {
      typeOptions: [
        {
          label: '温湿度',
          value: 45
        },
        {
          label: '无线水浸',
          value: 25
        },
        {
          label: '无线烟感',
          value: 39
        },
        {
          label: '报警设备',
          value: 44
        }
      ],
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        // type: [
        //   { required: true, message: '请输入设备类型', trigger: 'change' }
        // ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        posName: [
          { required: true, message: '请选择设备位置', trigger: 'change' }
        ],
        DevEui: [
          { required: true, message: '请输入设备DevEui', trigger: 'blur' }
        ],
        AppEui: [
          { required: true, message: '请输入设备AppEui', trigger: 'blur' }
        ],
        AppKey: [
          { required: true, message: '请输入设备AppKey', trigger: 'blur' }
        ],
        beat: [
          { required: true, message: '请输入设备心跳时间', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        typeValue: 0,
        type: '',
        code: '',
        posName: '',
        posId: '',
        DevEui: '',
        AppEui: '',
        AppKey: '',
        beat: '',
        lastTime: '',
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
    comInit () {
      this.formData = this.parentData
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
        project_id: this.projectId,
        name: this.formData.name,
        type: this.formData.typeValue,
        authCode: this.formData.code,
        location_id: this.formData.posId,
        devEUI: this.formData.DevEui,
        appEUI: this.formData.AppEui,
        appKey: this.formData.AppKey,
        out_time: this.formData.beat,
        description: this.formData.describe
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/altNode/' + this.parentId,
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
        this.comInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
