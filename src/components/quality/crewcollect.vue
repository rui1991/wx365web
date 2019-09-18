<template>
  <div
    class="crewcollect"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item>人员管理汇总</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <span>选择项目</span>
            <el-select v-model="nowSearch.project" style="width: 160px;"  multiple collapse-tags placeholder="请选择项目">
              <el-option
                v-for="item in allPros"
                :key="item.project_id"
                :label="item.project_name"
                :value="item.project_id">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>开始时间</span>
            <el-date-picker
              style="width: 160px;"
              v-model="nowSearch.startDate"
              type="date"
              :clearable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="item">
            <span>结束时间</span>
            <el-date-picker
              style="width: 160px;"
              v-model="nowSearch.endDate"
              type="date"
              :clearable="false"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="project_name" label="项目名称"></el-table-column>
          <el-table-column label="点名成功人数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 1}}" class="com">{{ scope.row.rcTrueSize }}人</router-link>
            </template>
          </el-table-column>
          <el-table-column label="点名失败人数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 2}}" class="del">{{ scope.row.rcFalseSize }}人</router-link>
            </template>
          </el-table-column>
          <el-table-column label="位置打卡有记录数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 3}}" class="com">{{ scope.row.recordTrueSize }}个</router-link>
            </template>
          </el-table-column>
          <el-table-column label="位置打卡无记录数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 4}}" class="del">{{ scope.row.recordFalseSize }}个</router-link>
            </template>
          </el-table-column>
          <el-table-column label="固定岗打卡成功数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 5}}" class="com">{{ scope.row.permanentTrueSize }}次</router-link>
            </template>
          </el-table-column>
          <el-table-column label="固定岗未打卡数">
            <template slot-scope="scope">
              <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 6}}" class="del">{{ scope.row.permanentFalseSize }}次</router-link>
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
  name: 'crewcollect',
  data () {
    return {
      search: {
        project: [],
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate()
      },
      nowSearch: {
        project: [],
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate()
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: false,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    // 获取列表
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId,
        allPros: state => state.info.allPros,
        allProid: state => state.info.allProid
      }
    )
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
      const project = this.search.project
      let proids = ''
      if (project.length > 0) {
        proids = project.join(',')
      } else {
        proids = '0'
      }
      let params = {
        user_id: this.userId,
        project_ids: proids,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.5/selUserManageAllReport',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.message
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
    /* 导出 */
    downFile () {
      const project = this.search.project
      let proids = ''
      if (project.length > 0) {
        proids = project.join(',')
      } else {
        proids = '0'
      }
      let params = {
        user_id: this.userId,
        project_ids: proids,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.5/selUserManageAllReportEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.crewcollect{
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
          width: 280px;
          font-size: 0;
          span{
            width: 70px;
            display: inline-block;
            line-height: 34px;
            font-size: 14px;
          }
        }
        .operate{
          display: table-cell;
          vertical-align: middle;
          text-align: right;
        }
      }
    }
  }
}
</style>
