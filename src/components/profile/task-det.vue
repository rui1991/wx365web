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
          <el-table-column prop="plan_name" :show-overflow-tooltip="true" label="任务名称"></el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="执行时间段">
            <template slot-scope="scope">
              <span>{{ scope.row.start_time | formatDate }} ~ {{ scope.row.end_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="执行人/执行组">
            <template slot-scope="scope">
              <span v-if="scope.row.group_id">{{ scope.row.group_name }}</span>
              <span v-else>{{ scope.row.user_name }}</span>
            </template>
          </el-table-column>
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
*   parentState：1已完成   2未完成   3异常
* */
export default{
  props: ['parentDialog', 'parentId', 'parentType', 'parentState', 'parentNum'],
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
      if (this.parentType === 3) {
        if (this.parentState === 1) {
          this.modTitle = '任务已完成详情'
          this.getProFulfill()
        } else if (this.parentState === 2) {
          this.modTitle = '任务未完成详情'
          this.getProUndone()
        } else if (this.parentState === 3) {
          this.modTitle = '任务异常详情'
          this.getProAbnormal()
        }
      } else if (this.parentType === 4) {
        if (this.parentState === 1) {
          this.modTitle = '任务已完成详情'
          this.getSecFulfill()
        } else if (this.parentState === 2) {
          this.modTitle = '任务未完成详情'
          this.getSecUndone()
        } else if (this.parentState === 3) {
          this.modTitle = '任务异常详情'
          this.getSecAbnormal()
        }
      }
    },
    // 获取项目已完成详情
    getProFulfill () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsInsContinueMes',
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
          this.listData = resData
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
    // 获取部门已完成详情
    getSecFulfill () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsInsContinueMes',
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
    // 获取项目未完成详情
    getProUndone () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsInsNotContinueMes',
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
    // 获取部门未完成详情
    getSecUndone () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsInsNotContinueMes',
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
    // 获取项目异常详情
    getProAbnormal () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsInsAbnormalMes',
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
    // 获取部门异常详情
    getSecAbnormal () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsInsAbnormalMes',
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
