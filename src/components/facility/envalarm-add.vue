<template>
  <div>
    <!-- 新增 -->
    <el-dialog title="新增告警规则" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="告警设备" prop="ccdName">
          <el-input :disabled="true" type="textarea" v-model="formData.ccdName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="ccdDialog = true">选择设备</el-button>
        </el-form-item>
        <el-form-item label="告警推送人" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="formData.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="crewDialog = true">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div class="item">
        <div class="item-top">
          <span class="txt">是否设置温湿度阀值</span>
          <el-radio-group v-model="ccdParam.humiState">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </div>
        <div class="item-content" v-show="humiShow">
          <div class="content-single">
            <span>最高温度达到</span>
            <el-input style="width: 180px; margin-left: 5px; margin-right: 5px;" placeholder="温度" type="number" value="0" v-model.number="ccdParam.tempMax">
              <template slot="append">℃</template>
            </el-input>
            <span>进行告警</span>
          </div>
          <div class="content-single">
            <span>最低温度达到</span>
            <el-input style="width: 180px; margin-left: 5px; margin-right: 5px;" placeholder="温度" type="number" value="0" v-model.number="ccdParam.tempMin">
              <template slot="append">℃</template>
            </el-input>
            <span>进行告警</span>
          </div>
          <div class="content-single">
            <span>最高湿度达到</span>
            <el-input style="width: 180px; margin-left: 5px; margin-right: 5px;" placeholder="湿度" type="number" value="0" v-model.number="ccdParam.moisMax">
              <template slot="append">%</template>
            </el-input>
            <span>进行告警</span>
          </div>
          <div class="content-single">
            <span>最低湿度达到</span>
            <el-input style="width: 180px; margin-left: 5px; margin-right: 5px;" placeholder="湿度" type="number" value="0" v-model.number="ccdParam.moisMin">
              <template slot="append">%</template>
            </el-input>
            <span>进行告警</span>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="item-top">
          <span class="txt">是否设置水浸阀值</span>
          <el-radio-group v-model="ccdParam.waterState">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </div>
        <div class="item-content" v-show="waterShow">
          <el-radio-group class="content-radio" v-model="ccdParam.waterValue">
            <el-radio label="wet">浸水自动报警</el-radio>
            <el-radio label="dry">无水自动报警</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 设备 -->
    <ccd-module
      :parentDialog="ccdDialog"
      :parentIds="formData.ccdId"
      @parentUpdata="ccdSelect"
      @parentCancel="ccdCancel">
    </ccd-module>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentIds="formData.crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入位置组件
