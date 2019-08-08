<template>
  <div class="calendar-item">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/calendar">巡检日历</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>巡检日历详情</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <el-button type="primary" icon="iconfont icon-return" @click="returnBack">返回</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="任务名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row.id_id)">{{ scope.row.plan_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="执行部门">
            <template slot-scope="scope">
              <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="开始时间">
            <template slot-scope="scope">
              <span>{{ scope.row.start_time | filterDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结束时间">
            <template slot-scope="scope">
              <span>{{ scope.row.end_time | filterDate }}</span>
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
              <span v-else>已完成{{ scope.row.continue_process | formatPercent }}</span>
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
          layout="prev, pager, next, total"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
    <!-- 详情 -->
    <el-dialog title="任务详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <div class="det-operate">
        <el-button type="primary" :disabled="downOneDisa" @click="downTask">导出巡检任务</el-button>
        <el-button type="primary" v-if="detForm.exaState !== undefined" @click="checkExaDet">查看审批详情</el-button>
      </div>
      <el-form :model="detForm" :label-width="formLabelWidth">
        <div class="two-form">
          <el-form-item class="item" label="任务名称">
            <el-input :disabled="true" v-model="detForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行部门">
            <el-input :disabled="true" v-model="detForm.sector"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item :disabled="true" class="item" label="执行时段">
            <el-input :disabled="true" v-model="detForm.startDate"></el-input>
          </el-form-item>
          <el-form-item class="item" label="————">
            <el-input :disabled="true" v-model="detForm.endDate"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="执行组" v-if="detForm.group">
            <el-input :disabled="true" v-model="detForm.group"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行人" v-else>
            <el-input :disabled="true" v-model="detForm.person"></el-input>
          </el-form-item>
          <el-form-item class="item" label="任务进度">
            <el-input :disabled="true" v-model="detForm.taskDegree"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="巡查顺序">
            <el-input :disabled="true" v-model="detForm.desc"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-collapse>
        <div class="item" v-for="(item, index) in detForm.posData" :key="item.position_id">
          <p class="clearfix title">
            <span class="site left">{{item.position_name}}</span>
            <span class="time right">{{item.check_time | formatDate}}</span>
          </p>
          <el-collapse-item :title="item.template_name" :name="index" v-if="item.insPo">
            <el-table class="show-table" :data="item.insPo" style="width: 100%">
              <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
              <el-table-column prop="method" label="检查方法" class-name="multi-row"></el-table-column>
              <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
              <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
              <el-table-column label="检查结果" width="80">
                <template slot-scope="scope">
                  <span v-if="scope.row.task_state === 0">未巡查</span>
                  <span v-else-if="scope.row.task_state === 1">正常</span>
                  <span v-else-if="scope.row.task_state === 2">异常</span>
                  <span v-else></span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <p class="norm-hint" v-else>无关联标准模板</p>
        </div>
      </el-collapse>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 审批详情 -->
    <el-dialog title="审批详情" :visible.sync="exaDetDialog" :show-close="false" :close-on-click-modal="false" custom-class="my-dialog">
      <el-form :model="exaDetForm" :label-width="formLabelWidth">
        <div class="two-form">
          <el-form-item class="item" label="申请人">
            <el-input :disabled="true" v-model="exaDetForm.appPerson"></el-input>
          </el-form-item>
          <el-form-item class="item" label="申请时间">
            <el-input :disabled="true" v-model="exaDetForm.appDate"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="审批人">
            <el-input :disabled="true" v-model="exaDetForm.exaPerson"></el-input>
          </el-form-item>
          <el-form-item class="item" label="审批状态">
            <el-input :disabled="true" v-model="exaDetForm.exaState"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="审批时间">
            <el-input :disabled="true" v-model="exaDetForm.exaDate"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建类型">
            <el-input :disabled="true" v-model="exaDetForm.creType"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="申请原因" class="one-form">
          <el-input type="textarea" :disabled="true" v-model="exaDetForm.appCause"></el-input>
        </el-form-item>
        <el-form-item label="审批意见" class="one-form">
          <el-input type="textarea" :disabled="true" v-model="exaDetForm.exaOpinion"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exaDetDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'calendarItem',
  data () {
    return {
      authority: true,
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detForm: {
        name: '',
        sector: '',
        startDate: '',
        endDate: '',
        group: '',
        person: '',
        taskDegree: '',
        desc: '',
        posData: [],
        exaState: undefined
      },
      formLabelWidth: '100px',
      exaDetDialog: false,
      itemId: '',
      exaDetForm: {
        appPerson: '',
        appDate: '',
        exaPerson: '',
        exaState: '',
        exaDate: '',
        creType: '',
        appCause: '',
        exaOpinion: ''
      },
      downOneDisa: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', true)
    // 权限
    let autDet = this.autDet
    autDet.indexOf(40) === -1 ? this.authority = false : this.authority = true
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        autDet: state => state.autDet.calendar
      }
    )
  },
  filters: {
    filterDate (str) {
      if (!str) { return '' }
      let value = new Date(parseInt(str))
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      return `${month}-${day} ${hour}:${minutes}`
    }
  },
  methods: {
    getListData () {
      let params = {}
      if (this.authority) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          projectN_id: this.nowProid,
          planN_name: '',
          startN_date: this.$route.query.date,
          endN_date: this.$route.query.date,
          ogz_id: '',
          continueN_state: this.$route.query.state,
          userN_id: 0,
          page: this.nowPage,
          limit1: this.limit
        }
      } else {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          projectN_id: this.nowProid,
          planN_name: '',
          startN_date: this.$route.query.date,
          endN_date: this.$route.query.date,
          ogz_id: '',
          continueN_state: this.$route.query.state,
          userN_id: this.userId,
          page: this.nowPage,
          limit1: this.limit
        }
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/sel/selInsTaskSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insTask
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 获取组人员 */
    getGrouoCrew (id) {
      let params = {
        company_id: this.nowClientId,
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
    // 详情
    checkDetails (id) {
      this.itemId = id
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        id_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/sel/selInsTaskOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 开始时间
          const startDate = this.$common.formatDate(itemData.start_time)
          // 结束时间
          const endDate = this.$common.formatDate(itemData.end_time)
          // 任务进度
          const state = itemData.continue_state
          let taskDegree = ''
          if (state === 1) {
            taskDegree = '未领取'
          } else {
            // 完成度
            const degree = this.$common.formatNum(itemData.continue_process) * 1000 / 10 + '%'
            taskDegree = '已完成' + degree
          }
          // 巡查顺序
          const descNum = itemData.po_desc
          let desc = ''
          if (descNum === 0) {
            desc = '随机顺序'
          } else if (descNum === 1) {
            desc = '固定顺序'
          }
          // 审批状态
          const exaState = itemData.approval_state || undefined
          this.detForm = {
            name: itemData.plan_name,
            sector: itemData.ogz_name || '',
            startDate: startDate,
            endDate: endDate,
            group: itemData.group_name || '',
            person: itemData.user_name || '',
            taskDegree: taskDegree,
            desc: desc,
            posData: itemData.pt_position,
            exaState: exaState
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
    // 审批详情
    checkExaDet () {
      this.exaDetDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        apply_type: 0,
        from_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/audit/selAuditByFromID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 申请人
          const appPerson = itemData.apply_user_name
          // 申请时间
          const appDate = this.$common.formatDate(itemData.apply_time)
          // 审批人
          const exaPerson = itemData.audit_user_name || ''
          // 审批状态
          const stateNum = itemData.audit_state
          let exaState = ''
          if (stateNum === 0) {
            exaState = '未审批'
          } else if (stateNum === 1) {
            exaState = '通过'
          } else if (stateNum === 2) {
            exaState = '不通过'
          }
          // 审批时间
          const exaDate = this.$common.formatDate(itemData.audit_time)
          // 创建类型
          const creNum = itemData.apply_type
          let creType = ''
          if (creNum === 0) {
            creType = '巡检补卡'
          } else if (creNum === 1) {
            creType = '工单超时'
          } else if (creNum === 2) {
            creType = '考勤补卡'
          } else if (creNum === 3) {
            creType = '请假'
          }
          // 申请原因
          const appCause = itemData.apply_reason || ''
          // 审批意见
          const exaOpinion = itemData.audit_opinion || ''
          this.exaDetForm = {
            appPerson,
            appDate,
            exaPerson,
            exaState,
            exaDate,
            creType,
            appCause,
            exaOpinion
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
    // 下载
    downTask () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        id_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.downOneDisa = true
      setTimeout(() => {
        this.downOneDisa = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/iDEximport?' + params
    },
    // 返回上一级
    returnBack () {
      this.$router.go(-1)
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', false)
  }
}
</script>

<style lang="less" scoped>
.calendar-item{
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
          width: 280px;
          font-size: 0;
          span{
            margin-right: 5px;
            display: inline-block;
            line-height: 34px;
            font-size: 14px;
          }
        }
      }
    }
  }
  .large-dialog{
    .det-operate {
      padding-right: 20px;
      height: 60px;
      text-align: right;
    }
    .el-collapse{
      border: 1px solid #cecece;
      padding: 10px;
      border-radius: 4px;
      .item{
        border-bottom: 1px solid #cecece;
        &:last-of-type{
          border-bottom: none;
        }
        .title{
          height: 30px;
          line-height: 30px;
          color: #272727;
        }
        .norm-hint{
          height: 35px;
          line-height: 34px;
        }
      }
    }
  }
}
</style>
