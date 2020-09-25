<template>
  <el-dialog :title="modTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-if="parentType === 1">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="project_name" :show-overflow-tooltip="true" label="项目"></el-table-column>
      <el-table-column prop="device_size" :show-overflow-tooltip="true" label="维修设备数"></el-table-column>
    </el-table>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-else-if="parentType === 2">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="device_type" :show-overflow-tooltip="true" label="设备类型"></el-table-column>
      <el-table-column label="设备ID">
        <template slot-scope="scope">
          <span>{{ scope.row.device_mac }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="project_name" :show-overflow-tooltip="true" label="所属项目"></el-table-column>
    </el-table>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-else-if="parentType === 3">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="device_type" :show-overflow-tooltip="true" label="设备类型"></el-table-column>
      <el-table-column label="设备ID">
        <template slot-scope="scope">
          <span>{{ scope.row.device_mac }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-else-if="parentType === 4">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="device_type" :show-overflow-tooltip="true" label="设备类型"></el-table-column>
      <el-table-column label="设备ID">
        <template slot-scope="scope">
          <span>{{ scope.row.device_mac }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="device_size" :show-overflow-tooltip="true" label="维修次数"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 参数说明：
 *  parentType   1 设备维修项目总数    2 设备维修总数    3 仅1次维修记录设备数量    4 2次及以上维修记录设备总数
* */
export default{
  props: ['parentDialog', 'parentType'],
  data () {
    return {
      modTitle: '详情',
      reqApiName: '',
      tableData: []
    }
  },
  methods: {
    detInit () {
      const type = this.parentType
      switch (type) {
        case 1:
          this.modTitle = '设备维修项目汇总详情'
          this.reqApiName = '/proErrDeviceRepairSummary'
          break
        case 2:
          this.modTitle = '设备维修总数详情'
          this.reqApiName = '/errDeviceRepairSummary'
          break
        case 3:
          this.modTitle = '仅1次维修记录设备总数详情'
          this.reqApiName = '/onlyOneRepairDevice'
          break
        case 4:
          this.modTitle = '2次及以上维修记录设备总数详情'
          this.reqApiName = '/multipleRepairDevice'
          break
      }
      // 获取详情
      this.tableData = []
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      this.$axios({
        method: 'post',
        url: this.runApi() + this.reqApiName
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1 || []
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
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
