<template>
  <div class="config">
    <el-tree
      :data="treeData"
      show-checkbox
      node-key="id"
      ref="tree"
      :props="defaultProps">
    </el-tree>
    <div class="config-operate">
      <el-button type="primary" :disabled="disabled" @click="submitClick">确 定</el-button>
    </div>
  </div>
</template>

<script>
/*
* 企业、分公司模块配置
* */
import { mapState } from 'vuex'
export default{
  props: ['parentOrgId', 'parentBaseId'],
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      disabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取权限树
    this.getTreeData()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 获取权限树
    getTreeData () {
      let params = {
        company_id: this.parentBaseId,
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
          const treeData = res.data.data1
          this.treeData = treeData
          // 获取企业权限
          this.getAuthority()
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
    getAuthority () {
      let params = {
        base_id: this.parentBaseId
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
          this.$refs.tree.setCheckedKeys(autIds)
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
    submitClick () {
      let autIds = this.$refs.tree.getCheckedKeys()
      autIds = autIds.join(',')
      let params = {
        base_id: this.parentBaseId,
        user_id: this.userId,
        funs: autIds
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/setComFun',
        data: params
      }).then((res) => {
        this.disabled = false
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
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    parentOrgId (val, old) {
      // 获取企业权限
      this.getAuthority()
    }
  }
}
</script>

<style lang="less" scoped>
  .config{
    .config-operate{
      padding-top: 30px;
      text-align: center;
    }
  }
</style>
