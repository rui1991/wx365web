<template>
  <el-dialog title="选择获取设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" @selection-change="handleSelectionChange" style="width: 100%" max-height="420">
      <el-table-column type="selection" width="55" label="序号"></el-table-column>
      <el-table-column prop="user_name" :show-overflow-tooltip="true" label="用户名称"></el-table-column>
      <el-table-column prop="wm_number" :show-overflow-tooltip="true" label="水表设备号"></el-table-column>
      <el-table-column prop="install_address" :show-overflow-tooltip="true" label="安装位置"></el-table-column>
      <el-table-column width="160" label="初始化日期">
        <template slot-scope="scope">
          <el-date-picker
            style="width: 140px"
            v-model="scope.row.create_date"
            :clearable="false"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* type  1:添加，2设置倍数，3：移除
* 添加：project_id     mes    ==>  user_name/wm_number/install_address/user_code;user_name/wm_number/install_address/user_code/create_date
* */
import { mapState } from 'vuex'

export default{
  props: ['parentDialog'],
  data () {
    return {
      tableData: [],
      multipleSelection: [],
      disabled: true,
      nowData: this.$common.getNowDate('yyyy-mm-dd')
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
    addInit () {
      // 清除选中数据
      this.multipleSelection = []
      // 获取未被关联设备
      this.getNotReleData()
    },
    // 获取未被关联的设备
    getNotReleData () {
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selAllWaterMeter'
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let resData = res.data.data1
          resData.forEach(item => {
            item.create_date = this.nowData
          })
          this.tableData = resData
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
      const cheakData = this.multipleSelection
      let mesArr = []
      cheakData.forEach(item => {
        let itemStr = item.user_name + '/' + item.wm_number + '/' + item.install_address + '/' + item.user_code + '/' + item.create_date
        mesArr.push(itemStr)
      })
      let mesStr = mesArr.join(',')
      let params = {
        project_id: this.projectId,
        user_id: this.userId,
        type: 1,
        mes: mesStr
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setWaterMeter',
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
        this.addInit()
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
