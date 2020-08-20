<template>
  <el-dialog title="选择关联车辆" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-transfer
      filterable
      ref="myTransfer"
      :filter-method="filterMethod"
      filter-placeholder="请输入车牌号"
      v-model="checkVehicle"
      :props="props"
      :titles="['车辆列表', '已选择']"
      :data="vehicleData">
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentProid', 'parentFence', 'parentIds'],
  data () {
    return {
      vehicleData: [],
      props: {
        label: 'car_number',
        key: 'id'
      },
      checkVehicle: [],
      filterMethod (query, item) {
        return item.car_number.indexOf(query) > -1
      }
    }
  },
  methods: {
    vehicleInit () {
      this.checkVehicle = this.parentIds
      this.getBangleData()
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
    },
    // 获取未被绑定的手环
    getBangleData () {
      let params = {
        project_id: this.parentProid
      }
      if (this.parentFence !== '0') {
        params.enclosure_id = this.parentFence
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsCarCanBind',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let vehicleData = res.data.data1
          this.vehicleData = vehicleData
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
    // 确定
    confirmClick () {
      const vehicleData = this.vehicleData
      const checkVehicle = this.checkVehicle
      let vehicleArr = []
      checkVehicle.forEach(itemValue => {
        let temp = vehicleData.find((item, index, array) => {
          return itemValue === item.id
        })
        if (temp) {
          vehicleArr.push(temp)
        }
      })
      let crewName = []
      let vehicleId = []
      vehicleArr.forEach(item => {
        crewName.push(item.car_number)
        vehicleId.push(item.id)
      })
      crewName = crewName.join('、')
      const obj = {
        names: crewName,
        ids: vehicleId
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
        this.vehicleInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
