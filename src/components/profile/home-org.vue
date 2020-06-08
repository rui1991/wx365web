<template>
  <el-dialog title="选择组织机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="orgData"
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
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      orgData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      organizeId: 0,
      disabled: true
    }
  },
  created () {

  },
  computed: {
    ...mapState('other', [
      'orgTree'
    ])
  },
  mounted () {
    if (this.orgTree[0].organize_type === 0) {
      this.orgData = this.orgTree[0].children
    } else {
      this.orgData = this.orgTree
    }
  },
  methods: {
    // 初始化数据
    orgInit () {
      this.organizeId = this.parentId
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys([this.organizeId])
      }, 100)
    },
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.$refs.tree.setCheckedKeys([data.id])
        this.organizeId = data.id
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    // 确定
    confirmClick () {
      const checkNodes = this.$refs.tree.getCheckedNodes()
      if (checkNodes.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择组织机构！',
          type: 'warning'
        })
      } else {
        const orgNode = checkNodes[0]
        const id = orgNode.id
        const name = orgNode.name
        const type = orgNode.organize_type
        const baseId = orgNode.base_id
        const obj = {
          id: id,
          name: name,
          type: type,
          baseId: baseId
        }
        this.$emit('parentUpdata', obj)
      }
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.orgInit()
      }
    },
    organizeId (val, oldVal) {
      if (val) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
