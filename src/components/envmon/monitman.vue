<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>环境监控管理</el-breadcrumb-item>
        <el-breadcrumb-item>环境监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item date">
          <el-input style="width: 280px; margin-right: 30px;" placeholder="请输入位置" clearable v-model.trim="posNowName"></el-input>
          <el-button type="primary" @click="searchList">搜索</el-button>
        </div>
        <div class="operate">
          <el-button type="primary" @click="clickSkip">全屏</el-button>
        </div>
      </div>
      <div class="content">
        <div class="item" v-for="item in listData" :key="item.location_id">
          <div class="item-head">
            <span>{{ item.location_name }}</span>
            <span>总台数：{{ item.all_size }}台</span>
            <span class="red">告警设备：{{ item.alarm_size }}台</span>
          </div>
          <div class="item-body">
            <el-row :gutter="10">
              <div v-for="chunk in item.nodeMessages" :key="chunk.lm_id">
                <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-if="chunk.lora_type !== '安全用电'">
                  <div class="chunk" v-if="chunk.lora_type === '温湿度'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconwenshidu"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single" :class="{'red': chunk.sensor_state !== '正常/正常'}">设备状态：{{ chunk.sensor_state }}</p>
                        <p class="content-single" :class="{'red': chunk.demolition_state !== '正常'}">防拆状态：{{ chunk.demolition_state }}</p>
                        <p class="content-single"
                           :class="{'red': Number.parseFloat(chunk.temperature) < Number.parseFloat(chunk.min_temperature) || Number.parseFloat(chunk.temperature) > Number.parseFloat(chunk.max_temperature)}">
                          当前温度：{{ chunk.temperature }}
                        </p>
                        <p class="content-single"
                           :class="{'red': Number.parseFloat(chunk.humidity) < Number.parseFloat(chunk.min_humidity) || Number.parseFloat(chunk.humidity) > Number.parseFloat(chunk.max_humidity)}">
                          当前湿度：{{ chunk.humidity }}
                        </p>
                        <p class="content-single" :class="{'red': chunk.battery_state !== '正常'}">电压状态：{{ chunk.battery_state }}</p>
                        <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="chunk" v-else-if="chunk.lora_type === '无线水浸'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconshuijin"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single" :class="{'red': chunk.dry_wet === 'dry'}" v-if="chunk.sensor_state === '未被水浸'">设备状态：未被水浸</p>
                        <p class="content-single" :class="{'red': chunk.dry_wet === 'dry'}" v-else-if="chunk.sensor_state === '未被水浸;'">设备状态：未被水浸</p>
                        <p class="content-single" :class="{'red': chunk.dry_wet === 'wet'}" v-else-if="chunk.sensor_state === '被水浸'">设备状态：被水浸</p>
                        <p class="content-single" :class="{'red': chunk.dry_wet === 'wet'}" v-else-if="chunk.sensor_state === '被水浸;'">设备状态：被水浸</p>
                        <p class="content-single" v-else>设备状态：{{ chunk.sensor_state }}</p>
                        <p class="content-single" :class="{'red': chunk.battery_state !== '电压正常'}">电压状态：{{ chunk.battery_state }}</p>
                        <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="chunk" v-else-if="chunk.lora_type === '无线压力变送器'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconyalichuanganqi"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single"
                           :class="{'red': Number.parseFloat(chunk.pressure) < Number.parseFloat(chunk.min_pressure) || Number.parseFloat(chunk.pressure) > Number.parseFloat(chunk.max_pressure)}">
                          当前压力：{{ chunk.pressure }}
                        </p>
                        <p class="content-single" :class="{'red': chunk.battery_state !== '电压正常'}">电压状态：{{ chunk.battery_state }}</p>
                        <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="chunk" v-else-if="chunk.lora_type === '无线液位变送器'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconyeweiji"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single"
                           :class="{'red': Number.parseFloat(chunk.liquid) < Number.parseFloat(chunk.min_liquid) || Number.parseFloat(chunk.liquid) > Number.parseFloat(chunk.max_liquid)}">
                          当前液位：{{ chunk.liquid }}
                        </p>
                        <p class="content-single" :class="{'red': chunk.battery_state !== '电压正常'}">电压状态：{{ chunk.battery_state }}</p>
                        <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="chunk" v-else-if="chunk.lora_type === '无线烟感'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconyangan"></i>
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
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconkeranqiti"></i>
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
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconyijian"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single" :class="{'red': chunk.sensor_state !== '正常' && chunk.sensor_state !== '无危险报警'}">设备状态：{{ chunk.sensor_state }}</p>
                        <p class="content-single" :class="{'red': chunk.demolition_state !== '正常'}">防拆状态：{{ chunk.demolition_state }}</p>
                        <p class="content-single" :class="{'red': chunk.battery_state !== '正常'}">电压状态：{{ chunk.battery_state }}</p>
                        <p class="content-single">当前电压：{{ chunk.voltage_value }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="chunk" v-else-if="chunk.lora_type === '红外报警'">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconhongwai"></i>
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
                <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12" v-else>
                  <div class="chunk elect">
                    <p class="chunk-title blue">{{ chunk.node_name }}</p>
                    <div class="chunk-body">
                      <div class="chunk-icon" :class="{'offline': chunk.online === '离线'}">
                        <i class="iconfont iconanquanyongdian"></i>
                        <span class="icon-text">{{ chunk.lora_type }}</span>
                      </div>
                      <div class="chunk-content">
                        <p class="content-single" :class="{'red': chunk.sensor_state !== '正常'}">设备状态：{{ chunk.sensor_state }}</p>
                        <p class="content-single" :class="{'red': chunk.trip_state !== '不脱扣'}">脱扣状态：{{ chunk.trip_state }}</p>
                        <p class="content-single" :class="{'red': Number.parseFloat(chunk.leave_electricity) > 0}">剩余电流：{{ chunk.leave_electricity }}</p>
                      </div>
                      <div class="chunk-item">
                        <div class="chunk-item-in">
                          <div class="chunk-item-title">电压值</div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.a_voltage) < Number.parseFloat(chunk.min_voltage) || Number.parseFloat(chunk.a_voltage) > Number.parseFloat(chunk.max_voltage)}">
                            电压A：{{ chunk.a_voltage }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.b_voltage) < Number.parseFloat(chunk.min_voltage) || Number.parseFloat(chunk.b_voltage) > Number.parseFloat(chunk.max_voltage)}">
                            电压B：{{ chunk.b_voltage }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.c_voltage) < Number.parseFloat(chunk.min_voltage) || Number.parseFloat(chunk.c_voltage) > Number.parseFloat(chunk.max_voltage)}">
                            电压C：{{ chunk.c_voltage }}
                          </div>
                        </div>
                      </div>
                      <div class="chunk-item">
                        <div class="chunk-item-in">
                          <div class="chunk-item-title">电流值</div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.a_current) < Number.parseFloat(chunk.min_current) || Number.parseFloat(chunk.a_current) > Number.parseFloat(chunk.max_current)}">
                            电流A：{{ chunk.a_current }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.b_current) < Number.parseFloat(chunk.min_current) || Number.parseFloat(chunk.b_current) > Number.parseFloat(chunk.max_current)}">
                            电流B：{{ chunk.b_current }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.c_current) < Number.parseFloat(chunk.min_current) || Number.parseFloat(chunk.c_current) > Number.parseFloat(chunk.max_current)}">
                            电流C：{{ chunk.c_current }}
                          </div>
                        </div>
                      </div>
                      <div class="chunk-item">
                        <div class="chunk-item-in">
                          <div class="chunk-item-title">功率值</div>
                          <div class="chunk-strip">功率A：{{ chunk.a_power }}</div>
                          <div class="chunk-strip">功率B：{{ chunk.b_power }}</div>
                          <div class="chunk-strip">功率C：{{ chunk.c_power }}</div>
                        </div>
                      </div>
                      <div class="chunk-item">
                        <div class="chunk-item-in">
                          <div class="chunk-item-title">温度值</div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.temp01) < Number.parseFloat(chunk.min_temp) || Number.parseFloat(chunk.temp01) > Number.parseFloat(chunk.max_temp)}">
                            温度01：{{ chunk.temp01 }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.temp02) < Number.parseFloat(chunk.min_temp) || Number.parseFloat(chunk.temp02) > Number.parseFloat(chunk.max_temp)}">
                            温度02：{{ chunk.temp02 }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.temp03) < Number.parseFloat(chunk.min_temp) || Number.parseFloat(chunk.temp03) > Number.parseFloat(chunk.max_temp)}">
                            温度03：{{ chunk.temp03 }}
                          </div>
                          <div class="chunk-strip"
                               :class="{'red': Number.parseFloat(chunk.temp04) < Number.parseFloat(chunk.min_temp) || Number.parseFloat(chunk.temp04) > Number.parseFloat(chunk.max_temp)}">
                            温度04：{{ chunk.temp04 }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </div>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 参数说明：
 * node_name设备名称；
 * lora_type设备类型；
 * sensor_state设备状态；
 * demolition_state防拆状态；
 * battery_state电压状态；
 * voltage_value当前电压；
 * 温湿度：sensor_state设备状态（正常/正常）；min_temperature最小温度；max_temperature最大温度；temperature当前温度；
 *        min_humidity最小湿度；max_humidity最小湿度；humidity当前湿度；
 *        sensor_state !== '正常/正常' demolition_state !== '正常'   battery_state !== '正常'
 * 无线水浸：dry_wet报警状态 wet（浸水自动报警）dry（无水自动报警）；
 * 无线压力变送器：min_pressure最小压力；max_pressure最大压力；pressure当前压力
 * 无线液位变送器：min_liquid最小液位；max_liquid最大液位；liquid当前液位；
 * 无线烟感：
 * 燃气报警：concentration当前浓度；
 * 一键报警：
 * 红外报警：battery_state电池状态
 * 安全用电：trip_state脱扣状态；leave_electricity剩余电流；
 *          min_voltage最小电压；max_voltage最大电压；a_voltage电压A；b_voltage电压B；c_voltage电压C；
 *          min_current最小电流；max_current最大电流；a_current电流A；b_current电流B；c_current电流C；
 *          a_power功率A；b_power功率B；c_power功率C；
 *          min_temp最小温度；max_temp最大温度；temp01温度01；temp02温度02；temp03温度03；
 * */
import { mapState } from 'vuex'
export default{
  name: 'monitman',
  data () {
    return {
      posNowName: '',
      posName: '',
      listData: [],
      monitTimer: null,
      speed: 10000
    }
  },
  created () {

  },
  mounted () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    this.getListData()
    // 启动定时器
    this.startTimer()
  },
  computed: {
    ...mapState('user', {
      modVisit: state => state.modAuthority.monitman
    }),
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    // 搜索
    searchList () {
      this.posName = this.posNowName
      // 清除定时器
      clearInterval(this.monitTimer)
      // 获取列表数据
      this.getListData()
      // 启动定时器
      this.startTimer()
    },
    // 获取监控数据
    getListData () {
      let params = {
        project_id: this.projectId,
        location_name: this.posName
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/v4.9.3/selNodeSquare',
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
    // 全屏跳转
    clickSkip () {
      const openUrl = this.baseUrl() + '/wx365web/#/monitfull?projectId=' + this.projectId
      window.open(openUrl)
    }
  },
  beforeDestroy () {
    // 清除定时器
    clearInterval(this.monitTimer)
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .module-container .module-main{
    background-color: transparent;
    .main-search{
      padding-left: 20px;
      padding-right: 20px;
      background: #ffffff;
    }
    .content{
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
                &.offline{
                  .iconfont {
                    color: #797979;
                  }
                  .icon-text{
                    color: #797979;
                  }
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
          .elect{
            .chunk-body{
              .chunk-icon{
                flex-grow: 1;
              }
              .chunk-content{
                flex-grow: 1;
              }
              .chunk-item{
                flex-grow: 1;
                padding: 0 5px;
                .chunk-item-in{
                  display: flex;
                  flex-direction: column;
                  height: 154px;
                  padding: 0 5px;
                  border: 1px solid #a2a2a2;
                  .chunk-item-title{
                    display: flex;
                    height: 30px;
                    justify-content: center;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 600;
                  }
                  .chunk-strip {
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
    }
  }
</style>
