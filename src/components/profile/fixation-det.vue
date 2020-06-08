<template>
  <el-dialog
    :title="modTitle"
    :visible.sync="parentDialog"
    :show-close="false"
    :close-on-click-modal="false"
    custom-class="medium-dialog"
    v-loading="detLoading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="list">
      <div class="item" v-for="item in listData" :key="item.date">
        <p class="item-title blue">{{ item.date }}</p>
        <el-table class="select-table item-table" :data="item.mes" v-if="item.mes.length > 0" style="width: 100%">
          <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
          <el-table-column prop="position_name" label="固定岗名称"></el-table-column>
          <el-table-column prop="times" label="打卡时段"></el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* 参数说明：
*   parentState：1.成功   2.未打卡    3.异常
* */
export default{
  props: ['parentDialog', 'parentId', 'parentState', 'parentNum'],
  data () {
    return {
      modTitle: '',
      listData: [],
      detLoading: false
    }
  },
  created () {

  },
  methods: {
    detInit () {
      this.listData = []
      if (this.parentState === 1) {
        this.modTitle = '打卡成功详情'
        this.getSucDetails()
      } else if (this.parentState === 2) {
        this.modTitle = '未打卡详情'
        this.getNotDetails()
      } else if (this.parentState === 3) {
        this.modTitle = '打卡异常详情'
        this.getAbnDetails()
      }
    },
    // 获取打卡成功详情
    getSucDetails () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsPermanentRecordSucessMes',
        data: params
      }).then((res) => {
        this.detLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1 || []
          let listData = []
          resData.forEach(item => {
            listData.push({
              date: item.adate || item.date,
              mes: item.mes
            })
          })
          this.listData = listData
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.detLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取未打卡详情
    getNotDetails () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsPermanentNotRecordMes',
        data: params
      }).then((res) => {
        this.detLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1 || []
          let listData = []
          resData.forEach(item => {
            listData.push({
              date: item.adate || item.date,
              mes: item.mes
            })
          })
          this.listData = listData
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.detLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取打卡异常详情
    getAbnDetails () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsPermanentRecordAbnormalMes',
        data: params
      }).then((res) => {
        this.detLoading = false
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1 || []
          let listData = []
          resData.forEach(item => {
            listData.push({
              date: item.adate || item.date,
              mes: item.mes
            })
          })
          this.listData = listData
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.detLoading = false
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
  .list{
    .item{
      margin-top: 10px;
      &:nth-of-type(1){
        margin-top: 0;
      }
      .item-title{
        height: 30px;
        display: flex;
        align-items: center;
      }
      .item-table{

      }
    }
  }
</style>
