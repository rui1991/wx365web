<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item>告警记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>设备名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.name" placeholder="请输入手环名称/车牌号"></el-input>
          </div>
          <div class="item">
            <span>设备类型</span>
            <el-select v-model="nowSearch.type" style="width: 160px;" clearable placeholder="请选择设备类型">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>执行部门</span>
            <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择执行部门">
              <el-option
                v-for="item in sectorOptions"
                :key="item.base_id"
                :label="item.name"
                :value="item.base_id">
              </el-option>
            </el-select>
          </div>
          <div class="operate"></div>
        </div>
        <div class="search-row">
          <div class="item date">
            <span>告警时段</span>
            <el-date-picker
              style="width: 280px;"
              v-model="nowSearch.date"
              type="daterange"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="手环名称/车牌号" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.user_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gps_type" label="属性"></el-table-column>
        <el-table-column prop="gps_number" label="设备号" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ogz_name" label="所属部门" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ev" label="告警类型" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="告警时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="告警内容" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="user_names" :show-overflow-tooltip="true" label="告警推送人"></el-table-column>
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
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'gpsAlarmlog',
  data () {
    return {
      loading: false,
      search: {
        name: '',
        type: '',
        sector: '',
        date: []
      },
      nowSearch: {
        name: '',
        type: '',
        sector: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      typeOptions: [
        {
          label: '手环',
          value: 0
        },
        {
          label: '车辆',
          value: 1
        }
      ],
      sectorOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: false
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 获取当天日期
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
  },
  computed: {
    ...mapState('user', {
      modVisit: state => state.modAuthority.gpsAlarmlog
    }),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let date = this.search.date
      let gpsType = this.search.type
      if (gpsType === '') {
        gpsType = 99
      }
      let params = {
        project_id: this.projectId,
        dev_name: this.search.name,
        start_date: date[0] || '',
        end_date: date[1] || '',
        gps_type: gpsType,
        ogz_id: this.search.sector,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsAlarmMes',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
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
    },
    /* 获取部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
    /* 导出 */
    downFile () {
      let date = this.search.date
      let gpsType = this.search.type
      if (gpsType === '') {
        gpsType = 99
      }
      let params = {
        project_id: this.projectId,
        dev_name: this.search.name,
        start_date: date[0] || '',
        end_date: date[1] || '',
        gps_type: gpsType,
        ogz_id: this.search.sector
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.gpsApi() + '/alarmExcelExport?' + params
    }
  },
  filters: {
    filterProperty (val) {
      if (!val) return ''
      if (val === 0) {
        return 'GPS手环'
      } else if (val === 1) {
        return 'GPS车辆'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
