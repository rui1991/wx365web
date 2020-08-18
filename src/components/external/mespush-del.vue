<template>
  <el-dialog title="提示" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <p class="hint-text"><i class="el-icon-warning"></i>是否要关闭该消息推送？</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentId', 'parentType'],
  data () {
    return {
      disabled: false
    }
  },
  created () {

  },
  methods: {
    // 确定
    submitClick () {
      let params = {
        state: 1,
        project_id: this.parentId,
        type: this.parentType
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/pushSetOO',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
