<template>
  <el-dialog title="选择授权范围" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <p class="hint">提示：授权范围不可选直属企业或分公司总部部门，否则登录将无项目权限无权登录进入系统！</p>
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      default-expand-all
      check-strictly
      check-on-click-node
      node-key="id"
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
  props: ['parentDialog', 'parentOrgId', 'parentId'],
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      checkNode: []
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
      // 获取组织树
      this.getOrganTree()
    },
    // 获取组织树
    getOrganTree () {
      let params = {
        organize_id: this.parentOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let orgTree = res.data.data1
          if (this.parentOrgId === 1) {
            let sectorData = orgTree[0].children.filter(item => {
              return item.organize_type !== 4
            })
            sectorData.forEach(item => {
              item.children = null
            })
            orgTree[0].children = sectorData
            this.treeData = orgTree
          } else {
            this.treeData = orgTree
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
    // 选择组织树
    orgCheckChange (data, checked, self) {
      if (data.children) {
        // 下级不可选
        let inNode = JSON.parse(JSON.stringify(data.children))
        let node = this.subDisTree(inNode, checked)
        data.children = node
        this.$refs.tree.updateKeyChildren(data.id, data)
        if (checked) {
          // 清除下级选中状态
          this.clearCheTree(data.children)
        }
      }
    },
    // 下级不可选
    subDisTree (data, b) {
      data.forEach((item, index, array) => {
        item.disabled = b
        if (item.children) {
          this.subDisTree(item.children, b)
        }
      })
      return data
    },
    // 取消下级选中
    clearCheTree (data) {
      data.forEach((item, index, array) => {
        this.$refs.tree.setChecked(item.id, false)
        if (item.children) {
          this.clearCheTree(item.children)
        }
      })
      return data
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
.hint{
  color: red;
  margin-bottom: 5px;
}
</style>
