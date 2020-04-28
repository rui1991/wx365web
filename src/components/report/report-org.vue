<template>
  <el-tree
    :data="orgTree"
    ref="tree"
    show-checkbox
    default-expand-all
    check-strictly
    check-on-click-node
    node-key="id"
    @check-change="orgCheckChange"
    :props="defaultProps">
  </el-tree>
</template>

<script>
import { mapState } from 'vuex'
export default{
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created () {

  },
  mounted () {

  },
  computed: {
    ...mapState('other', [
      'orgTree'
    ])
  },
  methods: {
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        const type = data.organize_type
        this.$refs.tree.setCheckedKeys([data.id])
        let obj = {}
        if (type === 3) {
          obj = {
            id: data.id,
            type: type,
            proId: data.base_id,
            secId: 0,
            parId: data.parent_id
          }
        } else if (type === 4) {
          obj = {
            id: data.id,
            type: type,
            proId: 0,
            secId: data.base_id,
            parId: data.parent_id
          }
        } else {
          obj = {
            id: data.id,
            type: type,
            proId: 0,
            secId: 0,
            parId: data.parent_id
          }
        }
        // 设置组织参数
        // 刷新列表
        this.$emit('parentUpOrg', obj)
      } else {
        if (this.orgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
