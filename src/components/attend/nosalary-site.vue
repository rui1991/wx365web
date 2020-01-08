<template>
  <el-dialog title="选择地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      ref="myTree"
      node-key="id"
      show-checkbox
      check-strictly
      :props="defaultProps">
    </el-tree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
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
    siteInit () {
      if (this.treeData.length === 0) {
        this.getSiteTree()
      } else {
        // 标记选中
        this.$refs.myTree.setCheckedKeys(this.parentIds)
      }
    },
    // 获取地址树
    getSiteTree () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionTree628',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const siteData = res.data.data1
          // 处理地址树
          const treeData = this.initDisSiteTree(siteData)
          this.treeData = treeData
          // 标记选中
          this.$refs.myTree.setCheckedKeys(this.parentIds)
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
    // 初始化处理地址树
    initDisSiteTree (siteData) {
      siteData.forEach(item => {
        if (item.mac) {
          if (item.mac.length === 12) {
            item.disabled = false
          } else {
            item.disabled = true
          }
        } else {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSiteTree(item.children)
        }
      })
      return siteData
    },
    initRecSiteTree (data) {
      data.forEach(item => {
        if (item.mac) {
          if (item.mac.length === 12) {
            item.disabled = false
          } else {
            item.disabled = true
          }
        } else {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSiteTree(item.children)
        }
      })
    },
    // 确定
    confirmClick () {
      const nodes = this.$refs.myTree.getCheckedNodes()
      if (nodes.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择地址',
          type: 'warning'
        })
        return
      }
      let names = []
      let ids = []
      nodes.forEach(item => {
        names.push(item.name)
        ids.push(item.id)
      })
      const obj = {
        names: names,
        ids: ids
      }
      this.$emit('parentUpdata', obj)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.siteInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
