<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/vehicle-admin">GPS车辆管理</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>轨迹详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>日期</span>
          <el-date-picker
            v-model="date"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="上传时间">
          <template slot-scope="scope">
            <span>{{ scope.row.up_time }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position_name" label="位置名称"></el-table-column>
        <el-table-column prop="ogz_name" label="速度"></el-table-column>
        <el-table-column prop="person_user_name" label="停留状态"></el-table-column>
        <el-table-column prop="gps_number" label="电量状态"></el-table-column>
        <el-table-column prop="gps_number" label="设备状态"></el-table-column>
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
import { mapState, mapActions } from 'vuex'
export default{
  name: 'vehicleAdminTrack',
  data () {
    return {
      date: this.$common.getNowDate('yyyy-mm-dd'),
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
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
      let params = {
        project_id: this.projectId,
        date: this.date,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsCarMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    },
    beforeDestroy () {
      // 设置全局项目禁用
      this.setProDisabled(false)
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
