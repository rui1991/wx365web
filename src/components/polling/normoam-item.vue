<template>
  <el-dialog title="选择标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" ref="multipleTable" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="path" :show-overflow-tooltip="true" label="路径"></el-table-column>
      <el-table-column prop="inspect_name" label="检查项名称"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentType', 'parentIds'],
  data () {
    return {
      treeState: false,
      tableData: [],
      multipleSelection: [],
      disabled: true
    }
  },
  computed: {
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    itemInit () {
      this.getListData()
    },
    // 获取标准模板
    getListData () {
      let params = {
        ascription_type: 2,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_id: this.parentId,
        sdt_type: this.parentType,
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsCheckMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          const tableData = res.data.data1.mes
          this.tableData = tableData
          // 设置已选中
          setTimeout(() => {
            let multipleSelection = []
            this.parentIds.forEach(item => {
              let id = Number.parseInt(item)
              let selectedItem = tableData.find(item => {
                return item.sdd_id === id
              })
              multipleSelection.push(selectedItem)
              this.$refs.multipleTable.toggleRowSelection(selectedItem)
            })
            this.multipleSelection = multipleSelection
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
    getTemData () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let tree = res.data.data1
          // 处理标准树
          let treeData = this.initDisTree(tree)
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
    // 获取列表选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    // 确定
    confirmClick () {
      let selectItems = this.multipleSelection
      let ids = []
      selectItems.forEach(item => {
        ids.push(item.sdd_id)
      })
      let obj = {
        ids: ids,
        itemData: selectItems
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
        this.itemInit()
      }
    },
    multipleSelection (val, oldVal) {
      if (val.length === 0) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
