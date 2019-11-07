<template>
  <div class="envswg-log">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>环境监控管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/envmonit/envccd">环境监控传感器</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>设备历史记录</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <el-date-picker
              v-model="date"
              type="daterange"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="dateChange">
            </el-date-picker>
          </div>
        </div>
        <p class="hint">{{ name }}</p>
        <el-table class="list-table" :data="tableData" border v-if="type == 45" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="温度值">
            <template slot-scope="scope">
              <span v-if="scope.row.temperature">{{ scope.row.temperature }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="湿度值">
            <template slot-scope="scope">
              <span v-if="scope.row.humidity">{{ scope.row.humidity }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值">
            <template slot-scope="scope">
              <span v-if="scope.row.voltage_value">{{ scope.row.voltage_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压状态">
            <template slot-scope="scope">
              <span v-if="scope.row.battery_state">{{ scope.row.battery_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="防拆状态">
            <template slot-scope="scope">
              <span v-if="scope.row.demolition_state">{{ scope.row.demolition_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.sensor_state">{{ scope.row.sensor_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-table class="list-table" :data="tableData" border v-else-if="type == 25" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值">
            <template slot-scope="scope">
              <span v-if="scope.row.voltage_value">{{ scope.row.voltage_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压状态">
            <template slot-scope="scope">
              <span v-if="scope.row.battery_state">{{ scope.row.battery_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.sensor_state">{{ scope.row.sensor_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-table class="list-table" :data="tableData" border v-else-if="type == 36" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="压力值">
            <template slot-scope="scope">
              <span v-if="scope.row.pressure">{{ scope.row.pressure }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值">
            <template slot-scope="scope">
              <span v-if="scope.row.voltage_value">{{ scope.row.voltage_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压状态">
            <template slot-scope="scope">
              <span v-if="scope.row.battery_state">{{ scope.row.battery_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-table class="list-table" :data="tableData" border v-else-if="type == 39" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值">
            <template slot-scope="scope">
              <span v-if="scope.row.voltage_value">{{ scope.row.voltage_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.sensor_state">{{ scope.row.sensor_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-table class="list-table" :data="tableData" border v-else-if="type == 41" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column width="180" label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值">
            <el-table-column
              prop="a_voltage"
              label="电压A">
            </el-table-column>
            <el-table-column
              prop="b_voltage"
              label="电压B">
            </el-table-column>
            <el-table-column
              prop="c_voltage"
              label="电压C">
            </el-table-column>
          </el-table-column>
          <el-table-column label="电流值">
            <el-table-column
              prop="a_current"
              label="电流A">
            </el-table-column>
            <el-table-column
              prop="b_current"
              label="电流B">
            </el-table-column>
            <el-table-column
              prop="c_current"
              label="电流C">
            </el-table-column>
          </el-table-column>
          <el-table-column label="功率值">
            <el-table-column
              prop="a_power"
              label="功率A">
            </el-table-column>
            <el-table-column
              prop="b_power"
              label="功率B">
            </el-table-column>
            <el-table-column
              prop="c_power"
              label="功率C">
            </el-table-column>
          </el-table-column>
          <el-table-column label="温度值">
            <el-table-column
              prop="temp01"
              label="温度01">
            </el-table-column>
            <el-table-column
              prop="temp02"
              label="温度02">
            </el-table-column>
            <el-table-column
              prop="temp03"
              label="温度03">
            </el-table-column>
            <el-table-column
              prop="temp04"
              label="温度04">
            </el-table-column>
          </el-table-column>
          <el-table-column label="告警">
            <el-table-column
              prop="leave_electricity"
              label="剩余电流">
            </el-table-column>
            <el-table-column
              prop="trip_state"
              label="脱扣状态">
            </el-table-column>
            <el-table-column
              prop="sensor_state"
              label="告警状态">
            </el-table-column>
          </el-table-column>
        </el-table>
        <el-table class="list-table" :data="tableData" border v-else-if="type == 44" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="浓度值" v-if="alarmType === '燃气报警'">
            <template slot-scope="scope">
              <span v-if="scope.row.concentration">{{ scope.row.concentration }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压值" v-else>
            <template slot-scope="scope">
              <span v-if="scope.row.voltage_value">{{ scope.row.voltage_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="电压状态">
            <template slot-scope="scope">
              <span v-if="scope.row.battery_state">{{ scope.row.battery_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="防拆状态">
            <template slot-scope="scope">
              <span v-if="scope.row.demolition_state">{{ scope.row.demolition_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.sensor_state">{{ scope.row.sensor_state }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page="nowPage"
          layout="sizes, prev, pager, next, total"
          :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
          :page-size="limit"
          @size-change="handleSizeChange"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'envswgLog',
  data () {
    return {
      name: '',
      date: [],
      type: 1,
      alarmType: '',
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created () {

  },
  mounted () {
    this.type = this.$route.query.type
    this.name = this.$route.query.name
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.date = [nowDate, nowDate]
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    dateChange (date) {
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        devEUI: this.$route.query.id,
        start_date: this.date[0],
        end_date: this.date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selNodeData',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          const tableData = res.data.data1.message
          if (tableData.length > 0) {
            this.alarmType = tableData[0].lora_type
          }
          this.tableData = tableData
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            this.getListData()
          }
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
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    }
  }
}
</script>

<style lang="less" scoped>
  .envswg-log{
    height: 100%;
    .module-container{
      height: 100%;
      padding: 0;
      .module-header{
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 20px;
        .el-breadcrumb{
          padding-top: 15px;
          padding-left: 20px;
          padding-bottom: 15px;
          background: #ffffff;
        }
      }
      .module-main{
        padding: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .search{
          display: table;
          width: 100%;
          height: 60px;
          .item{
            display: table-cell;
            vertical-align: middle;
          }
        }
        .hint{
          height: 35px;
          line-height: 35px;
          color: #4fa5f2;
        }
      }
    }
  }
</style>
