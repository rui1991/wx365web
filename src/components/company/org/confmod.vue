<template>
  <div class="confmod">
    <el-tree
      :data="autTree"
      show-checkbox
      node-key="id"
      ref="autTree"
      :props="defaultProps">
    </el-tree>
    <div class="operate">
      <el-button type="primary" :disabled="modDisabled" @click="submitModule">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'confmod',
  data () {
    return {
      autTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      modDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取权限树
    this.getAutTree()
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId,
        orgId: state => state.org.orgId,
        orgName: state => state.org.orgName,
        baseId: state => state.org.baseId
      }
    )
  },
  methods: {
    // 获取权限树
    getAutTree () {
      let params = {
        company_id: this.baseId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPermissionTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const data = res.data.data1
          this.autTree = data
          // 获取企业权限
          this.getClientAut()
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
    // 获取企业权限
    getClientAut () {
      let params = {
        base_id: this.baseId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selComByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const autData = res.data.data1.com_fun
          let autIds = []
          autData.forEach(item => {
            autIds.push(item.function_id)
          })
          this.$refs.autTree.setCheckedKeys(autIds)
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
    // 确定
    submitModule () {
      let autIds = this.$refs.autTree.getCheckedKeys()
      autIds = autIds.join(',')
      let params = {
        base_id: this.baseId,
        user_id: this.userId,
        funs: autIds
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/setComFun',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '企业模块配置成功！',
            type: 'success'
          })
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
    }
  }
}
</script>

<style lang="less" scoped>
.confmod{
  .operate{
    padding-top: 20px;
    text-align: center;
  }
}
</style>
