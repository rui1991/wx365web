<template>
  <div>
    <el-dialog title="设置打卡规则" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="部门" prop="sector">
          <el-select v-model="formData.sector" placeholder="请选择部门" @change="sectionChang">
            <el-option
              v-for="item in sectorOptions"
              :key="item.base_id"
              :label="item.name"
              :value="item.base_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="formData.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" :disabled="crewDisabled" @click="crewClick">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div class="add">
        <p class="add-txt">时间段：</p>
      </div>
      <div class="times">
        <el-row class="times-item" v-for="(item, index) in times" :key="index">
          <el-col :span="14">
            <el-time-picker
              style="width: 240px;"
              is-range
              arrow-control
              v-model="item.time"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
              :time-arrow-control="true"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围">
            </el-time-picker>
          </el-col>
          <el-col :span="6">
            <el-input v-model.number="item.frequency" auto-complete="off" type="number">
              <template slot="append">次</template>
            </el-input>
          </el-col>
          <el-col :span="4" class="icon">
            <i class="el-icon-circle-plus-outline blue" style="cursor: pointer; margin-right: 5px;" @click="addTime"></i>
            <i class="el-icon-delete red" style="cursor: pointer;" @click="delTime(index)" v-if="index !== 0"></i>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentOrgid="orgId"
      :parentIds="formData.crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox2'
export default{
  props: ['parentDialog', 'parentId', 'parentForm', 'parentTimes'],
  data () {
    return {
      formLabelWidth: '80px',
      sectorOptions: [],
      rules: {
        sector: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        crewName: [
          { required: true, message: '请选择人员', trigger: 'change' }
        ]
      },
      formData: {
        sector: '',
        crewName: '',
        crewId: []
      },
      orgId: 0,
      crewDisabled: true,
      crewDialog: false,
      times: [],
      disabled: true
    }
  },
  created () {

  },
  components: {
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 初始化数据
    comInit () {
      this.formData = JSON.parse(JSON.stringify(this.parentForm))
      // 时段
      const times = this.formatTimes()
      const length = times.length
      if (length === 0) {
        this.times = []
        this.addTime()
      } else {
        this.times = times
      }
      if (this.sectorOptions.length === 0) {
        // 获取部门
        this.getSectorOptions()
      }
    },
    formatTimes () {
      const timeData = this.parentTimes
      let times = []
      timeData.forEach(item => {
        times.push(
          {
            time: item.time.split('-'),
            frequency: item.frequency
          }
        )
      })
      return times
    },
    // 添加时段
    addTime () {
      this.times.push(
        {
          time: ['00:00', '23:59'],
          frequency: 1
        }
      )
    },
    // 删除时段
    delTime (index) {
      this.times.splice(index, 1)
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
      // 人员
      let crewId = this.formData.crewId
      crewId = crewId.join('/')
      // 全部时段
      const allData = this.times
      let allTime = []
      let detTime = []
      allData.forEach(item => {
        let frequency = Number.parseInt(item.frequency)
        if (frequency <= 0) {
          frequency = 1
        }
        const detItem = this.proTimeNode(item.time[0], item.time[1], frequency)
        detTime = detTime.concat(detItem)
        allTime.push(
          {
            time: item.time[0] + '-' + item.time[1],
            frequency: frequency
          }
        )
      })
      allTime = JSON.stringify(allTime)
      detTime = detTime.join('/')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentId,
        ogz_id: this.formData.sector,
        users: crewId,
        all: allTime,
        det: detTime
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/setPermanentPosition',
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
      this.$emit('parentCancel')
    },
    // 处理时间段
    proTimeNode (time1, time2, count) {
      // 开始时间
      const startTime = this.proTimeSecond(time1)
      // 结束时间
      const endTime = this.proTimeSecond(time2)
      // 单位时间
      const unitTime = Math.round((endTime - startTime) / count)
      // 时间段
      let timeNodes = []
      for (let i = 0; i < count; i++) {
        let startNode = startTime + unitTime * i
        startNode = this.formatTimeNode(startNode)
        let endNode = startTime + unitTime * (i + 1)
        endNode = this.formatTimeNode(endNode)
        let nodeItem = startNode + '-' + endNode
        timeNodes.push(nodeItem)
      }
      return timeNodes
    },
    // 格式化秒数
    proTimeSecond (time) {
      const timeArr = time.split(':')
      const minute = Number.parseInt(timeArr[0])
      const second = Number.parseInt(timeArr[1])
      return minute * 60 + second
    },
    // 格式化时间
    formatTimeNode (time) {
      let minute = Number.parseInt(time / 60) + ''
      if (minute === '24') {
        return '23:59'
      }
      minute = minute.padStart(2, '0')
      let second = time % 60 + ''
      second = second.padStart(2, '0')
      return minute + ':' + second
    },
    /* 部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 选择部门
    sectionChang () {
      this.formData.crewName = ''
      this.formData.crewId = []
    },
    /* 人员 */
    crewClick () {
      // 组织ID
      const sector = this.formData.sector
      const nowSector = this.sectorOptions.find(item => {
        return item.base_id === sector
      })
      this.orgId = nowSector.id
      this.crewDialog = true
    },
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
        this.comInit()
      }
    },
    'formData.sector' (val, oldVal) {
      if (val) {
        this.crewDisabled = false
      } else {
        this.crewDisabled = true
      }
    },
    times (val, oldVal) {
      if (this.parentDialog) {
        if (val.length === 0) {
          this.disabled = true
        } else {
          this.disabled = false
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .add{
    display: flex;
    align-items: center;
    height: 45px;
    .add-txt {
      width: 80px;
      padding-right: 5px;
      text-align: right;
    }
  }
  .times{
    .times-item {
      padding-left: 80px;
      margin-bottom: 10px;
      .icon{
        line-height: 40px;
        text-align: right;
        font-size: 20px;
      }
    }
  }
</style>
