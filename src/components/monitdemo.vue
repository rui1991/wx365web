<template>
  <div class="monitdemo">
    <div class="item" v-for="item in listData" :key="item.location_id">
      <div class="item-head">
        <span>{{ item.location_name }}</span>
        <span>总台数：{{ item.all_size }}台</span>
        <span class="red">告警设备：{{ item.alarm_size }}台</span>
      </div>
      <div class="item-body">
        <el-row :gutter="30">
          <el-col :xs="8" :sm="8" :md="6" :lg="6" :xl="6" v-for="chunk in item.nodeMessages" :key="chunk.lm_id">
            <div class="chunk" v-if="chunk.lora_type === '温湿度'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-wenshidu"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single" :class="{'red': chunk.sensor_state !== '正常/正常'}">设备状态：{{ chunk.sensor_state }}</p>
                  <p class="content-single" :class="{'red': chunk.demolition_state !== '正常'}">防拆状态：{{ chunk.demolition_state }}</p>
                  <p class="content-single">当前温度：{{ chunk.temperature }}</p>
                  <p class="content-single">当前湿度：{{ chunk.humidity }}</p>
                  <p class="content-single" :class="{'red': chunk.battery_state !== '正常'}">电压状态：{{ chunk.battery_state }}</p>
                  <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                </div>
              </div>
            </div>
            <div class="chunk" v-else-if="chunk.lora_type === '无线水浸'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-shuijin"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single">设备状态：{{ chunk.sensor_state }}</p>
                  <p class="content-single" :class="{'red': chunk.battery_state !== '电压正常'}">电压状态：{{ chunk.battery_state }}</p>
                  <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                </div>
              </div>
            </div>
            <div class="chunk" v-else-if="chunk.lora_type === '无线烟感'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-yangan"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single" :class="{'red': chunk.sensor_state !== '正常'}">设备状态：{{ chunk.sensor_state }}</p>
                  <!--<p class="content-single">电压状态：{{ chunk.battery_state }}</p>-->
                  <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                </div>
              </div>
            </div>
            <div class="chunk" v-else-if="chunk.lora_type === '燃气报警'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-keranqiti"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single" :class="{'red': chunk.sensor_state !== '正常'}">设备状态：{{ chunk.sensor_state }}</p>
                  <p class="content-single" :class="{'red': chunk.demolition_state !== '正常'}">防拆状态：{{ chunk.demolition_state }}</p>
                  <p class="content-single" :class="{'red': chunk.battery_state !== '正常'}">电压状态：{{ chunk.battery_state }}</p>
                  <p class="content-single">当前浓度：{{ chunk.concentration }}</p>
                </div>
              </div>
            </div>
            <div class="chunk" v-else-if="chunk.lora_type === '一键报警'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-yijian"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single" :class="{'red': chunk.sensor_state !== '正常'}">设备状态：{{ chunk.sensor_state }}</p>
                  <p class="content-single" :class="{'red': chunk.demolition_state !== '正常'}">防拆状态：{{ chunk.demolition_state }}</p>
                  <p class="content-single" :class="{'red': chunk.battery_state !== '正常'}">电压状态：{{ chunk.battery_state }}</p>
                  <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                </div>
              </div>
            </div>
            <div class="chunk" v-else-if="chunk.lora_type === '红外报警'">
              <p class="chunk-title blue">{{ chunk.node_name }}</p>
              <div class="chunk-body">
                <div class="chunk-icon">
                  <i class="iconfont icon-hongwai"></i>
                  <span class="icon-text">{{ chunk.lora_type }}</span>
                </div>
                <div class="chunk-content">
                  <p class="content-single" :class="{ 'red' : chunk.sensor_state !== '正常' }">设备状态：{{ chunk.sensor_state }}</p>
                  <p class="content-single" :class="{ 'red' : chunk.demolition_state !== '正常' }">防拆状态：{{ chunk.demolition_state }}</p>
                  <p class="content-single" :class="{ 'red' : chunk.battery_state !== '正常' }">电池状态：{{ chunk.battery_state }}</p>
                  <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default{
  name: 'monitdemo',
  data () {
    return {
      listData: [],
      monitTimer: null,
      speed: 10000
    }
  },
  created () {

  },
  mounted () {
    this.getListData()
    // 启动定时器
    this.startTimer()
  },
  methods: {
    // 获取监控数据
    getListData () {
      let params = {
        project_id: 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selNodeSquare',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.listData = res.data.data1
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
    // 启动定时器
    startTimer () {
      this.monitTimer = setInterval(() => {
        // 获取列表数据
        this.getListData()
      }, this.speed)
    },
    beforeDestroy () {
      // 清除轨迹列表定时器
      clearInterval(this.monitTimer)
    }
  }
}
</script>

<style lang="less" scoped>
  .monitdemo{
    height: 100%;
    padding: 5px 10px;
    background: #f0f3f4;
    .item{
      padding: 10px;
      margin-bottom: 10px;
      /*border: 2px solid #cccccc;*/
      background: #ffffff;
      border-radius: 6px;
      .item-head{
        display: flex;
        height: 35px;
        padding: 0 60px;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        background: #B8D5F0;
        color: #272727;
      }
      .item-body{
        margin-top: 10px;
        .chunk{
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 4px;
          margin-bottom: 5px;
          border: 1px solid #4fa5f2;
          .chunk-title{
            display: flex;
            height: 30px;
            justify-content: center;
            align-items: center;
            font-size: 16px;
          }
          .chunk-body{
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 180px;
            .chunk-icon{
              display: flex;
              flex-grow: 1;
              flex-direction: column;
              justify-content: center;
              .iconfont{
                text-align: center;
                font-size: 48px;
                color: #409EFF;
              }
              .icon-text{
                text-align: center;
                margin-top: 10px;
                font-size: 12px;
                color: #409EFF;
              }
            }
            .chunk-content{
              display: flex;
              flex-grow: 2;
              flex-direction: column;
              .content-single {
                display: flex;
                height: 30px;
                align-items: center;
              }
            }
          }
        }
      }
    }
  }
</style>
