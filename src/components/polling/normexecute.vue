<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
        <el-breadcrumb-item>巡检标准执行汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>地址名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.site"></el-input>
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
          <div class="item">
            <span>执行人</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.person"></el-input>
          </div>
          <div class="operate"></div>
        </div>
        <div class="search-row">
          <div class="item date">
            <span>执行时段</span>
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
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="提交时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.handle_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position_name" label="地址名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="duty_name" label="所属任务" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ins_time" label="任务执行时间" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="执行标准" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.pt_id, scope.row.os_id)">{{ scope.row.standard_name }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="sdd_size" label="检查项数量" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="abnormal_size" label="异常项数量" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="ogz_name" label="执行部门" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="执行人">
          <template slot-scope="scope">
            <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
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
    </div>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPt="ptId"
      :parentOs="osId"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/polling/normexecute-det'
export default{
  name: 'normexecute',
  data () {
    return {
      loading: false,
      search: {
        site: '',
        sector: '',
        person: '',
        date: []
      },
      nowSearch: {
        site: '',
        sector: '',
        person: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      sectorOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      ptId: 0,
      osId: 0,
      detDialog: false
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
  components: {
    detModule
  },
  computed: {
    ...mapState('user', {
      modVisit: state => state.modAuthority.normexecute
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
      let params = {
        project_id: this.projectId,
        position_name: this.search.site,
        ogz_id: this.search.sector,
        user_name: this.search.person,
        start_date: date[0],
        end_date: date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsStandardDoingSummary',
        data: params
      }).then((res) => {
        this.loading = false
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
    /* 详情 */
    detClick (ptId, osId) {
      this.ptId = ptId
      this.osId = osId
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
