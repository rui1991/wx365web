<template>
  <div class="approval">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业配置</el-breadcrumb-item>
          <el-breadcrumb-item>审批管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>申请人</span>
              <el-input style="width: 160px;" :disabled="creCrewDis" v-model.trim="nowSearch.creCrew"></el-input>
            </div>
            <div class="item">
              <span>申请类型</span>
              <el-select v-model="nowSearch.type" clearable style="width: 160px;" placeholder="请选择申请类型">
                <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>审批状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择申请类型">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>申请时段</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.startDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="item">
              <span>----</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.endDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="申请人">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row.adt_id)">{{ scope.row.apply_user_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="申请时间">
            <template slot-scope="scope">
              <span>{{ scope.row.apply_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="apply_reason" label="申请原因"></el-table-column>
          <el-table-column label="申请类型">
            <template slot-scope="scope">
              <span v-if="scope.row.apply_type === 0">巡检补卡</span>
              <span v-else-if="scope.row.apply_type === 1">工单超时</span>
              <span v-else-if="scope.row.apply_type === 2">上班补卡</span>
              <span v-else-if="scope.row.apply_type === 3">请假</span>
              <span v-else-if="scope.row.apply_type === 4">下班补卡</span>
            </template>
          </el-table-column>
          <el-table-column label="审批人">
            <template slot-scope="scope">
              <span v-if="scope.row.audit_user_name">{{ scope.row.audit_user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="审批时间">
            <template slot-scope="scope">
              <span v-if="scope.row.audit_time">{{ scope.row.audit_time | formatDate }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="审批状态">
            <template slot-scope="scope">
              <span v-if="scope.row.audit_state === 0">未审批</span>
              <span v-else-if="scope.row.audit_state === 1">通过</span>
              <span v-else-if="scope.row.audit_state === 2">不通过</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" v-if="authority">
            <template slot-scope="scope">
              <span class="operate forbid" v-if="scope.row.audit_state === 0 && scope.row.apply_user === userId">审批</span>
              <a href="javascript:void(0);" class="operate com" @click="appClick(scope.row.adt_id, scope.row.apply_type)" v-else-if="scope.row.audit_state === 0">审批</a>
              <span class="operate forbid" v-else>已审批</span>
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
      :parentPro="nowProid"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 审批 -->
    <app-module
      :parentDialog="appDialog"
      :parentId="itemId"
      :parentType="itemType"
      @parentUpdata="appUpdata"
      @parentCancel="appCancel">
    </app-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/company/approval-det'
// 引入审批操作组件
import appModule from '@/components/company/approval-app'
export default{
  name: 'approval',
  data () {
    return {
      authority: true,
      creCrewDis: false,
      search: {
        creCrew: '',
        type: '',
        state: '',
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        creCrew: '',
        type: '',
        state: '',
        startDate: '',
        endDate: ''
      },
      typeOptions: [
        {
          label: '巡检补卡',
          value: 0
        },
        {
          label: '工单超时',
          value: 1
        },
        {
          label: '上班补卡',
          value: 2
        },
        {
          label: '请假',
          value: 3
        },
        {
          label: '下班补卡',
          value: 4
        }
      ],
      stateOptions: [
        {
          label: '未审批',
          value: 0
        },
        {
          label: '通过',
          value: 1
        },
        {
          label: '未通过',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      appDialog: false,
      itemId: '',
      itemType: ''
    }
  },
  created () {
    // 权限
    let autDet = this.autDet
    autDet.indexOf(62) === -1 ? this.authority = false : this.authority = true
    if (!this.authority) {
      const userName = this.userName
      this.search.creCrew = userName
      this.nowSearch.creCrew = userName
      this.creCrewDis = true
    }
    // 获取列表数据
    this.getListData()
  },
  components: {
    detModule,
    appModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        userName: state => state.info.userName,
        nowProid: state => state.nowProid,
        autDet: state => state.autDet.approval
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
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_name: this.search.creCrew,
        apply_type: this.search.type,
        audit_state: this.search.state,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/audit/selAuditSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.audit
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
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 审批 */
    appClick (id, type) {
      this.itemId = id
      this.itemType = type
      this.appDialog = true
    },
    appUpdata () {
      this.appDialog = false
      // 更新列表
      this.getListData()
    },
    appCancel () {
      this.appDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.approval{
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
</style>
