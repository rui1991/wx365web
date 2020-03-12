<template>
  <el-dialog title="选择授权范围" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      show-checkbox
      default-expand-all
      :check-strictly="true"
      node-key="id"
      ref="tree"
      @check-change="orgCheckChange"
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
  props: ['parentDialog', 'parentId'],
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
    ])
  },
  methods: {
    // 初始化数据
    accreditInit () {
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
        return
      }
      setTimeout(() => {
        let treeData = JSON.parse(JSON.stringify(this.treeData))
        let newNode = this.disDisTree(treeData, false)
        this.treeData = newNode
      }, 100)
    },
    // 获取组织树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          const orgTree = res.data.data1
          this.treeData = orgTree
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
    orgCheckChange (data, checked, self) {
      if (data.disabled) {
        return
      }
      if (data.children) {
        let inNode = JSON.parse(JSON.stringify(data.children))
        let node = this.disDisTree(inNode, checked)
        data.children = node
        this.$refs.tree.updateKeyChildren(data.id, data)
        if (checked) {
          this.disCheTree(data.children)
        }
      }
    },
    // 下级不可选
    disDisTree (treeData, b) {
      treeData.forEach((item, index, array) => {
        item.disabled = b
        if (item.children) {
          this.recDisTree(item.children, b)
        }
      })
      return treeData
    },
    recDisTree (data, b) {
      data.forEach((item, index, array) => {
        item.disabled = b
        if (item.children) {
          this.recDisTree(item.children, b)
        }
      })
    },
    // 取消下级选中
    disCheTree (treeData) {
      treeData.forEach((item, index, array) => {
        this.$refs.tree.setChecked(item.id, false)
        if (item.children) {
          this.recCheTree(item.children)
        }
      })
    },
    recCheTree (data) {
      data.forEach((item, index, array) => {
        this.$refs.tree.setChecked(item.id, false)
        if (item.children) {
          this.recCheTree(item.children)
        }
      })
    },
    // 确定
    confirmClick () {
      // 获取选中节点
      const nodesData = this.$refs.tree.getCheckedNodes()
      // 获取选中id
      const keysData = this.$refs.tree.getCheckedKeys()
      if (keysData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择授权范围！',
          type: 'warning'
        })
        return
      }
      let ids = []
      let names = []
      nodesData.forEach(item => {
        ids.push(item.id)
        names.push(item.name)
      })
      names = names.join('、')
      const obj = {
        ids,
        names
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
        this.accreditInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
