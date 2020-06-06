<template>
  <el-dialog
    title="网关离线详情"
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
          <el-table-column prop="gw_name" :show-overflow-tooltip="true" label="网关名称"></el-table-column>
          <el-table-column prop="gw_mac" :show-overflow-tooltip="true" label="网关mac"></el-table-column>
          <el-table-column prop="happen_time" :show-overflow-tooltip="true" label="离线时间"></el-table-column>
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
* */
export default{
  props: ['parentDialog', 'parentId', 'parentType', 'parentNum'],
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
        this.getProDetails()
      }
    },
    // 获取项目网关离线详情
    getProDetails () {
      let params = {
        project_id: this.parentId,
        type: this.parentNum
      }
      params = this.$qs.stringify(params)
      this.detLoading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/proOperateDetailsOffLineGws',
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
