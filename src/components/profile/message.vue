<template>
  <div class="message">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>消息</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="operate">
            <el-button type="danger" @click="delDialog = true" :disabled="delOpeDisabled">删除</el-button>
            <el-button type="primary" @click="setAllRead()">全部标为已读</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%;">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column width="80" label="状态">
            <template slot-scope="scope">
              <i class="iconfont icon-noread" style="color: #569ade; cursor: default;" v-if="scope.row.state === 0"></i>
              <i class="iconfont icon-ready" style="color: #cccccc; cursor: default;" v-else-if="scope.row.state === 1"></i>
            </template>
          </el-table-column>
          <el-table-column width="180" label="标题">
            <template slot-scope="scope">
              <span>{{ scope.row.title | tilterTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column label="内容">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row)">{{ scope.row.content }}</a>
            </template>
          </el-table-column>
          <el-table-column width="180" label="项目">
            <template slot-scope="scope">
              <span>{{ scope.row.project_name }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180" label="时间">
            <template slot-scope="scope">
              <span>{{ scope.row.message_time | filterListTime }}</span>
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
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该消息？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 事件详情 -->
    <el-dialog title="事件详情" :visible.sync="eventDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h4 class="form-title">事件详情</h4>
      <el-form :model="eventForm" :label-width="formDetWidth" style="border-bottom: 1px solid #cecece">
        <div class="two-form">
          <el-form-item class="item" label="事件名称">
            <el-input :disabled="true" v-model="eventForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="事件状态">
            <el-input :disabled="true" v-model="eventForm.state"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="eventForm.cerCrew"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="eventForm.creaTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="事件类型">
            <el-input :disabled="true" v-model="eventForm.type"></el-input>
          </el-form-item>
          <el-form-item class="item" label="事件紧急">
            <el-input :disabled="true" v-model="eventForm.level"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="发生位置">
          <el-input :disabled="true" v-model="eventForm.site"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="备注">
          <el-input :disabled="true" type="textarea" v-model="eventForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <h4 class="form-title">图片</h4>
      <div class="show-img">
        <div class="images">
          <img :src="item" v-for="item in eventForm.images" :key="item" height="120" alt="">
        </div>
        <p class="img-hint" v-if="eventForm.images.length === 0">未上传图片</p>
      </div>
      <el-table class="select-table" :data="eventForm.logData" style="width: 100%; margin-top: 10px;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="user_name" width="100" label="回复人"></el-table-column>
        <el-table-column label="回复时间">
          <template slot-scope="scope">
            <span>{{ scope.row.discuss_time | filterReplyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="replay" label="回复内容" class-name="multi-row"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="eventDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 工单详情 -->
    <el-dialog title="工单详情" :visible.sync="workDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h4 class="form-title">工单详情</h4>
      <el-form :model="workForm" :label-width="formDetWidth" style="border-bottom: 1px solid #cecece">
        <div class="two-form">
          <el-form-item class="item" label="工单名称">
            <el-input :disabled="true" v-model="workForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="流水号">
            <el-input :disabled="true" v-model="workForm.mark"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="所属项目">
            <el-input :disabled="true" v-model="workForm.project"></el-input>
          </el-form-item>
          <el-form-item class="item" label="发生位置">
            <el-input :disabled="true" v-model="workForm.site"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="业务类别">
            <el-input :disabled="true" v-model="workForm.sort"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单来源">
            <el-input :disabled="true" v-model="workForm.source"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="workForm.creaTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="workForm.cerName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="当前处理人">
            <el-input :disabled="true" v-model="workForm.conductor"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单状态" style="width: 50%; padding-right: 20px; display: inline-block;">
            <el-input :disabled="true" v-model="workForm.state"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="备注">
          <el-input :disabled="true" type="textarea" v-model="workForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <h4 class="form-title">图片</h4>
      <div class="show-img">
        <div class="images">
          <img :src="item" v-for="item in workForm.images" :key="item" height="120" alt="">
        </div>
        <p class="img-hint" v-if="workForm.images.length === 0">未上传图片</p>
      </div>
      <el-table class="select-table" :data="workForm.logData" style="width: 100%;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="type" width="100" label="操作类型"></el-table-column>
        <el-table-column prop="user_name" width="80" label="执行人"></el-table-column>
        <el-table-column label="执行时间">
          <template slot-scope="scope">
            <span>{{ scope.row.perform_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明" class-name="multi-row"></el-table-column>
        <el-table-column width="100" label="图片">
          <template slot-scope="scope">
            <el-button type="primary" v-if="scope.row.photo" @click="checkWorkImg(scope.row.photo)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="workDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 查看工单日志图片 -->
    <el-dialog title="日志图片" :visible.sync="workImgDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div style="text-align: center; overflow-x: hidden;">
        <img :src="workLogImg" height="380" alt="">
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="workImgDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 审批详情 -->
    <el-dialog title="审批详情" :visible.sync="appDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="appForm" :label-width="formDetWidth">
        <div class="two-form">
          <el-form-item class="item" label="项目名称">
            <el-input :disabled="true" v-model="appForm.proName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="申请人">
            <el-input :disabled="true" v-model="appForm.creCrew"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="申请时间">
            <el-input :disabled="true" v-model="appForm.cerTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="审批人">
            <el-input :disabled="true" v-model="appForm.disCrew"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="审批状态">
            <el-input :disabled="true" v-model="appForm.disState"></el-input>
          </el-form-item>
          <el-form-item class="item" label="审批时间">
            <el-input :disabled="true" v-model="appForm.disTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建类型">
            <el-input :disabled="true" v-model="appForm.creType"></el-input>
          </el-form-item>
          <el-form-item class="item" label="任务名称" v-if="appForm.creTypeNum === 0">
            <el-input :disabled="true" v-model="appForm.taskName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单名称" v-else-if="appForm.creTypeNum === 1">
            <el-input :disabled="true" v-model="appForm.workName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="请假类型" v-else-if="appForm.creTypeNum === 3">
            <el-input :disabled="true" v-model="appForm.leaveType"></el-input>
          </el-form-item>
          <el-form-item class="item" label="班次名称" v-else>
            <el-input :disabled="true" v-model="appForm.shiftName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-if="appForm.creTypeNum === 0">
          <el-form-item class="item" label="开始时间">
            <el-input :disabled="true" v-model="appForm.taskStartTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="结束时间">
            <el-input :disabled="true" v-model="appForm.taskEndTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else-if="appForm.creTypeNum === 1">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="appForm.workCreTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else-if="appForm.creTypeNum === 3">
          <el-form-item class="item" label="开始时间">
            <el-input :disabled="true" v-model="appForm.leaveStartTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="结束时间">
            <el-input :disabled="true" v-model="appForm.leaveEndTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else>
          <el-form-item class="item" label="日期">
            <el-input :disabled="true" v-model="appForm.shiftDate"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="申请原因">
          <el-input :disabled="true" type="textarea" v-model="appForm.cerCause"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="审批意见">
          <el-input :disabled="true" type="textarea" v-model="appForm.disOpinion"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="appDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 报表详情 -->
    <el-dialog title="报表详情" :visible.sync="reportDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <div class="report-item" v-if="reportForm.taskShow">
        <div class="report-chart" ref="taskChart"></div>
        <el-table class="select-table" :data="reportForm.taskTable" width="100%" :span-method="mergeLineMethod">
          <el-table-column prop="sum" label="总数"></el-table-column>
          <el-table-column label="图例">
            <template slot-scope="scope">
              <span class="dice finish" v-if="scope.row.legend === 1"></span>
              <span class="dice undone" v-else-if="scope.row.legend === 2"></span>
              <span class="dice abnormal" v-else-if="scope.row.legend === 3"></span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column prop="percent" label="占比"></el-table-column>
        </el-table>
      </div>
      <div class="report-item" v-if="reportForm.workShow">
        <div class="report-chart" ref="workChart"></div>
        <el-table class="select-table" :data="reportForm.workTable" :span-method="mergeLineMethod">
          <el-table-column prop="sum" label="总数"></el-table-column>
          <el-table-column label="图例">
            <template slot-scope="scope">
              <span class="dice finish" v-if="scope.row.legend === 1"></span>
              <span class="dice undone" v-else-if="scope.row.legend === 2"></span>
              <span class="dice abnormal" v-else-if="scope.row.legend === 3"></span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column prop="percent" label="占比"></el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reportDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 任务详情 -->
    <el-dialog title="任务详情" :visible.sync="taskDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="taskForm" :label-width="formDetWidth">
        <div class="two-form">
          <el-form-item class="item" label="任务名称">
            <el-input :disabled="true" v-model="taskForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行部门">
            <el-input :disabled="true" v-model="taskForm.sector"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="执行时段">
            <el-input :disabled="true" v-model="taskForm.startDate"></el-input>
          </el-form-item>
          <el-form-item class="item" label="————">
            <el-input :disabled="true" v-model="taskForm.endDate"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="执行组" v-if="taskForm.group">
            <el-input :disabled="true" v-model="taskForm.group"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行人" v-else>
            <el-input :disabled="true" v-model="taskForm.person"></el-input>
          </el-form-item>
          <el-form-item class="item" label="任务进度">
            <el-input :disabled="true" v-model="taskForm.taskDegree"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="巡查顺序">
            <el-input :disabled="true" v-model="taskForm.desc"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-collapse>
        <div class="item" v-for="(item, index) in taskForm.posData" :key="item.position_id">
          <p class="clearfix title">
            <span class="site left">{{item.position_name}}</span>
            <span class="time right">{{item.check_time | formatDate}}</span>
          </p>
          <div v-if="item.insPo">
            <el-collapse-item :title="item.template_name" :name="index">
              <el-table class="show-table" :data="item.insPo" stripe style="width: 100%">
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
          </div>
          <p class="norm-hint" v-else>无关联标准模板</p>
        </div>
      </el-collapse>
      <div slot="footer" class="dialog-footer">
        <el-button @click="taskDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'message',
  data () {
    return {
      groupContent: '',
      activeIndex: '1',
      navhint: {
        workCount: '',
        workTime: '',
        helperCount: '',
        helperTime: '',
        clerkCount: '',
        clerkTime: ''
      },
      contentHeight: 0,
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      delOpeDisabled: true,
      delDialog: false,
      multipleSelection: [],
      delDisabled: false,
      formDetWidth: '100px',
      eventDialog: false,
      eventForm: {
        name: '',
        state: '',
        cerCrew: '',
        creaTime: '',
        type: '',
        level: '',
        site: '',
        remark: '',
        images: [],
        logData: []
      },
      workDialog: false,
      workForm: {
        name: '',
        mark: '',
        project: '',
        site: '',
        sort: '',
        source: '',
        creaTime: '',
        cerName: '',
        conductor: '',
        state: '',
        remark: '',
        images: [],
        logData: []
      },
      workImgDialog: false,
      workLogImg: '',
      appDialog: false,
      appForm: {
        proName: '',
        creCrew: '',
        cerTime: '',
        disCrew: '',
        disState: '',
        disTime: '',
        creTypeNum: '',
        creType: '',
        taskName: '',
        workName: '',
        leaveType: '',
        shiftName: '',
        taskStartTime: '',
        taskEndTime: '',
        workCreTime: '',
        leaveStartTime: '',
        leaveEndTime: '',
        shiftDate: '',
        cerCause: '',
        disOpinion: ''
      },
      reportDialog: false,
      reportForm: {
        taskShow: false,
        taskTitle: '',
        taskTable: [],
        workShow: false,
        workTitle: '',
        workTable: []
      },
      taskDialog: false,
      taskForm: {
        name: '',
        sector: '',
        startDate: '',
        endDate: '',
        group: '',
        person: '',
        taskDegree: '',
        desc: '',
        posData: []
      }
    }
  },
  created () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', true)
  },
  mounted () {
    // 获取未读总数
    this.getUnreadSum()
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId
      }
    )
  },
  methods: {
    // 获取未读总数
    getUnreadSum () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/findNrMyMessageTotal',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1[0]
          // 工作通知
          const workCount = itemData.workNrTotal || 0
          // e掌巡管理助手
          const helperCount = itemData.manageNrTotal || 0
          // e掌巡管理小秘书
          const clerkCount = itemData.secretaryNrTotal || 0
          // 总未读数
          const allCount = workCount + helperCount + clerkCount
          this.$store.commit('setUnreadMesCount', allCount)
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
        company_id: this.nowClientId,
        user_id: this.userId,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.4/selMyMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.message
          // 清空选中项
          this.multipleSelection = []
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 删除消息 */
    // 获取选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    submitDelForm () {
      let ids = []
      this.multipleSelection.map((item) => {
        ids.push(item.m_id)
      })
      ids = ids.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        m_ids: ids,
        state: 2
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/lookMyMessage',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          this.delDialog = false
          // 获取未读总数
          this.getUnreadSum()
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.delDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 全部已读 */
    setAllRead () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.4/myMessageAllRead',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.getUnreadSum()
          // 获取列表
          this.getListData()
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
    /* 消息详情 */
    checkDetails (data) {
      // 消息类型
      const type = data.type
      // 状态
      const state = data.state
      if (state === 0) {
        this.setMesRead(data.m_id)
      }
      switch (type) {
        case 0:
          this.eventDetClick(data)
          break
        case 1:
          this.workDetClick(data)
          break
        case 2:
          this.appDetClick(data)
          break
        case 3:
          this.reportDetClick(data)
          break
        case 5:
          this.appDetClick(data)
          break
        case 7:
          this.taskDetClick(data)
          break
      }
    },
    // 设置消息已读
    setMesRead (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        m_ids: id,
        state: 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/lookMyMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let tableData = this.tableData
          tableData.forEach(item => {
            if (item.m_id === id) {
              item.state = 1
            }
          })
          this.getUnreadSum()
        }
      }).catch(() => {

      })
    },
    /* 事件详情 */
    eventDetClick (data) {
      this.eventDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: data.project_id,
        te_id: data.we_id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/getEventToAll',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 事件状态
          const stateNum = itemData.event_state
          let state = ''
          if (stateNum === 1) {
            state = '已处理'
          } else {
            state = '未处理'
          }
          // 创建时间
          const creaTime = itemData.create_time
          // 类型
          const typpeNum = itemData.event_type
          let type = ''
          if (typpeNum === 0) {
            type = '设备'
          } else if (typpeNum === 1) {
            type = '公告'
          } else if (typpeNum === 6) {
            type = '日常'
          }
          // 事件紧急
          let levelNum = itemData.event_level
          let level = ''
          if (levelNum === 0) {
            level = '一般'
          } else if (levelNum === 1) {
            level = '重要'
          } else if (levelNum === 2) {
            level = '紧急'
          }
          // 图片
          let photo = itemData.add_info || []
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=2&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.discussloong || []
          this.eventForm = {
            name: itemData.event_title,
            state: state,
            cerCrew: itemData.user_name,
            creaTime: creaTime,
            type: type,
            level: level,
            site: itemData.address,
            remark: itemData.event_content,
            images: images,
            logData: logData
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
    /* 工单详情 */
    workDetClick (data) {
      this.workDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: data.project_id,
        wo_id: data.we_id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWoOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 创建时间
          const creaTime = this.$common.formatDate(itemData.create_time)
          const stateNum = itemData.wo_state
          // 工单状态
          let state = ''
          if (stateNum === 0) {
            state = '待处理'
          } else if (stateNum === 1) {
            state = '跟进中'
          } else if (stateNum === 2) {
            state = '结单'
          }
          // 图片
          let photo = itemData.photo || ''
          if (photo) {
            photo = photo.split(',')
          } else {
            photo = []
          }
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=10&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.wo_log || []
          this.workForm = {
            name: itemData.wo_name,
            mark: itemData.serial_number,
            project: itemData.project_name,
            site: itemData.address,
            sort: itemData.skills_name || '',
            source: itemData.wo_from,
            creaTime: creaTime,
            cerName: itemData.create_user_name,
            conductor: itemData.access_user_name || '',
            state: state,
            remark: itemData.content,
            images: images,
            logData: logData
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
    // 查看日志图片
    checkWorkImg (url) {
      this.workImgDialog = true
      this.workLogImg = this.sysetApi() + '/showImage?state=10&filename=' + url
    },
    /* 审批详情 */
    appDetClick (data) {
      this.appDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: data.project_id,
        adt_id: data.we_id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/audit/selAuditOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 申请时间
          const cerTime = this.$common.formatDate(itemData.apply_time)
          // 审批状态
          const disStateNum = itemData.audit_state
          let disState = ''
          if (disStateNum === 0) {
            disState = '未审批'
          } else if (disStateNum === 1) {
            disState = '通过'
          } else if (disStateNum === 2) {
            disState = '不通过'
          }
          // 审批时间
          const disTime = this.$common.formatDate(itemData.audit_time)
          // 创建类型
          const creTypeNum = itemData.apply_type
          let creType = ''
          // 任务名称
          let taskName = ''
          // 任务开始时间
          let taskStartTime = ''
          // 任务结束时间
          let taskEndTime = ''
          // 工单名称
          let workName = ''
          // 工单创建时间
          let workCreTime = ''
          // 请假类型
          let leaveType = ''
          // 请假开始时间
          let leaveStartTime = ''
          // 请假结束时间
          let leaveEndTime = ''
          // 班次名称
          let shiftName = ''
          // 班次日期
          let shiftDate = ''
          if (creTypeNum === 0) {
            creType = '巡检补卡'
            taskName = itemData.type_message.plan_name
            taskStartTime = this.$common.formatDate(itemData.type_message.start_time)
            taskEndTime = this.$common.formatDate(itemData.type_message.end_time)
          } else if (creTypeNum === 1) {
            creType = '工单超时'
            workName = itemData.type_message.wo_name
            workCreTime = this.$common.formatDate(itemData.type_message.create_time)
          } else if (creTypeNum === 2) {
            creType = '上班补卡'
            shiftName = itemData.type_message.work_name
            shiftDate = itemData.type_message.date
          } else if (creTypeNum === 3) {
            creType = '请假'
            const leaveTypeNum = itemData.type_message.leave_type
            if (leaveTypeNum === 0) {
              leaveType = '年休假'
            } else if (leaveTypeNum === 1) {
              leaveType = '病假'
            } else if (leaveTypeNum === 2) {
              leaveType = '事假'
            } else if (leaveTypeNum === 3) {
              leaveType = '婚假'
            } else if (leaveTypeNum === 4) {
              leaveType = '产假'
            } else if (leaveTypeNum === 5) {
              leaveType = '其他'
            }
            leaveStartTime = this.$common.formatDate(itemData.type_message.start_time)
            leaveEndTime = this.$common.formatDate(itemData.type_message.end_time)
          } else if (creTypeNum === 4) {
            creType = '下班补卡'
            shiftName = itemData.type_message.work_name
            shiftDate = itemData.type_message.date
          }
          this.appForm = {
            proName: itemData.project_name,
            creCrew: itemData.apply_user_name,
            cerTime: cerTime,
            disCrew: itemData.audit_user_name || '',
            disState: disState,
            disTime: disTime,
            creTypeNum: creTypeNum,
            creType: creType,
            taskName: taskName,
            workName: workName,
            leaveType: leaveType,
            shiftName: shiftName,
            taskStartTime: taskStartTime,
            taskEndTime: taskEndTime,
            workCreTime: workCreTime,
            leaveStartTime: leaveStartTime,
            leaveEndTime: leaveEndTime,
            shiftDate: shiftDate,
            cerCause: itemData.apply_reason || '',
            disOpinion: itemData.audit_opinion || ''
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
    /* 报表详情 */
    reportDetClick (data) {
      this.reportDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: data.project_id,
        rpt_ids: data.we_id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/report/selReportByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let listData = res.data.data1
          // 巡检
          let taskShow = false
          let taskTitle = ''
          let taskTable = []
          // 工单
          let workShow = false
          let workTitle = ''
          let workTable = []
          listData.forEach(item => {
            if (item.report_type === 0) {
              taskShow = true
              taskTitle = '巡检报表（' + item.start_date + ' — ' + item.end_date + '）'
              taskTable = [
                {
                  sum: item.all_size,
                  legend: 1,
                  quantity: item.continueSize,
                  percent: item.c_rate
                },
                {
                  sum: item.all_size,
                  legend: 2,
                  quantity: item.nocontinue,
                  percent: item.n_rate
                },
                {
                  sum: item.all_size,
                  legend: 3,
                  quantity: item.abnormal,
                  percent: item.a_rate
                }
              ]
            } else if (item.report_type === 1) {
              workShow = true
              workTitle = '工单报表（' + item.start_date + ' — ' + item.end_date + '）'
              workTable = [
                {
                  sum: item.all_size,
                  legend: 1,
                  quantity: item.continueSize,
                  percent: item.c_rate
                },
                {
                  sum: item.all_size,
                  legend: 2,
                  quantity: item.nocontinue,
                  percent: item.n_rate
                },
                {
                  sum: item.all_size,
                  legend: 3,
                  quantity: item.abnormal,
                  percent: item.a_rate
                }
              ]
            }
            this.reportForm = {
              taskShow: taskShow,
              taskTitle: taskTitle,
              taskTable: taskTable,
              workShow: workShow,
              workTitle: workTitle,
              workTable: workTable
            }
            if (taskShow) {
              setTimeout(() => {
                this.creTaskChart()
              }, 100)
            }
            if (workShow) {
              setTimeout(() => {
                this.creWorkChart()
              }, 100)
            }
          })
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
    // 巡检报表
    creTaskChart () {
      const chart = this.$echarts.init(this.$refs.taskChart)
      const chartData = [
        {value: this.reportForm.taskTable[0].quantity, name: '已完成'},
        {value: this.reportForm.taskTable[1].quantity, name: '未完成'},
        {value: this.reportForm.taskTable[2].quantity, name: '异常'}
      ]
      chart.setOption({
        title: {
          text: this.reportForm.taskTitle,
          textStyle: {
            color: '#666',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: 14
          },
          left: 'left'
        },
        legend: {
          bottom: 0,
          left: 'center',
          data: ['已完成', '未完成', '异常']
        },
        series: [
          {
            name: '巡检任务',
            type: 'pie',
            radius: '55%',
            data: chartData
          }
        ],
        color: ['#b7dd73', '#ffdb8a', '#fa6b67']
      })
    },
    // 工单报表
    creWorkChart () {
      const chart = this.$echarts.init(this.$refs.workChart)
      const chartData = [
        {value: this.reportForm.workTable[0].quantity, name: '已完成'},
        {value: this.reportForm.workTable[1].quantity, name: '未完成'},
        {value: this.reportForm.workTable[2].quantity, name: '异常'}
      ]
      chart.setOption({
        title: {
          text: this.reportForm.workTitle,
          textStyle: {
            color: '#666',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: 14
          },
          left: 'left'
        },
        legend: {
          bottom: 0,
          left: 'center',
          data: ['已完成', '未完成', '异常']
        },
        series: [
          {
            name: '巡检任务',
            type: 'pie',
            radius: '55%',
            data: chartData
          }
        ],
        color: ['#b7dd73', '#ffdb8a', '#fa6b67']
      })
    },
    // 合并列
    mergeLineMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 3 === 0) {
          return {
            rowspan: 3,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    /* 任务详情 */
    taskDetClick (data) {
      this.taskDialog = true
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: data.project_id,
        id_id: data.we_id
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
          this.taskForm = {
            name: itemData.plan_name,
            sector: itemData.ogz_name || '',
            startDate: startDate,
            endDate: endDate,
            group: itemData.group_name || '',
            person: itemData.user_name || '',
            taskDegree: taskDegree,
            desc: desc,
            posData: itemData.pt_position
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
    }
  },
  filters: {
    tilterTitle (value) {
      if (!value) return ''
      const index = value.indexOf('（')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    },
    filterListTime (theDate) {
      const date = new Date()
      // 现在时间
      const nowdate = date.getTime()
      // 今天凌晨
      const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      // 昨天凌晨
      const yestday = new Date(today - 24 * 3600 * 1000).getTime()
      let value = new Date(theDate)
      let year = value.getFullYear()
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      let seconds = value.getSeconds() + ''
      seconds = seconds.padStart(2, '0')
      if (theDate < nowdate && theDate >= today) {
        return `${hour}:${minutes}:${seconds}`
      } else if (theDate < today && theDate >= yestday) {
        return `昨天 ${hour}:${minutes}:${seconds}`
      } else {
        return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
      }
    },
    filterListTitle (value) {
      const index = value.indexOf('（')
      return value.substr(0, index)
    },
    filterReplyTime (value) {
      if (!value) return ''
      const index = value.indexOf('.')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    }
  },
  watch: {
    activeIndex (newVal, oldVal) {
      this.listData = []
      this.total = 0
      this.nowPage = 1
      this.limit = 10
      this.moreShow = false
      if (newVal === '1') {
        this.navhint.workCount = ''
        this.getWorkListData()
      } else if (newVal === '2') {
        this.navhint.helperCount = ''
        this.getHelperListData()
      } else if (newVal === '3') {
        this.navhint.clerkCount = ''
        this.getClerkListData()
      }
      const workCount = this.navhint.workCount || 0
      const helperCount = this.navhint.helperCount || 0
      const clerkCount = this.navhint.clerkCount || 0
      const allCount = workCount + helperCount + clerkCount
      this.$store.commit('setUnreadMesCount', allCount)
    },
    multipleSelection (newVal, oldVal) {
      if (newVal.length > 0) {
        this.delOpeDisabled = false
      } else {
        this.delOpeDisabled = true
      }
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', false)
  }
}
</script>

<style lang="less">
.message{
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
        .operate{
          display: table-cell;
          vertical-align: middle;
        }
      }
    }
  }
  .large-dialog{
    .form-title{
      height: 45px;
      line-height: 45px;
      font-size: 16px;
      color: #272727;
    }
    .show-img{
      padding-bottom: 10px;
      border-bottom: 1px solid #cecece;
      margin-bottom: 20px;
      .images{
        text-align: center;
        img{
          margin: 5px;
        }
      }
      .img-hint{
        height: 35px;
        line-height: 35px;
        text-align: center;
      }
    }
    .show-table{
      margin-top: 10px;
      border-radius: 4px;
      border: 1px solid #cecece;
    }
    .report-item{
      margin-bottom: 20px;
      font-size: 0;
      .el-table{
        display: inline-block;
        width: 50%;
      }
      .report-chart{
        display: inline-block;
        height: 180px;
        width: 50%;
      }
      .dice{
        display: inline-block;
        width: 12px;
        height: 12px;
        &.finish{
          background: #b7dd73;
        }
        &.undone{
          background: #ffdb8a;
        }
        &.abnormal{
          background: #fa6b67;
        }
      }
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
