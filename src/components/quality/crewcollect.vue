<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
        <el-breadcrumb-item>人员管理汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item date">
          <span>选择项目</span>
          <el-select v-model="nowSearch.project" style="width: 260px;" filterable multiple collapse-tags placeholder="请选择项目">
            <el-option
              v-for="item in allProject"
              :key="item.project_id"
              :label="item.project_name"
              :value="item.project_id">
            </el-option>
          </el-select>
        </div>
        <div class="item date">
          <span>选择时段</span>
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
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="date" label="日期"></el-table-column>
        <el-table-column prop="project_name" label="项目名称"></el-table-column>
        <el-table-column label="点名成功人数">
          <template slot-scope="scope">
            <span class="blue" v-if="scope.row.rcTrueSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 1}}" class="blue" v-else>{{ scope.row.rcTrueSize }}人</router-link>
          </template>
        </el-table-column>
        <el-table-column label="点名失败人数">
          <template slot-scope="scope">
            <span class="red" v-if="scope.row.rcFalseSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 2}}" class="red" v-else>{{ scope.row.rcFalseSize }}人</router-link>
          </template>
        </el-table-column>
        <el-table-column label="位置打卡有记录数">
          <template slot-scope="scope">
            <span class="blue" v-if="scope.row.recordTrueSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 3}}" class="blue" v-else>{{ scope.row.recordTrueSize }}个</router-link>
          </template>
        </el-table-column>
        <el-table-column label="位置打卡无记录数">
          <template slot-scope="scope">
            <span class="red" v-if="scope.row.recordFalseSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 4}}" class="red" v-else>{{ scope.row.recordFalseSize }}个</router-link>
          </template>
        </el-table-column>
        <el-table-column label="固定岗打卡成功数">
          <template slot-scope="scope">
            <span class="blue" v-if="scope.row.permanentTrueSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 5}}" class="blue" v-else>{{ scope.row.permanentTrueSize }}次</router-link>
          </template>
        </el-table-column>
        <el-table-column label="固定岗未打卡数">
          <template slot-scope="scope">
            <span class="red" v-if="scope.row.permanentFalseSize === 0">0</span>
            <router-link :to="{ path: '/main/crewcollect-det', query:{proId: scope.row.project_id, date: scope.row.date, type: 6}}" class="red" v-else>{{ scope.row.permanentFalseSize }}次</router-link>
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
import { mapState } from 'vuex'
export default{
  name: 'crewcollect',
  data () {
    return {
      search: {
        project: [],
        date: []
      },
      nowSearch: {
        project: [],
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() - 8.64e7
        }
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
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    const nowDate = this.$common.getBeforeDate()
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 获取列表
    this.getListData()
  },
  mounted () {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.crewcollect
    }),
    ...mapState('other', [
      'allProject'
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
      const project = this.search.project
      let proids = ''
      if (project.length > 0) {
        proids = project.join(',')
      } else {
        proids = '0'
      }
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        project_ids: proids,
        start_date: date[0] || '',
        end_date: date[1] || '',
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
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        project_ids: proids,
        start_date: date[0] || '',
        end_date: date[1] || ''
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
  @import '../../assets/css/base-column.css';
</style>
