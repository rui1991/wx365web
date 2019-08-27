<template>
  <el-dialog title="选择地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      ref="tree"
      :highlight-current="treeHighlight"
      node-key="id"
      :props="defaultProps"
      @node-click="handleNodeClick">
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
  props: ['parentDialog'],
  data () {
    return {
      treeData: [],
      treeState: false,
      treeHighlight: true,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      name: '',
      id: ''
    }
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    siteInit () {
      // 清空选中
      this.name = ''
      this.id = ''
      // 取消高亮
      this.treeHighlight = false
      // 获取数据
      if (!this.treeState) {
        setTimeout(() => {
          this.getSiteData()
        }, 100)
      }
    },
    // 获取地址树
    getSiteData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionTree628',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.treeData = res.data.data1
          this.treeState = true
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
    // 点击地址树
    handleNodeClick (data) {
      // 保存
      this.name = data.name
      this.id = data.id
      // 设置高亮
      this.treeHighlight = true
    },
    // 确定
    confirmClick () {
      this.$emit('parentUpdata', this.name)
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
