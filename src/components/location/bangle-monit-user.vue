<template>
  <el-dialog :title="modTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="parentData" style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="user" :show-overflow-tooltip="true" label="人员"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* type: 0 设置   1 清除
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentState', 'parentData'],
  data () {
    return {
      modTitle: '人员正常详情'
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    userInit () {
      if (this.parentState === '0') {
        this.modTitle = '人员正常详情'
      } else if (this.parentState === '1') {
        this.modTitle = '人员异常详情'
      }
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.userInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .date {
    margin-bottom: 10px;
  }
</style>
