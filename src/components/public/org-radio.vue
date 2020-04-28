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
      },
      organizeId: 0
    }
  },
  computed: {
    ...mapState('other', [
      'orgTree'
    ])
  },
  methods: {
    // 点击组织树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.$refs.tree.setCheckedKeys([data.id])
        this.organizeId = data.id
        // 类型
        const type = data.organize_type
        let projectId = 0
        if (type === 3) {
          projectId = data.base_id
        }
        let sectionId = 0
        if (type === 4) {
          sectionId = data.base_id
        }
        const obj = {
          id: data.id,
          name: data.name,
          type: type,
          projectId: projectId,
          sectionId: sectionId
        }
        this.$emit('parentUpdata', obj)
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
