<template>
  <div class="report-worksta">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>员工工单报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container
        class="module-content"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-aside width="280px" class="module-aside">
          <el-tree
            style="padding: 5px"
            :data="orgTree"
            ref="orgTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            @check-change="orgCheckChange"
            @node-click="orgNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>开始日期</span>
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
                <span>结束日期</span>
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
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>员工姓名</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed prop="project_name" label="机构名称" width="150"></el-table-column>
            <el-table-column prop="user_name" label="员工名称" width="120"></el-table-column>
            <el-table-column prop="woSize" label="接单次数" width="120"></el-table-column>
            <el-table-column prop="continueSize" label="已结单" width="100"></el-table-column>
            <el-table-column prop="notContinueSize" label="未结单" width="100"></el-table-column>
            <el-table-column prop="outtimeSize" label="处理超时单" width="100"></el-table-column>
            <el-table-column prop="backSize" label="退单次数" width="100"></el-table-column>
            <el-table-column label="结单率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.continueRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="超时率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.outtimeRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="退单率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.backRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均响应时长" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.avgResponseTime | formatInteger }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均处理时长" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.avgProcessingTime | formatInteger }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总工时" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.sumWorkingHours | formatInteger }}</span>
              </template>
            </el-table-column>
            <!--<el-table-column label="平均评价" width="120">-->
            <!--<template slot-scope="scope">-->
            <!--<span>{{ scope.row.avgComments | formatInteger }}</span>-->
            <!--</template>-->
            <!--</el-table-column>-->
          </el-table>
          <el-pagination
            background
            prev-text="上一页"
            next-text="下一页"
            :current-page="nowPage"
            layout="prev, pager, next, total"
            @current-change="pageChang"
            :total="total">
          </el-pagination>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'reportWorksta',
  data () {
    return {
      search: {
        startDate: '',
        endDate: '',
        name: ''
      },
      nowSearch: {
        startDate: '',
        endDate: '',
        name: ''
      },
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
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
    // 开始时间
    let startDate = ''
    this.startDate ? startDate = this.startDate : startDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.startDate = startDate
    this.nowSearch.startDate = startDate
    // 结束时间
    let endDate = ''
    this.endDate ? endDate = this.endDate : endDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.endDate = endDate
    this.nowSearch.endDate = endDate
  },
  mounted () {
    // 获取机构树
    this.getOrganTree()
    if (this.orgId) {
      // 获取列表数据
      this.getListData()
    }
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.reportArg.orgId,
        orgType: state => state.reportArg.orgType,
        startDate: state => state.reportArg.startDate,
        endDate: state => state.reportArg.endDate
      }
    )
  },
  methods: {
    // 获取机构树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let orgData = res.data.data1
          // 处理部门树
          orgData = this.initDisSecTree(orgData)
          this.orgTree = orgData
          if (this.orgId) {
            this.$refs.orgTree.setCheckedKeys([this.orgId])
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
    // 初始化处理部门
    initDisSecTree (treeData) {
      treeData.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
      return treeData
    },
    initRecSecTree (data) {
      data.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
    },
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) return
        const type = data.organize_type
        let args = {}
        if (type === 3) {
          args = {
            id: data.id,
            type: type,
            proId: data.base_id
          }
        } else {
          args = {
            id: data.id,
            type: type,
            proId: ''
          }
        }
        this.$refs.orgTree.setCheckedKeys([data.id])
        // 机构ID
        this.$store.commit('setReportOrg', args)
        // 清空搜索框
        this.search.name = ''
        this.nowSearch.name = ''
        // 当前页码初始化
        this.nowPage = 1
        // 获取列表数据
        this.getListData()
      } else {
        if (this.orgId === data.id) {
          this.$refs.orgTree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (data.disabled) return
      if (node.checked) return
      const type = data.organize_type
      let args = {}
      if (type === 3) {
        args = {
          id: data.id,
          type: type,
          proId: data.base_id
        }
      } else {
        args = {
          id: data.id,
          type: type,
          proId: ''
        }
      }
      this.$refs.orgTree.setCheckedKeys([data.id])
      // 机构ID
      this.$store.commit('setReportOrg', args)
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 判断是否选择组织
      if (!this.orgId) return
      // 报表日期
      const args = {
        startDate: this.search.startDate,
        endDate: this.search.endDate
      }
      this.$store.commit('setReportDate', args)
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        organize_id: this.orgId,
        project_name: '',
        user_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selUserWorkorderReport',
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 导出文件 */
    downFile () {
      let params = {
        organize_id: this.orgId,
        project_name: '',
        user_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selUserWorkorderReportEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
  .report-worksta{
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
      .module-content{
        height: 100%;
        padding-top: 10px;
        padding-right: 0;
        padding-bottom: 10px;
        padding-left: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          padding: 5px;
          border-radius: 6px;
          border: 1px solid #cccccc;
        }
        .module-main{
          padding-top: 0;
          padding-right: 10px;
          padding-bottom: 0;
          padding-left: 20px;
          overflow: scroll;
          .search{
            padding-top: 5px;
            padding-bottom: 5px;
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
  }
</style>
