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
          <el-table-column prop="position_name" label="地址名称" :show-overflow-tooltip="true" v-if="parentLowType === 1"></el-table-column>
          <el-table-column prop="card_name" label="名称" :show-overflow-tooltip="true" v-else-if="parentLowType === 2"></el-table-column>
          <el-table-column prop="position_mac" label="地址标签" :show-overflow-tooltip="true" v-if="parentLowType === 1"></el-table-column>
          <el-table-column prop="card_mac" label="采集卡mac" :show-overflow-tooltip="true" v-else-if="parentLowType === 2"></el-table-column>
          <el-table-column width="60" label="电量" v-if="parentLowType === 1">
            <template slot-scope="scope">
              <span v-if="scope.row.node_btpw">{{ scope.row.node_btpw }}%</span>
              <span v-else>10%</span>
            </template>
          </el-table-column>
          <el-table-column width="60" label="电量" v-if="parentLowType === 2">
            <template slot-scope="scope">
              <span v-if="scope.row.card_pw">{{ scope.row.card_pw }}%</span>
              <span v-else>10%</span>
            </template>
          </el-table-column>
          <el-table-column prop="happen_time" :show-overflow-tooltip="true" label="低电量开始时间"></el-table-column>
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
*   parentLowType：1基站   2采集卡
* */
export default{
  props: ['parentDialog', 'parentId', 'parentType', 'parentLowType', 'parentNum'],
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
        if (this.parentLowType === 1) {
          this.modTitle = '基站低电量详情'
          this.getProBsLow()
        } else if (this.parentLowType === 2) {
          this.modTitle = '采集卡低电量详情'
          this.getProCardLow()
        }
      } else if (this.parentType === 4) {
        if (this.parentLowType === 1) {
          this.modTitle = '基站低电量详情'
        } else if (this.parentLowType === 2) {
          this.modTitle = '采集卡低电量详情'
          this.getSecCardLow()
        }
      }
    },
    // 获取项目基站低电量详情
    getProBsLow () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsLowPowerPositions',
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
    // 获取项目采集卡低电量详情
    getProCardLow () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsLowPowerCards',
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
    // 获取部门采集卡低电量详情
    getSecCardLow () {
      let params = {
        ogz_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/ogzOperateDetailsLowPowerCards',
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
