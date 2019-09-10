<template>
  <div class="abnormal">
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
              <span>执行时间</span>
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
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>执行人员</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
            <div class="item">
              <span>工单状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择工单状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="巡检地址">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.isd_id)">{{ scope.row.position_name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="ins_name" label="检查项"></el-table-column>
          <el-table-column label="执行人">
            <template slot-scope="scope">
              <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行时间">
            <template slot-scope="scope">
              <span>{{ scope.row.modification_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行结果"  width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.task_state === 0">未巡查</span>
              <span v-else-if="scope.row.task_state === 1">正常</span>
              <span v-else-if="scope.row.task_state === 2">异常</span>
            </template>
          </el-table-column>
          <el-table-column label="检查备注" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.note">{{ scope.row.note }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="工单状态"  width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.wo_state === 0">待处理</span>
              <span v-else-if="scope.row.wo_state === 1">跟进中</span>
              <span v-else-if="scope.row.wo_state === 2">结单</span>
              <span v-else>未生成</span>
            </template>
          </el-table-column>
          <el-table-column label="当前处理人">
            <template slot-scope="scope">
              <span v-if="scope.row.accept_user_name">{{ scope.row.accept_user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="addClick(scope.row.isd_id, scope.row.position_name)" v-if="scope.row.wo_state === undefined">提单</a>
              <span class="operate forbid" v-else-if="scope.row.wo_state !== undefined">提单</span>
              <a href="javascript:void(0);" class="operate com" @click="historyClick(scope.row)">历史记录</a>
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
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentId="itemId"
      :parentPos="posName"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/polling/abnormal-add'
// 引入详情组件
import detModule from '@/components/polling/abnormal-det'
export default{
  name: 'abnormal',
  data () {
    return {
      search: {
        site: '',
        startDate: '',
        endDate: '',
        crew: '',
        state: ''
      },
      nowSearch: {
        site: '',
        startDate: '',
        endDate: '',
        crew: '',
        state: ''
      },
      stateOptions: [
        {
          label: '未生成',
          value: 9
        },
        {
          label: '待处理',
          value: 0
        },
        {
          label: '跟进中',
          value: 1
        },
        {
          label: '结单',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      posName: '',
      itemId: 0,
      detDialog: false
    }
  },
  created () {
    // 获取列表数据
    this.getListData()
  },
  components: {
    addModule,
    detModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
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
        projectN_id: this.nowProid,
        positionN_name: this.search.site,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
        userN_name: this.search.crew,
        woN_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsAbnormalSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insAB
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
    /* 新增 */
    addClick (id, pos) {
      this.itemId = id
      this.posName = pos
      this.addDialog = true
    },
    addUpdata () {
      this.addDialog = false
      // 更新列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 历史记录 */
    historyClick (data) {
      this.$router.push({
        path: '/main/abnormal-history',
        query: {
          pos: data.position_id,
          tem: data.ins_id
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.abnormal{
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
