<template>
  <el-dialog title="围栏详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="parentForm" :label-width="formLabelWidth">
      <el-form-item label="围栏名称" prop="name">
        <el-input v-model.trim="parentForm.name" disabled auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="人员" prop="crewName">
        <el-input type="textarea" disabled v-model="parentForm.crewName"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px'
    }
  },
  methods: {
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>

</style>
