<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item>设备维修汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="collect">
        <div class="collect-item" v-for="(item, index) in overviewData" :key="item.tital">
          <a href="javascript:void(0);" class="collect-value blue" @click="detClick(item.tital)" v-if="index < 4">{{ item.size }}</a>
          <span class="collect-value" v-else>{{ item.size }}</span>
          <span class="collect-name">{{ item.tital }}</span>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentType="detType"
      @parentClose="detCancel">
    </det-module>
  </div>
</template>

<script>
/**
 * 参数说明
 * detType   1 设备维修项目总数    2 设备维修总数    3 仅1次维修记录设备数量    4 2次及以上维修记录设备总数
 * */
// 引入详情组件
import detModule from '@/components/datamon/maintainall-det'
export default{
  name: 'dataswgmon',
  data () {
    return {
      overviewData: [],
      detDialog: false,
      detType: 0
    }
  },
  created () {

  },
  mounted () {
    // 获取数据
    this.getOverviewData()
  },
  components: {
    detModule
  },
  methods: {
    // 获取数据
    getOverviewData () {
      this.$axios({
        method: 'post',
        url: this.runApi() + '/errDeviceDataSummary'
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.overviewData = res.data.data1
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
    /* 详情 */
    detClick (name) {
      let detType = 0
      switch (name) {
        case '设备维修项目总数':
          detType = 1
          break
        case '设备维修总数':
          detType = 2
          break
        case '仅1次维修记录设备数量':
          detType = 3
          break
        case '2次及以上维修记录设备总数':
          detType = 4
          break
      }
      this.detType = detType
      this.detDialog = true
    },
    detCancel () {
      this.detDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .collect{
    display: flex;
    flex-wrap: wrap;
    padding-top: 20px;
    .collect-item{
      display: flex;
      width: 33.3%;
      height: 120px;
      flex-direction: column;
      align-items: center;
      .collect-value{
        text-align: center;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: 600;
      }
      .collect-name{
        text-align: center;
        font-size: 14px;
      }
    }
  }
</style>
