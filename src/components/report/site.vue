<template>
  <div class="report-site">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检地址信息报表</el-breadcrumb-item>
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
                <span>地址名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="item">
                <span>任务名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.task"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed prop="project_name" label="项目名称" width="208"></el-table-column>
            <el-table-column prop="position_name" label="地址名称" width="200"></el-table-column>
            <el-table-column prop="plan_name" label="任务名称" width="200"></el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="190"></el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="190"></el-table-column>
            <el-table-column prop="normalSize" label="正常" width="140"></el-table-column>
            <el-table-column prop="abnormalSize" label="异常" width="140"></el-table-column>
            <!--<el-table-column label="操作" width="160">-->
            <!--<template slot-scope="scope">-->
            <!--<el-button type="primary" @click="detailsClick(scope.row)">详情</el-button>-->
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
    <!-- 详情 -->
    <el-dialog title="地址详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="state-hint">
        <p class="item"><i class="dot normal"></i>正常</p>
        <p class="item"><i class="dot over"></i>超时</p>
        <p class="item"><i class="dot leak"></i>漏巡</p>
      </div>
      <el-table class="select-table" :data="detData" style="width: 100%" max-height="360">
        <el-table-column prop="start_date" label="日期"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <i class="dot normal" v-if="scope.row.record_state === 0"></i>
            <i class="dot leak" v-else-if="scope.row.record_state === 2"></i>
            <i class="dot over" v-else></i>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'reportSite',
  data () {
    return {
      search: {
        startDate: '',
        endDate: '',
        name: '',
        task: ''
      },
      nowSearch: {
        startDate: '',
        endDate: '',
        name: '',
        task: ''
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
      detDialog: false,
      detData: [],
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
        companyName: state => state.info.companyName,
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
        this.search.task = ''
        this.nowSearch.name = ''
        this.nowSearch.task = ''
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
      this.search.task = ''
      this.nowSearch.name = ''
      this.nowSearch.task = ''
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
        position_name: this.search.name,
        plan_name: this.search.task,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selInspectPosition',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.position
        } else {
          this.loading = false
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 详情 */
    detailsClick (data) {
      this.detDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_ids: data.project_id,
        position_id: data.position_id,
        plan_id: data.plan_id,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        start_time: data.start_time,
        end_time: data.end_time
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v1.0/selInspectRecordState',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detData = res.data.data1
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
    /* 导出文件 */
    downFile () {
      let params = {
        organize_id: this.orgId,
        project_name: '',
        position_name: this.search.name,
        plan_name: this.search.task,
        start_date: this.search.startDate,
        end_date: this.search.endDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectPositionEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
  .report-site{
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
<<<<<<< HEAD
        padding: 10px;
=======
        padding-top: 10px;
        padding-right: 0;
        padding-bottom: 10px;
        padding-left: 10px;
>>>>>>> 2019-07-06日更新
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
<<<<<<< HEAD
          padding-left: 20px;
          padding-top: 0;
          padding-right: 0;
          padding-bottom: 0;
=======
          padding-top: 0;
          padding-right: 10px;
          padding-bottom: 0;
          padding-left: 20px;
          overflow: scroll;
>>>>>>> 2019-07-06日更新
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
    .medium-dialog{
      .state-hint{
        margin-bottom: 10px;
        .item{
          display: inline-block;
          vertical-align: middle;
          width: 80px;
        }
      }
      .dot{
        display: inline-block;
        vertical-align: middle;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-right: 5px;
        &.normal{
          background-color: #20ca24;
        }
        &.over{
          background-color: #ff6000;
        }
        &.leak{
          background-color: #ff0000;
        }
      }
    }
  }
</style>
