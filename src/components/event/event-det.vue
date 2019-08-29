<template>
  <el-dialog title="事件详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <h4 class="form-title">事件详情</h4>
    <el-form :model="formData" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece">
      <div class="two-form">
        <el-form-item class="item" label="事件名称">
          <el-input :disabled="true" v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item class="item" label="事件状态">
          <el-input :disabled="true" v-model="formData.state"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="创建人">
          <el-input :disabled="true" v-model="formData.cerCrew"></el-input>
        </el-form-item>
        <el-form-item class="item" label="创建时间">
          <el-input :disabled="true" v-model="formData.creaTime"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="事件类型">
          <el-input :disabled="true" v-model="formData.type"></el-input>
        </el-form-item>
        <el-form-item class="item" label="事件紧急">
          <el-input :disabled="true" v-model="formData.level"></el-input>
        </el-form-item>
      </div>
      <el-form-item class="one-form" label="发生位置">
        <el-input :disabled="true" v-model="formData.site"></el-input>
      </el-form-item>
      <el-form-item class="one-form" label="备注">
        <el-input :disabled="true" type="textarea" maxlength="100" v-model="formData.remark"></el-input>
      </el-form-item>
    </el-form>
    <h4 class="form-title">图片</h4>
    <div class="show-img">
      <div class="images">
        <img :src="item" v-for="item in formData.images" :key="item" height="120" alt="">
      </div>
      <p class="img-hint" v-if="formData.images.length === 0">未上传图片</p>
    </div>
    <el-table class="select-table" :data="formData.logData" style="width: 100%;">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" width="100" label="回复人"></el-table-column>
      <el-table-column label="回复时间">
        <template slot-scope="scope">
          <span>{{ scope.row.discuss_time | formatReplyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="replay" label="回复内容" class-name="multi-row"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        state: '',
        cerCrew: '',
        creaTime: '',
        type: '',
        level: '',
        site: '',
        remark: '',
        images: [],
        logData: []
      }
    }
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId
      }
    )
  },
  methods: {
    detInit () {
      this.formData = {
        name: '',
        state: '',
        cerCrew: '',
        creaTime: '',
        type: '',
        level: '',
        site: '',
        remark: '',
        images: [],
        logData: []
      }
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        user_id: this.userId,
        project_id: this.parentPro,
        te_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/getEventToAll',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 事件状态
          const stateNum = itemData.event_state
          let state = ''
          if (stateNum === 1) {
            state = '已处理'
          } else {
            state = '未处理'
          }
          // 创建时间
          const creaTime = itemData.create_time
          // 类型
          const typpeNum = itemData.event_type
          let type = ''
          if (typpeNum === 0) {
            type = '设备'
          } else if (typpeNum === 1) {
            type = '公告'
          } else if (typpeNum === 6) {
            type = '日常'
          }
          // 事件紧急
          let levelNum = itemData.event_level
          let level = ''
          if (levelNum === 0) {
            level = '一般'
          } else if (levelNum === 1) {
            level = '重要'
          } else if (levelNum === 2) {
            level = '紧急'
          }
          // 图片
          let photo = itemData.add_info || []
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=2&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.discussloong || []
          this.formData = {
            name: itemData.event_title,
            state: state,
            cerCrew: itemData.user_name,
            creaTime: creaTime,
            type: type,
            level: level,
            site: itemData.address,
            remark: itemData.event_content,
            images: images,
            logData: logData
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
    // 关闭
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
  .large-dialog{
    .el-dialog__body{
      .form-title{
        height: 45px;
        line-height: 45px;
        font-size: 16px;
        color: #272727;
      }
      .show-img{
        padding-bottom: 10px;
        border-bottom: 1px solid #cecece;
        margin-bottom: 20px;
        .images{
          text-align: center;
          img{
            margin: 5px;
          }
        }
        .img-hint{
          height: 35px;
          line-height: 35px;
          text-align: center;
        }
      }
      .show-table{
        margin-top: 10px;
        border-radius: 4px;
        border: 1px solid #cecece;
      }
    }
  }
</style>
