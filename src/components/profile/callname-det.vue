<template>
  <el-dialog :title="modTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="list">
      <div class="item" v-for="item in listData" :key="item.date">
        <p class="item-title blue">{{ item.date }}</p>
        <el-table class="select-table item-table" :data="item.mes" v-if="item.mes.length > 0" style="width: 100%">
          <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" label="姓名"></el-table-column>
          <el-table-column prop="sf" label="打卡次数"></el-table-column>
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
*   parentType：3项目   4部门
*   parentState：1成功   2失败
* */
export default{
  props: ['parentDialog', 'parentId', 'parentType', 'parentState', 'parentNum'],
  data () {
    return {
      modTitle: '',
      listData: []
    }
  },
  created () {

  },
  methods: {
    detInit () {
      this.listData = []
      if (this.parentType === 3) {
        if (this.parentState === 1) {
          this.modTitle = '点名成功详情'
          this.getProSucceed()
        } else if (this.parentState === 2) {
          this.modTitle = '点名失败详情'
          this.getProReject()
        }
      } else if (this.parentType === 4) {
        if (this.parentState === 1) {
          this.modTitle = '点名成功详情'
          this.getSecSucceed()
        } else if (this.parentState === 2) {
          this.modTitle = '点名失败详情'
          this.getSecReject()
        }
      }
    },
    // 获取项目成功详情
    getProSucceed () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsRollcallSucessUsersMes',
        data: params
      }).then((res) => {
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取部门成功详情
    getSecSucceed () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsRollcallSucessUsersMes',
        data: params
      }).then((res) => {
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取项目失败详情
    getProReject () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsRollcallFailedUsersMes',
        data: params
      }).then((res) => {
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 获取部门失败详情
    getSecReject () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsRollcallFailedUsersMes',
        data: params
      }).then((res) => {
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
