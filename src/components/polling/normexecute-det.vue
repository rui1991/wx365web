<template>
  <div>
    <el-dialog title="巡检标准执行详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="tableData" style="width: 100%" max-height="360">
        <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
        <el-table-column prop="inspect_name" width="140" :show-overflow-tooltip="true" label="检查项"></el-table-column>
        <el-table-column prop="inspect_contents" :show-overflow-tooltip="true" label="检查内容及结果"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="检查结果">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="blue" @click="checkImg(scope.row.ending)" v-if="scope.row.expression === 5">查看图片</a>
            <span v-else>{{ scope.row.ending }}</span>
          </template>
        </el-table-column>
      </el-table>
      <p class="hint">备注：{{ remarks }}</p>
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
  props: ['parentDialog', 'parentPt', 'parentOs'],
  data () {
    return {
      tableData: [],
      remarks: '',
      imgDialog: false,
      imgsUrl: []
    }
  },
  components: {
    imgModule
  },
  computed: {
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    detInit () {
      this.tableData = []
      this.remarks = ''
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        project_id: this.projectId,
        pt_id: this.parentPt,
        os_id: this.parentOs
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsTaskIsm',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const tableData = res.data.data1
          this.tableData = tableData
          if (tableData.length === 0) {
            this.remarks = ''
          } else {
            this.remarks = tableData[0].remarks
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
    /* 图片 */
    checkImg (str) {
      let arr = []
      if (str) {
        arr = str.split(',')
      }
      let imgsUrl = []
      arr.forEach((item, index) => {
        let imgUrl = this.sysetApi() + '/showImage?state=2&filename=' + item
        imgsUrl.push({
          id: index + 1,
          imgUrl: imgUrl
        })
      })
      this.imgsUrl = imgsUrl
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
  .hint{
    display: flex;
    height: 35px;
    align-items: center;
    font-size: 14px;
    color: #666666;
  }
</style>
