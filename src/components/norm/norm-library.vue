<template>
  <el-dialog :title="dialogTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      default-expand-all
      check-strictly
      node-key="id"
      :props="defaultProps">
    </el-tree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentType'],
  data () {
    return {
      dialogTitle: '导入标准库',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      disabled: false
    }
  },
  computed: {
    ...mapState('other', {
      orgType: state => state.normOrgan.type,
      companyId: state => state.normOrgan.companyId,
      projectId: state => state.normOrgan.projectId,
      parId: state => state.normTree.id,
      parPath: state => state.normTree.path
    })
  },
  methods: {
    // 获取平台标准树
    getPlaNormTree () {
      let params = {
        ascription_type: 0,
        company_id: 0,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPlatformStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let data = res.data.data1
          // 处理数据
          let treeData = this.initNormData(data)
          this.treeData = treeData
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
    // 获取企业标准库
    getComNormTree () {
      let params = {
        ascription_type: 1,
        company_id: this.companyId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPropertyStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let data = res.data.data1
          // 处理数据
          let treeData = this.initNormData(data)
          this.treeData = treeData
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
    // 处理标准树
    initNormData (data) {
      data.forEach((item, index, array) => {
        item.disabled = true
        if (item.children) {
          this.initInNormData(item.children)
        }
      })
      return data
    },
    initInNormData (data) {
      data.forEach((item, index, array) => {
        item.disabled = true
      })
    },
    // 确定
    submitForm () {
      let ids = this.$refs.tree.getCheckedKeys()
      if (ids.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择要引入的标准！',
          type: 'warning'
        })
        return
      }
      ids = ids.join(',')
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_type: this.parId,
        path: this.parPath,
        ids: ids
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/getStandardsTree',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 刷新列表
          this.$emit('parentUpdata')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        const type = this.parentType
        if (type === 0) {
          this.dialogTitle = '导入平台标准库'
          this.getPlaNormTree()
        } else if (type === 1) {
          this.dialogTitle = '导入企业标准库'
          this.getComNormTree()
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
