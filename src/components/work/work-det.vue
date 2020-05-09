<template>
  <div>
    <el-dialog title="工单详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h4 class="form-title">工单详情</h4>
      <el-form :model="formData" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece">
        <div class="two-form">
          <el-form-item class="item" label="工单名称">
            <el-input :disabled="true" v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="流水号">
            <el-input :disabled="true" v-model="formData.mark"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="所属项目">
            <el-input :disabled="true" v-model="formData.project"></el-input>
          </el-form-item>
          <el-form-item class="item" label="发生位置">
            <el-input :disabled="true" v-model="formData.site"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="业务类别">
            <el-input :disabled="true" v-model="formData.sort"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单来源">
            <el-input :disabled="true" v-model="formData.source"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="formData.creaTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="formData.cerName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="当前处理人">
            <el-input v-model="formData.conductor" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单状态">
            <el-input v-model="formData.state" :disabled="true"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="备注">
          <el-input type="textarea" v-model="formData.remark" :disabled="true"></el-input>
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
        <el-table-column prop="type" width="100" label="操作类型"></el-table-column>
        <el-table-column prop="user_name" width="80" label="执行人"></el-table-column>
        <el-table-column label="执行时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.perform_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column width="100" label="图片">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="com" v-if="scope.row.photo" @click="checkImg(scope.row.photo)">查看</a>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 显示图片 -->
    <img-module
      :parentDialog="imgDialog"
      :parentImgurl="imgsUrl"
      @parentClose="imgClose">
    </img-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入显示图片组件
import imgModule from '@/components/public/show-img'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        mark: '',
        project: '',
        site: '',
        sort: '',
        source: '',
        creaTime: '',
        cerName: '',
        conductor: '',
        state: '',
        remark: '',
        images: [],
        logData: []
      },
      imgDialog: false,
      imgsUrl: []
    }
  },
  components: {
    imgModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    detInit () {
      this.formData = {
        name: '',
        mark: '',
        project: '',
        site: '',
        sort: '',
        source: '',
        creaTime: '',
        cerName: '',
        conductor: '',
        state: '',
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
        wo_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWoOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 创建时间
          const creaTime = this.$common.formatDate(itemData.create_time)
          const stateNum = itemData.wo_state
          // 工单状态
          let state = ''
          if (stateNum === 0) {
            state = '待处理'
          } else if (stateNum === 1) {
            state = '跟进中'
          } else if (stateNum === 2) {
            state = '结单'
          }
          // 图片
          let photo = itemData.photo || ''
          if (photo) {
            photo = photo.split(',')
          } else {
            photo = []
          }
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=10&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.wo_log || []
          this.formData = {
            name: itemData.wo_name,
            mark: itemData.serial_number,
            project: itemData.project_name,
            site: itemData.address,
            sort: itemData.skills_name || '',
            source: itemData.wo_from,
            creaTime: creaTime,
            cerName: itemData.create_user_name,
            conductor: itemData.access_user_name || '',
            state: state,
            remark: itemData.content,
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
    },
    // 查看图片
    checkImg (url) {
      const imgUrl = this.sysetApi() + '/showImage?state=10&filename=' + url
      this.imgsUrl = [
        {
          id: 1,
          imgUrl: imgUrl
        }
      ]
      this.imgDialog = true
    },
    imgClose () {
      this.imgDialog = false
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
    }
  }
</style>
