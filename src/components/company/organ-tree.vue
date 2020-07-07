<template>
  <div class="organ-tree">
    <el-input
      placeholder="输入关键字进行过滤"
      clearable
      v-model="filterText">
    </el-input>
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      default-expand-all
      check-strictly
      check-on-click-node
      node-key="id"
      :filter-node-method="filterNode"
      @check-change="orgCheckChange"
      :props="defaultProps">
    </el-tree>
  </div>
</template>

<script>
/*
* 左侧组织树
* */
import { mapState } from 'vuex'
export default{
  props: ['parentTreeState'],
  data () {
    return {
      treeData: [],
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      organizeId: -1
    }
  },
  created () {

  },
  mounted () {
    this.getOrganTree()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 获取机构树
    getOrganTree (b = false) {
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
          let treeData = res.data.data1 || []
          this.treeData = treeData
          if (b) {
            this.$refs.tree.setCheckedKeys([this.orgId])
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
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.organizeId = data.id
        this.$refs.tree.setCheckedKeys([data.id])
        let obj = {
          type: data.organize_type,
          id: data.id,
          name: data.name,
          baseId: data.base_id
        }
        // 设置组织参数
        this.$emit('parentUpOrg', obj)
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    }
  },
  watch: {
    parentTreeState (val, oldVal) {
      this.getOrganTree(true)
    },
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="less" scoped>
  .organ-tree{
    height: 100%;
    padding: 5px;
    overflow: auto;
  }
</style>
