<template>
  <div class="task">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检任务</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>任务名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>开始时间</span>
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
              <span>结束时间</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.endDate"
                type="date"
                :clearable="false"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>执行部门</span>
              <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择执行部门">
                <el-option
                  v-for="item in sectorOptions"
                  :key="item.base_id"
                  :label="item.name"
                  :value="item.base_id">
                </el-option>
              </el-select>
            </div>
            <div class="item">
              <span>完成状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择完成状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>执行人员</span>
              <el-select v-model="nowSearch.crews" style="width: 160px;" multiple collapse-tags placeholder="请选择执行人员">
                <el-option
                  v-for="item in crewOptions"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" :disabled="downDisabled" v-if="authority.down" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="任务名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.id_id)">{{ scope.row.plan_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="执行部门">
            <template slot-scope="scope">
              <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column width="200" label="开始时间">
            <template slot-scope="scope">
              <span>{{ scope.row.start_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column width="200" label="结束时间">
            <template slot-scope="scope">
              <span>{{ scope.row.end_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行组/执行人" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-popover
                placement="top"
                :title="scope.row.group_name"
                trigger="click"
                :content="groupContent"
                v-if="scope.row.group_id">
                <a href="javascript:void(0);" slot="reference" class="blue" @click="getGrouoCrew(scope.row.group_id)">{{ scope.row.group_name }}</a>
              </el-popover>
              <span v-else-if="scope.row.user_id">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
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
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column width="260" label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="clickDraw(scope.row.id_id)" v-if="scope.row.draw === 1 && authority.draw">领取</a>
              <span class="operate forbid" v-else-if="scope.row.draw === 2 && authority.draw">领取</span>
              <span class="operate forbid" v-else-if="scope.row.draw === 3 && authority.draw">已领取</span>
              <a href="javascript:void(0);" class="operate com" @click="clickDispatch(scope.row.id_id, scope.row.ogz_id)" v-if="scope.row.dispatch === 1 && authority.dispatch">派遣</a>
              <span class="operate forbid" v-else-if="scope.row.dispatch === 2 && authority.dispatch">派遣</span>
              <a href="javascript:void(0);" class="operate com" @click="clickTrade(scope.row.id_id, scope.row.ogz_id)" v-if="scope.row.trade === 1 && authority.dispatch">换人</a>
              <span class="operate forbid" v-else-if="scope.row.trade === 2 && authority.dispatch">换人</span>
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.id_id)" v-if="scope.row.com === 1 && authority.com">维护</a>
              <span class="operate forbid" v-if="scope.row.com === 2 && authority.com">维护</span>
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
    <el-dialog title="审批详情" :visible.sync="exaDetDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
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
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model.trim="crewFilter"></el-input>
      <el-table  class="select-table" :data="sectorCrewOptions" style="width: 100%" max-height="360">
        <el-table-column width="65">
          <template slot-scope="scope">
            <el-radio :label="scope.row.user_id" @change.native="getTemplateRow(scope.row.user_name)" v-model="crewId">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column prop="user_phone" label="联系方式"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="crewDisabled" @click="selectCrew">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'task',
  data () {
    return {
      authority: {
        draw: true,
        down: true,
        com: true,
        dispatch: true
      },
      search: {
        name: '',
        startDate: '',
        endDate: '',
        sector: '',
        state: '',
        crews: '0'
      },
      nowSearch: {
        name: '',
        startDate: '',
        endDate: '',
        sector: '',
        state: '',
        crews: []
      },
      sectorOptions: [],
      stateOptions: [
        {
          label: '已完成',
          value: 0
        },
        {
          label: '未完成',
          value: 3
        }
      ],
      crewOptions: [],
      ocrewOptions: [],
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      nowTime: 0,
      todayStartTime: 0,
      detDialog: false,
      detForm: {
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        group: '',
        person: '',
        taskDegree: '',
        desc: '',
        posData: [],
        exaState: undefined
      },
      formLabelWidth: '80px',
      exaDetDialog: false,
      itemId: '',
      downDisabled: false,
      downOneDisa: false,
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
      getWay: 1,
      crewDialog: false,
      crewDisabled: true,
      sectorCrewOptions: [],
      osectorCrewOptions: [],
      crewName: '',
      crewId: '',
      crewFilter: ''
    }
  },
  created () {
    // 获取当天日期
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.startDate = nowDate
    this.search.endDate = nowDate
    this.nowSearch.startDate = nowDate
    this.nowSearch.endDate = nowDate
    // 今天开始毫秒
    let todayStartTime = nowDate + ' 00:00:00'
    this.todayStartTime = new Date(todayStartTime).getTime()
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
    // 获取项目人员
    this.getCrewOptions()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(36) === -1 ? this.authority.draw = false : this.authority.draw = true
    autDet.indexOf(37) === -1 ? this.authority.down = false : this.authority.down = true
    autDet.indexOf(38) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(39) === -1 ? this.authority.dispatch = false : this.authority.dispatch = true
  },
  mounted () {

  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        userName: state => state.info.userName,
        sectorId: state => state.info.sectorId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.task
      }
    )
  },
  methods: {
    // 搜索
    searchList () {
      let crews = this.nowSearch.crews
      if (crews.length > 0) {
        crews = crews.join(',')
      } else {
        crews = '0'
      }
      this.search = {
        name: this.nowSearch.name,
        startDate: this.nowSearch.startDate,
        endDate: this.nowSearch.endDate,
        sector: this.nowSearch.sector,
        state: this.nowSearch.state,
        crews: crews
      }
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
        projectN_id: this.nowProid,
        planN_name: this.search.name,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
        ogz_id: this.search.sector,
        continueN_state: this.search.state,
        userN_id: this.search.crews,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/sel/selInsTaskSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          let nowTime = new Date().getTime()
          const nowSector = this.sectorId + ''
          let tableData = res.data.data1.insTask
          // 领取draw 1：可领取 2：不可领取 3：已领取
          // 派遣dispatch 1: 可派遣 2：不可派遣
          // 换人trade 1：可换人 2：不可换人
          // 维护com 1：可维护 2：不可维护
          tableData.forEach(item => {
            // 领取、派遣
            if (item.continue_state === 1) {
              if (item.start_time <= nowTime && item.end_time > this.todayStartTime) {
                if (nowSector === item.ogz_id || item.ogz_id === undefined) {
                  item.draw = 1
                } else {
                  item.draw = 2
                }
              } else {
                item.draw = 2
              }
              if (item.end_time >= this.todayStartTime) {
                item.dispatch = 1
              } else {
                item.dispatch = 2
              }
            } else {
              item.draw = 3
              item.dispatch = 2
            }
            // 换人
            if (item.continue_state === 0 || item.continue_state === 2) {
              if (!item.group_id) {
                if (item.end_time >= this.todayStartTime && parseFloat(item.continue_process) !== 1) {
                  item.trade = 1
                } else {
                  item.trade = 2
                }
              } else {
                item.trade = 2
              }
            } else {
              item.trade = 2
            }
            // 维护
            if (item.continue_state === 1 && item.end_time > nowTime) {
              item.com = 1
            } else {
              item.com = 2
            }
          })
          this.tableData = tableData
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
    /* 详情 */
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
    // 下载单个任务
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
    /* 领取和派遣 */
    // 领取
    clickDraw (id) {
      this.itemId = id
      this.getWay = 1
      this.submitTaskCrew()
    },
    // 派遣
    clickDispatch (id, sector) {
      this.itemId = id
      this.getWay = 2
      this.crewDialog = true
      // 清空选中数据
      this.crewName = ''
      this.crewId = ''
      this.crewFilter = ''
      // 获取部门人员
      this.getSectorCrew(sector)
    },
    getTemplateRow (name) {
      this.crewName = name
    },
    selectCrew () {
      const getWay = this.getWay
      if (getWay === 2) {
        this.submitTaskCrew()
      } else if (getWay === 3) {
        this.submitTaskTrade()
      }
    },
    // 提交
    submitTaskCrew () {
      let params = {}
      const getWay = this.getWay
      if (getWay === 1) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          id_id: this.itemId,
          type: 0,
          user_name: this.userName
        }
      } else if (getWay === 2) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          id_id: this.itemId,
          type: 1,
          user_name: this.userName,
          userN_name: this.crewName,
          userN_id: this.crewId
        }
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/reqInsTask',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const getWay = this.getWay
          if (getWay === 1) {
            this.$message({
              showClose: true,
              message: '领取成功',
              type: 'success'
            })
          } else if (getWay === 2) {
            this.$message({
              showClose: true,
              message: '派遣成功',
              type: 'success'
            })
            this.crewDialog = false
          }
          // 刷新列表数据
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
    /* 换人 */
    clickTrade (id, sector) {
      this.itemId = id
      this.getWay = 3
      this.crewDialog = true
      // 清空选中数据
      this.crewName = ''
      this.crewId = ''
      this.crewFilter = ''
      // 获取部门人员
      this.getSectorCrew(sector)
    },
    // 提交
    submitTaskTrade () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        id_id: this.itemId,
        userN_id: this.crewId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v2.1.02/all/alter/alterInsTaskUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '换人成功',
            type: 'success'
          })
          this.crewDialog = false
          // 刷新列表数据
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
    /* 获取部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.nowOrgid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
    /* 项目人员 */
    getCrewOptions () {
      let params = {
        organize_id: this.nowOrgid,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewData = res.data.data1.users
          this.crewOptions = crewData
          this.ocrewOptions = crewData
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
    /* 部门人员 */
    getSectorCrew (sector) {
      let orgId = 0
      if (sector) {
        orgId = sector
      }
      let params = {
        project_id: this.nowProid,
        ogz_id: orgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selUserByOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorCrewOptions = res.data.data1
          this.osectorCrewOptions = res.data.data1
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
    /* 导出 */
    downFile () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        planN_name: this.search.name,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
        ogz_id: this.search.sector,
        continueN_state: this.search.state,
        userN_id: this.search.crews,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/v2.1.02/pc/imp/inseximport?' + params
    },
    /* 维护 */
    comClick (id) {
      this.$router.push(
        {
          path: '/main/task-com',
          query: {
            id: id
          }
        }
      )
    }
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
  watch: {
    crewFilter (val, oldVal) {
      this.sectorCrewOptions = this.osectorCrewOptions.filter(item => (~item.user_name.indexOf(val)))
    },
    crewId (val, oldVal) {
      if (val) {
        this.crewDisabled = false
      } else {
        this.crewDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.task{
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
