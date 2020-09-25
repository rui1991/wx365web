<template>
  <el-dialog title="提示" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <p class="hint-text"><i class="el-icon-warning"></i>是否要移除该水表设备？</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* type  1:添加，2设置倍数，3：移除
* project_id
* user_id
* wm_number: 水表设备号
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentDeviceNum'],
  data () {
    return {
      disabled: false
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    // 确定
    submitForm () {
      let params = {
        type: 3,
        project_id: this.projectId,
        user_id: this.userId,
        wm_number: this.parentDeviceNum
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setWaterMeter',
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
