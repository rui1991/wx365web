<template>
  <el-dialog title="提示" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该标准？</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      disabled: false
    }
  },
  computed: {
    ...mapState('other', {
      orgType: state => state.normOrgan.type,
      companyId: state => state.normOrgan.companyId,
      projectId: state => state.normOrgan.projectId,
      id: state => state.normData.id
    })
  },
  methods: {
    /*
    * 参数说明：
    * ascription_type：Number  组织类型； 0：平台，1：企业， 2：项目
    * company_id：Number  所属企业ID
    * project_id：Number  所属项目ID
    * sdt_id：Number  标准的ID
    * */

    submitForm () {
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_id: this.id
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/delStandardsTree',
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
