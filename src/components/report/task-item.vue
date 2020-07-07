<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>报表管理</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/report-task">巡检任务执行报表</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>巡检任务执行报表详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <el-button type="primary" icon="iconfont icon-return" @click="returnBack">返回</el-button>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="任务名称">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.id_id)">{{ scope.row.plan_name }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="po_size" width="80" label="点位数"></el-table-column>
        <el-table-column label="执行部门">
          <template slot-scope="scope">
            <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template slot-scope="scope">
            <span>{{ scope.row.start_time | formatDate('mm-dd hh:mm') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间">
          <template slot-scope="scope">
            <span>{{ scope.row.end_time | formatDate('mm-dd hh:mm') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已完成">
          <template slot-scope="scope">
            <span class="blue" v-if="scope.row.continue_size === 0">0</span>
            <el-popover
              v-else
              placement="top"
              title="已完成点位"
              trigger="click"
              :content="siteFinishContent">
              <a href="javascript:void(0);" slot="reference" class="blue" @click="detFinishClick(scope.row.id_id)">{{ scope.row.continue_size }}</a>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="未完成">
          <template slot-scope="scope">
            <span class="red" v-if="scope.row.not_size === 0">0</span>
            <el-popover
              v-else
              placement="top"
              title="未完成点位"
              trigger="click"
              :content="siteUndoneContent">
              <a href="javascript:void(0);" slot="reference" class="red" @click="detUndoneClick(scope.row.id_id)">{{ scope.row.not_size }}</a>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="执行组/执行人">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              :title="scope.row.group_name"
              trigger="click"
              :content="groupContent"
              v-if="scope.row.group_id">
              <a href="javascript:void(0);" slot="reference" class="blue" @click="getGrouoCrew(scope.row.group_id)">{{ scope.row.group_name }}</a>
            </el-popover>
            <span v-else>{{ scope.row.user_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务进度">
          <template slot-scope="scope">
            <span v-if="scope.row.continue_state === 1">未领取</span>
            <span v-else>已进行{{ scope.row.continue_process | formatPercent }}</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="是否及时完成">
          <template slot-scope="scope">
            <span v-if="scope.row.oo_time === 0">是</span>
            <span v-else-if="scope.row.oo_time === 1">否</span>
          </template>
        </el-table-column>
        <el-table-column label="审批状态">
          <template slot-scope="scope">
            <span v-if="scope.row.approval_state === 1">审批中</span>
            <span v-else-if="scope.row.approval_state === 2">通过</span>
            <span v-else-if="scope.row.approval_state === 3">不通过</span>
            <span v-else></span>
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
      :parentPro="this.$route.query.project_id"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入详情组件
import detModule from '@/components/polling/task-det'
export default{
  name: 'calendarItem',
  data () {
    return {
      tableData: [],
      siteFinishContent: '',
      siteUndoneContent: '',
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      itemId: ''
    }
  },
  created () {

  },
  mounted () {
    // 设置全局项目禁用
    this.setProDisabled(true)
    // 获取列表数据
    this.getListData()
  },
  components: {
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    getListData () {
      const type = this.$route.query.organizeType
      const date = this.$route.query.date
      let params = {}
      if (Number.parseInt(type) === 3) {
        params = {
          project_id: this.$route.query.project_id,
          plan_id: this.$route.query.plan_id,
          continue_state: this.$route.query.state,
          start_date: date[0],
          end_date: date[1],
          page: this.nowPage,
          limit1: this.limit
        }
      } else {
        params = {
          project_id: this.$route.query.project_id,
          ogz_id: this.$route.query.ogz_id,
          plan_id: this.$route.query.plan_id,
          continue_state: this.$route.query.state,
          start_date: date[0],
          end_date: date[1],
          page: this.nowPage,
          limit1: this.limit
        }
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selInspectTaskConAndNotConMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    /* 获取组人员 */
    getGrouoCrew (id) {
      let params = {
        user_id: this.userId,
        group_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/selUserByGroupId',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let crewData = []
          resData.forEach(item => {
            crewData.push(item.user_name)
          })
          const groupContent = crewData.join('、')
          this.groupContent = groupContent
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
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 地址详情 */
    // 已完成
    detFinishClick (id) {
      this.siteFinishContent = ''
      let params = {
        user_id: this.userId,
        id_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsTaskContinuePo',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.mes || []
          let names = resData.map(item => {
            return item.position_name
          })
          this.siteFinishContent = names.join('、')
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
    // 未完成
    detUndoneClick (id) {
      this.siteUndoneContent = ''
      let params = {
        user_id: this.userId,
        id_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsTaskNotContinuePo',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1.mes || []
          let names = resData.map(item => {
            return item.position_name
          })
          this.siteUndoneContent = names.join('、')
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
  @import '../../assets/css/base-column.css';
</style>
