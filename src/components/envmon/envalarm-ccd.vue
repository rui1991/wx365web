<template>
  <el-dialog title="选择设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-transfer
      filterable
      ref="myTransfer"
      filter-placeholder="请输入设备名称"
      :filter-method="filterMethod"
      v-model="checkCcd"
      :props="props"
      :titles="['设备列表', '已选择']"
      :data="ccdData">
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      ccdData: [],
      props: {
        label: 'node_name',
        key: 'dev_eui'
      },
      checkCcd: [],
      filterMethod (query, item) {
        return item.node_name.indexOf(query) > -1
      },
      disabled: true
    }
  },
  computed: {
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    ccdInit () {
      this.checkCcd = this.parentIds
      // 获取未设置设备列表
      this.getCcdData()
      // 清空搜索
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
    },
    // 获取设备列表
    getCcdData () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selNotSetAlarm',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let ccdData = res.data.data1
          this.ccdData = ccdData
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
      const ccdData = this.ccdData
      const checkCcd = this.checkCcd
      let ccdArr = []
      checkCcd.forEach(itemValue => {
        let temp = ccdData.find((item, index, array) => {
          return itemValue === item.dev_eui
        })
        if (temp) {
          ccdArr.push(temp)
        }
      })
      let ccdName = []
      let ccdId = []
      ccdArr.forEach(item => {
        ccdName.push(item.node_name)
        ccdId.push(item.dev_eui)
      })
      ccdName = ccdName.join('、')
      const obj = {
        names: ccdName,
        ids: ccdId
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
        this.ccdInit()
      }
    },
    checkCcd (val, oldVal) {
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
