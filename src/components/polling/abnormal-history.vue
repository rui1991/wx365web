<template>
  <div class="abnormal-history">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/abnormal">异常检查项</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>历史记录</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <p class="title">巡检地址：{{ allPath }}</p>
          </div>
          <div class="operate">
            <el-button type="primary" icon="iconfont icon-return" @click="returnBack">返回</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="ins_name" width="160" label="检查项" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="check_content" :show-overflow-tooltip="true" label="检查内容及要求"></el-table-column>
          <el-table-column label="执行人" width="100" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行时间" width="200">
            <template slot-scope="scope">
              <span v-if="scope.row.modification_time">{{ scope.row.modification_time | formatDate }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行结果" width="100">
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
import { mapState, mapActions } from 'vuex'
export default{
  name: 'abnormalHistory',
  data () {
    return {
      allPath: '',
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
    // 获取全路径
    this.getAllPath()
    // 获取列表
    this.getListData()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    // 获取全路径
    getAllPath () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.$route.query.pos
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 路径
          this.allPath = res.data.data1.all_address
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
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.$route.query.pos,
        ins_id: this.$route.query.tem,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selHistoryInsAbnormal',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insAB
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
    // 返回上一级
    returnBack () {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
.abnormal-history{
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
