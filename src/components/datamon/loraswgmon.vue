<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item>lora网关心跳监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>网关ID</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.mac"></el-input>
          </div>
          <div class="item">
            <span>项目名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.proname"></el-input>
          </div>
          <div class="item">
            <span>网关状态</span>
            <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择网关状态">
              <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
          </div>
        </div>
        <div class="search-row">
          <div class="item date" style="width: 480px;">
            <span>获取时段</span>
            <el-date-picker
              style="width: 360px;"
              v-model="nowSearch.date"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm:ss"
              :time-arrow-control="true"
              :clearable="false"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间">
            </el-date-picker>
          </div>
        </div>
      </div>
      <p class="hint-text red">注：15分钟取一次lora网关在线时间，时间对比大于1分钟则为离线</p>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="project_name" label="项目名称"></el-table-column>
        <el-table-column width="200" label="网关ID">
          <template slot-scope="scope">
            <span>{{ scope.row.gateway_eui }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="获取时间"></el-table-column>
        <el-table-column label="当时状态">
          <template slot-scope="scope">
            <span class="green" v-if="scope.row.online_state === 0">在线</span>
            <span class="red" v-else-if="scope.row.online_state === 1">离线</span>
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
    </div>
  </div>
</template>

<script>
export default{
  name: 'loraswgmon',
  data () {
    return {
      search: {
        mac: '',
        proname: '',
        state: '',
        date: []
      },
      nowSearch: {
        mac: '',
        proname: '',
        state: '',
        date: []
      },
      stateOptions: [
        {
          label: '在线',
          value: 0
        },
        {
          label: '离线',
          value: 1
        }
      ],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() | time.getTime() < Date.now() - 24 * 60 * 60 * 1000 * 7
        }
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemMac: '',
      detDialog: false
    }
  },
  created () {

  },
  mounted () {
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    const startTime = nowDate + ' 00:00:00'
    const nowTime = this.$common.getNowDate('yyyy-mm-dd hh:mm:ss')
    this.search.date = [startTime, nowTime]
    this.nowSearch.date = [startTime, nowTime]
    // 获取列表数据
    this.getListData()
  },
  methods: {
    /* 搜索 */
    searchList () {
      let date = this.nowSearch.date
      if (date.length === 0) {
        this.$message({
          message: '请选择网关心跳时段',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        gateway_eui: this.search.mac,
        project_name: this.search.proname,
        online_state: this.search.state,
        start_time: this.search.date[0],
        end_time: this.search.date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.runApi() + '/selLoraGwLog',
        data: params
      }).then((res) => {
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
  @import '../../assets/css/base-column.css';
  .hint-text{
    height: 35px;
    line-height: 35px;
  }
</style>
