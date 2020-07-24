<template>
  <el-dialog title="导入GPS车辆" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="up-file">
      <span class="txt">导入文件</span>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :headers="reqHead"
        :on-success="upFileSuccess"
        :on-error="upFileError"
        :multiple="false"
        :file-list="fileList">
        <el-button size="small" type="primary">点击导入</el-button>
      </el-upload>
      <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑地址信息</p>
      <!--<p class="up-hint">&nbsp;&nbsp;&nbsp;&nbsp;2.导入的用户文件仅支持excel文件</p>-->
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      reqUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      fileList: []
    }
  },
  created () {
    // 设置上传参数
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
    }
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
    upInit () {
      let params = {
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.gpsApi() + '/excelImport?' + params
      this.reqUrl = reqUrl
      // 清空导入文件提示
      this.fileList = []
    },
    // 成功
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 更新数据
        this.$emit('parentUpdata')
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范且名称和MAC地址是否重复！',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件导入失败！',
          type: 'error'
        })
      }
    },
    // 失败
    upFileError () {
      this.$message({
        showClose: true,
        message: '文件导入失败！',
        type: 'error'
      })
    },
    // 下载模板
    downTemplate () {
      window.location.href = this.gpsApi() + '/excelExport?project_id=' + this.projectId
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.upInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
