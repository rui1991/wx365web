<template>
  <div
    class="abnormal"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item>异常检查项</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>巡检地址</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.site"></el-input>
            </div>
            <div class="item">
              <span>检查项</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.checkItem"></el-input>
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
          <div class="search-input">
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
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
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
          <el-table-column prop="inspect_name" label="检查项" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="position_name" label="检查地址" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="standard_name" label="所属标准" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="duty_name" label="所属任务" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="任务执行时间" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{ scope.row.start_time | formatDate }} ~ {{ scope.row.end_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ogz_name" label="执行部门" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="执行人">
            <template slot-scope="scope">
              <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="inspect_contents" label="检查内容及要求" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="abnormal_value" label="异常检查结果" :show-overflow-tooltip="true"></el-table-column>
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
  name: 'abnormal',
  data () {
    return {
      loading: false,
      search: {
        site: '',
        checkItem: '',
        sector: '',
        date: []
      },
      nowSearch: {
        site: '',
        checkItem: '',
        sector: '',
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
      downDisabled: false
    }
  },
  created () {
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
        start_date: date[0] || '',
        end_date: date[1] || '',
        inspect_name: this.search.checkItem,
        ogz_id: this.search.sector,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsHandleAbnormalMesList',
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
    /* 导出 */
    downFile () {
      let date = this.search.date
      let params = {
        project_id: this.projectId,
        position_name: this.search.site,
        start_date: date[0],
        end_date: date[1],
        inspect_name: this.search.checkItem,
        ogz_id: this.search.sector
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/selInsHandleAbnormalMesListEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.abnormal{
  height: 100%;
  padding-bottom: 20px;
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
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
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
          .date{
            width: 420px;
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
  .large-dialog{
    .el-dialog__body{
      .form-title{
        height: 45px;
        line-height: 45px;
        font-size: 16px;
        color: #272727;
      }
      .show-table{
        margin-top: 10px;
        border-radius: 4px;
        border: 1px solid #cecece;
      }
    }
  }
}
</style>
