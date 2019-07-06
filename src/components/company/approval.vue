<template>
  <div class="approval">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业管理</el-breadcrumb-item>
          <el-breadcrumb-item>审批列表</el-breadcrumb-item>
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
              <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.adt_id)">{{ scope.row.apply_user_name }}</a>
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
              <a href="javascript:void(0);" class="operate com" @click="approvalClick(scope.row.adt_id, scope.row.apply_type)" v-else-if="scope.row.audit_state === 0">审批</a>
              <span class="operate forbid" v-else>已审批</span>
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
    <!-- 审批 -->
    <el-dialog title="审批" :visible.sync="appDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="appForm" :rules="rules" ref="ruleAppForm" :label-width="formLabelWidth">
        <el-form-item label="审批状态" prop="state">
          <el-radio-group v-model="appForm.state">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="appForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAppForm('ruleAppForm')">取 消</el-button>
        <el-button type="primary" :disabled="appDisabled" @click="submitAppForm('ruleAppForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="审批详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="detForm" :label-width="formLabelWidth">
        <div class="two-form">
          <el-form-item class="item" label="项目名称">
            <el-input :disabled="true" v-model="detForm.proName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="申请人">
            <el-input :disabled="true" v-model="detForm.creCrew"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="申请时间">
            <el-input :disabled="true" v-model="detForm.cerTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="审批人">
            <el-input :disabled="true" v-model="detForm.disCrew"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="审批状态">
            <el-input :disabled="true" v-model="detForm.disState"></el-input>
          </el-form-item>
          <el-form-item class="item" label="审批时间">
            <el-input :disabled="true" v-model="detForm.disTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建类型">
            <el-input :disabled="true" v-model="detForm.creType"></el-input>
          </el-form-item>
          <el-form-item class="item" label="任务名称" v-if="detForm.creTypeNum === 0">
            <el-input :disabled="true" v-model="detForm.taskName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单名称" v-else-if="detForm.creTypeNum === 1">
            <el-input :disabled="true" v-model="detForm.workName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="请假类型" v-else-if="detForm.creTypeNum === 3">
            <el-input :disabled="true" v-model="detForm.leaveType"></el-input>
          </el-form-item>
          <el-form-item class="item" label="班次名称" v-else>
            <el-input :disabled="true" v-model="detForm.shiftName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-if="detForm.creTypeNum === 0">
          <el-form-item class="item" label="开始时间">
            <el-input :disabled="true" v-model="detForm.taskStartTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="结束时间">
            <el-input :disabled="true" v-model="detForm.taskEndTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else-if="detForm.creTypeNum === 1">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="detForm.workCreTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else-if="detForm.creTypeNum === 3">
          <el-form-item class="item" label="开始时间">
            <el-input :disabled="true" v-model="detForm.leaveStartTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="结束时间">
            <el-input :disabled="true" v-model="detForm.leaveEndTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-else>
          <el-form-item class="item" label="日期">
            <el-input :disabled="true" v-model="detForm.shiftDate"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="申请原因">
          <el-input :disabled="true" type="textarea" v-model="detForm.cerCause"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="审批意见">
          <el-input :disabled="true" type="textarea" v-model="detForm.disOpinion"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
      formLabelWidth: '100px',
      appDialog: false,
      appForm: {
        state: 1,
        remark: ''
      },
      appDisabled: false,
      rules: {
        state: [
          { required: true, message: '请选择审批状态', trigger: 'change' }
        ]
      },
      itemId: '',
      itemType: '',
      detDialog: false,
      detForm: {
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
      }
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 审批 */
    approvalClick (id, type) {
      this.appDialog = true
      this.itemId = id
      this.itemType = type
      this.appForm = {
        state: 1,
        remark: ''
      }
    },
    // 验证表单
    submitAppForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendAppRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetAppForm (formName) {
      this.$refs[formName].resetFields()
      this.appDialog = false
    },
    // 提交
    sendAppRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        adt_id: this.itemId,
        apply_type: this.itemType,
        audit_state: this.appForm.state,
        opinion: this.appForm.remark
      }
      params = this.$qs.stringify(params)
      this.appDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/audit/auditAudit',
        data: params
      }).then((res) => {
        this.appDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAppForm('ruleAppForm')
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
        this.appDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        adt_id: id
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
          this.detForm = {
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
