<template>
  <el-dialog title="选择关联人员" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-transfer
      filterable
      ref="myTransfer"
      :filter-method="filterMethod"
      filter-placeholder="请输入人员姓名"
      v-model="checkBangle"
      :props="props"
      :titles="['人员列表', '已选择']"
      :data="bangleData">
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* parentFence: 围栏的id
* parentIds: 绑定人员id [1, 2]
* */
export default{
  props: ['parentDialog', 'parentProid', 'parentFence', 'parentIds'],
  data () {
    return {
      bangleData: [],
      props: {
        label: 'user_name',
        key: 'bracelet_id'
      },
      checkBangle: [],
      filterMethod (query, item) {
        return item.user_name.indexOf(query) > -1
      }
    }
  },
  methods: {
    bangleInit () {
      this.checkBangle = this.parentIds
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
        url: this.gpsApi() + '/selGpsEnclosureCanBindDevice',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let bangleData = res.data.data1
          this.bangleData = bangleData
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
      const bangleData = this.bangleData
      const checkBangle = this.checkBangle
      let bangleArr = []
      checkBangle.forEach(itemValue => {
        let temp = bangleData.find((item, index, array) => {
          return itemValue === item.bracelet_id
        })
        if (temp) {
          bangleArr.push(temp)
        }
      })
      let crewName = []
      let bangleId = []
      bangleArr.forEach(item => {
        crewName.push(item.user_name)
        bangleId.push(item.bracelet_id)
      })
      crewName = crewName.join('、')
      const obj = {
        names: crewName,
        ids: bangleId
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
        this.bangleInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
