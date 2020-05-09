<template>
  <div
    class="fixedpost-rep"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>固定岗管理</el-breadcrumb-item>
          <el-breadcrumb-item>固定岗打卡报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
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
              <el-button type="primary" v-if="authority" @click="setClick">设置</el-button>
            </div>
          </div>
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>岗位名称</span>
              <el-select v-model="nowSearch.station" clearable filterable style="width: 160px;" placeholder="请选择岗位名称">
                <el-option
                  v-for="item in stationOptions"
                  :key="item.position_id"
                  :label="item.position_name"
                  :value="item.position_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="position_name" label="岗位名称"></el-table-column>
          <el-table-column prop="record_size" label="打卡数"></el-table-column>
          <el-table-column label="打卡成功数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row, 1)">{{ scope.row.sucess_size }}</a>
            </template>
          </el-table-column>
          <el-table-column label="未打卡数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details red" @click="detClick(scope.row, 2)">{{ scope.row.failed_size }}</a>
            </template>
          </el-table-column>
          <el-table-column label="打卡异常数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details red" @click="detClick(scope.row, 3)">{{ scope.row.ab_size }}</a>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentDate="detDate"
      :parentPos="detPos"
      :parentType="detType"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/fixedpost/fixedpost-det1'
export default{
  name: 'fixedpostRep',
  data () {
    return {
      loading: false,
      search: {
        date: [],
        station: ''
      },
      nowSearch: {
        date: [],
        station: ''
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      stationOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detDate: '',
      detPos: 0,
      detType: 0,
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
    // 获取固定岗列表
    this.getStationOptions()
  },
  components: {
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      authority: state => state.authority.plan
    }),
    ...mapState('other', [
      'companyId',
      'projectId'
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
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        position_id: this.search.station,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentMain',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.pms
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
    // 获取固定岗列表
    getStationOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentPosition',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.stationOptions = res.data.data1
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
    detClick (data, type) {
      this.detDate = data.date
      this.detPos = data.position_id
      this.detType = type
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downFile () {
      let date = this.search.date
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        position_id: this.search.station
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v1.0/permanentMainEO?' + params
    },
    /* 设置 */
    setClick () {
      this.$router.push({ path: '/main/fixedpost-set' })
    }
  }
}
</script>

<style lang="less" scoped>
.fixedpost-rep{
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
}
</style>
