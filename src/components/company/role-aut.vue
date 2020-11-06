<template>
  <el-dialog title="选择权限" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-input
      placeholder="输入关键字进行过滤"
      clearable
      v-model="filterText">
    </el-input>
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      check-on-click-node
      node-key="id"
      :filter-node-method="filterNode"
      :props="defaultProps">
    </el-tree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* 黑卡选择部门
* */
export default{
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      treeData: [],
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      checkedOrgId: '',
      checkedId: '',
      checkedName: ''
    }
  },
  created () {

  },
  mounted () {

  },
  methods: {
    // 初始化数据
    autInit () {
      if (this.treeData.length === 0) {
        // 获取模块树
        this.getModuleTree()
      } else {
        setTimeout(() => {
          this.$refs.tree.setCheckedKeys(this.parentIds)
        }, 100)
      }
    },
    // 获取模块树
    getModuleTree () {
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selFunTree'
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let treeData = res.data.data1 || []
          this.treeData = treeData
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys(this.parentIds)
          }, 100)
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
    // 触发页面显示配置的筛选
    filterNode (value, data, node) {
      // 如果什么都没填就直接返回
      if (!value) return true
      // 如果传入的value和data中的label相同说明是匹配到了
      if (data.name.indexOf(value) !== -1) return true
      // 否则要去判断它是不是选中节点的子节点
      return this.checkBelongNode(value, data, node)
    },
    // 判断传入的节点是不是选中节点的子节点
    checkBelongNode (value, data, node) {
      const level = node.level
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) return false
      // 先取当前节点的父节点
      let parentData = node.parent
      // 遍历当前节点的父节点
      let index = 0
      while (index < level - 1) {
        // 如果匹配到直接返回
        if (parentData.data.name.indexOf(value) !== -1) {
          return true
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent
        index++
      }
      // 没匹配到返回false
      return false
    },
    // 确定
    confirmClick () {
      const nodeData = this.$refs.tree.getCheckedNodes()
      let names = []
      let ids = []
      nodeData.forEach(item => {
        names.push(item.name)
        ids.push(item.id)
      })
      names = names.join('、')
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
        this.autInit()
      }
    },
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
