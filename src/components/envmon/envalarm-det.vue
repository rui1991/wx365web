<template>
  <div>
    <!-- 详情 -->
    <el-dialog title="告警记录详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :label-width="formLabelWidth">
        <el-form-item label="告警时间">
          <el-input :disabled="true" v-model="formData.time"></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input :disabled="true" v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-input :disabled="true" v-model="formData.type"></el-input>
        </el-form-item>
        <el-form-item label="设备位置">
          <el-input :disabled="true" v-model="formData.position"></el-input>
        </el-form-item>
        <el-form-item label="DevEui">
          <el-input :disabled="true" v-model="formData.DevEui"></el-input>
        </el-form-item>
        <el-form-item label="推送人">
          <el-input type="textarea" :disabled="true" v-model="formData.crew"></el-input>
        </el-form-item>
        <el-form-item label="告警内容">
          <el-input type="textarea" :disabled="true" v-model="formData.content"></el-input>
        </el-form-item>
      </el-form>
      <h4 class="title">日志内容：</h4>
      <el-table class="select-table" :data="formData.logData" style="width: 100%;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="追加时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_user_name" width="80" label="追加人"></el-table-column>
        <el-table-column prop="content" label="说明" :show-overflow-tooltip="true"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        time: '',
        name: '',
        type: '',
        position: '',
        DevEui: '',
        crew: '',
        content: '',
        logData: []
      }
    }
  },
  created () {

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
    detInit () {
      this.formData = {
        time: '',
        name: '',
        type: '',
        position: '',
        DevEui: '',
        crew: '',
        content: '',
        logData: []
      }
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        lam_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selAlarmDetails',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          let time = itemData.alarm_time
          time = this.$common.formatDate(time)
          this.formData = {
            time: time,
            name: itemData.node_name,
            type: itemData.node_type,
            position: itemData.location_name,
            DevEui: itemData.dev_eui,
            crew: itemData.push_user,
            content: itemData.alarm_message,
            logData: itemData.appends
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 关闭 */
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .title{
    height: 35px;
    font-size: 16px;
    font-weight: 600;
  }
</style>
