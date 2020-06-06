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
          <el-table-column prop="user_name" label="姓名"></el-table-column>
          <el-table-column prop="user_phone" label="电话"></el-table-column>
          <el-table-column prop="ogz_name" label="所属部门"></el-table-column>
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
*   parentState：1在线   0离线
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
          this.modTitle = '在线人数详情'
          this.getProOnline()
        } else if (this.parentState === 0) {
          this.modTitle = '离线人数详情'
          this.getProOffline()
        }
      } else if (this.parentType === 4) {
        if (this.parentState === 1) {
          this.modTitle = '在线人数详情'
          this.getSecOnline()
        } else if (this.parentState === 0) {
          this.modTitle = '离线人数详情'
          this.getSecOffline()
        }
      }
    },
    // 获取项目在线详情
    getProOnline () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsOnlineUsers',
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
    // 获取部门在线详情
    getSecOnline () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsOnlineUsers',
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
    // 获取项目离线详情
    getProOffline () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsOfflineUsers',
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
    // 获取部门离线详情
    getSecOffline () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsOfflineUsers',
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