import ccdModule from '@/components/facility/envalarm-ccd'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox'
export default{
  props: ['parentDialog'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        ccdName: [
          { required: true, message: '请选择告警设备', trigger: 'change' }
        ],
        crewName: [
          { required: true, message: '请选择告警推送人', trigger: 'change' }
        ]
      },
      formData: {
        ccdName: '',
        ccdId: [],
        crewName: '',
        crewId: []
      },
      ccdParam: {
        humiState: 1,
        tempMax: '',
        tempMin: '',
        moisMax: '',
        moisMin: '',
        waterState: 1,
        waterValue: ''
      },
      humiShow: false,
      waterShow: false,
      ccdDialog: false,
      crewDialog: false,
      disabled: false
    }
  },
  created () {

  },
  components: {
    ccdModule,
    crewModule
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
        ccdName: '',
        ccdId: [],
        crewName: '',
        crewId: []
      }
      this.ccdParam = {
        humiState: 1,
        tempMax: '',
        tempMin: '',
        moisMax: '',
        moisMin: '',
        waterState: 1,
        waterValue: ''
      }
      this.humiShow = false
      this.waterShow = false
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
      // 设备ID
      let ccdId = this.formData.ccdId
      ccdId = ccdId.join(',')
      // 告警人ID
      let crewId = this.formData.crewId
      crewId = crewId.join(',')
      // 告警内容
      let content = ''
      // 温湿度
      const humiState = this.ccdParam.humiState
      // 温度
      let tempMaxVal = ''
      let tempMinVal = ''
      let tempMax = Number.parseFloat(this.ccdParam.tempMax)
      let tempMin = Number.parseFloat(this.ccdParam.tempMin)
      // 湿度
      let moisMaxVal = ''
      let moisMinVal = ''
      let moisMax = Number.parseFloat(this.ccdParam.moisMax)
      let moisMin = Number.parseFloat(this.ccdParam.moisMin)
      if (humiState === 0) {
        if (tempMax && tempMin) {
          if (tempMax >= tempMin) {
            tempMaxVal = tempMax
            tempMinVal = tempMin
          } else {
            tempMaxVal = tempMin
            tempMinVal = tempMax
          }
          content += '最高温度达到' + tempMaxVal + '℃进行告警；'
          content += '最低温度达到' + tempMinVal + '℃进行告警；'
        } else {
          if (tempMax) {
            tempMaxVal = tempMax
            content += '最高温度达到' + tempMaxVal + '℃进行告警；'
          }
          if (tempMin) {
            tempMinVal = tempMin
            content += '最低温度达到' + tempMinVal + '℃进行告警；'
          }
        }
        if (moisMax && moisMin) {
          moisMax >= 0 ? moisMax = moisMax : moisMax = 0
          moisMin >= 0 ? moisMin = moisMin : moisMin = 0
          if (moisMax >= moisMin) {
            moisMaxVal = moisMax
            moisMinVal = moisMin
          } else {
            moisMaxVal = moisMin
            moisMinVal = moisMax
          }
          content += '最高湿度达到' + moisMaxVal + '%进行告警；'
          content += '最低湿度达到' + moisMinVal + '%进行告警；'
        } else {
          if (moisMax) {
            moisMax >= 0 ? moisMax = moisMax : moisMax = 0
            moisMaxVal = moisMax
            content += '最高湿度达到' + moisMaxVal + '%进行告警；'
          }
          if (moisMin) {
            moisMin >= 0 ? moisMin = moisMin : moisMin = 0
            moisMinVal = moisMin
            content += '最低湿度达到' + moisMinVal + '%进行告警；'
          }
        }
      }
      // 水浸
      let waterValue = ''
      const waterState = this.ccdParam.waterState
      if (waterState === 0) {
        waterValue = this.ccdParam.waterValue
        if (waterValue === 'wet') {
          content += '浸水自动报警'
        } else if (waterValue === 'dry') {
          content += '无水自动报警'
        }
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        alarm_node: this.formData.ccdName,
        alarm_node_id: ccdId,
        push_user: this.formData.crewName,
        push_user_id: crewId,
        max_temperature: tempMaxVal,
        min_temperature: tempMinVal,
        max_humidity: moisMaxVal,
        min_humidity: tempMinVal,
        dry_wet: waterValue,
        alarm_condition: content,
        las_id: 0
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/setAlarm',
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
    /* 设备选择 */
    ccdSelect (data) {
      this.formData.ccdName = data.names
      this.formData.ccdId = data.ids
      this.ccdDialog = false
    },
    ccdCancel () {
      this.ccdDialog = false
    },
    /* 人员选择 */
    crewUpdata (data) {
      this.formData.crewName = data.names
      this.formData.crewId = data.ids
      this.crewDialog = false
    },
    crewCancel () {
      this.crewDialog = false
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.addInit()
      }
    },
    'ccdParam.humiState' (val, oldVal) {
      if (val === 0) {
        this.humiShow = true
      } else {
        this.humiShow = false
      }
    },
    'ccdParam.waterState' (val, oldVal) {
      if (val === 0) {
        this.waterShow = true
      } else {
        this.waterShow = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .medium-dialog{
    .item{
      border-top: 1px solid #cecece;
      margin-bottom: 10px;
      .item-top{
        display: flex;
        align-items: center;
        height: 35px;
        .txt{
          padding-right: 20px;
        }
      }
      .item-content{
        .content-single{
          display: flex;
          align-items: center;
          height: 50px;
          padding-left: 20px;
        }
        .content-radio{
          display: flex;
          align-items: center;
          height: 35px;
          padding-left: 20px;
        }
      }
    }
  }
</style>
