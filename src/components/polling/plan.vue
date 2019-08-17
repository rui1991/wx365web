<template>
  <div class="plan">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检计划管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>计划名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>开始时间</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.startDate"
                type="date"
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
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>创建人员</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
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
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" v-if="authority.add" @click="addClick">新增</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="计划名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row.plan_id)">{{ scope.row.plan_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="执行部门" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行组">
            <template slot-scope="scope">
              <el-popover
                placement="top"
                :title="scope.row.group_name"
                trigger="click"
                :content="groupContent"
                v-if="scope.row.group_id">
                <a href="javascript:void(0);" slot="reference" class="blue" @click="getGrouoCrew(scope.row.group_id)">{{ scope.row.group_name }}</a>
              </el-popover>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="start_date" label="开始时间"></el-table-column>
          <el-table-column prop="end_date" label="结束时间"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <router-link class="operate com" :to="{ name: 'planCom', query:{id: scope.row.plan_id}}" v-if="authority.com">编辑</router-link>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.plan_id)">删除</a>
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
    <el-dialog title="计划详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="detForm" :label-width="formLabelWidth">
        <el-form-item class="one-form" label="计划名称">
          <el-input :disabled="true" v-model="detForm.name"></el-input>
        </el-form-item>
        <div class="two-form">
          <el-form-item class="item" label="所属项目">
            <el-input :disabled="true" v-model="detForm.project"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行组" v-if="detForm.group">
            <el-input :disabled="true" v-model="detForm.group"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行部门" v-else>
            <el-input :disabled="true" v-model="detForm.sector"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="开始日期">
            <el-input :disabled="true" v-model="detForm.startDate"></el-input>
          </el-form-item>
          <el-form-item class="item" label="结束日期">
            <el-input :disabled="true" v-model="detForm.endDate"></el-input>
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
      </el-form>
      <div class="content">
        <div class="item">
          <span class="item-title">任务模式</span>
          <p>{{detForm.pattern}}</p>
        </div>
        <div class="item" v-if="!detForm.group">
          <span class="item-title">执行频次</span>
          <p>{{detForm.frequency}}</p>
        </div>
        <div class="task" v-if="!detForm.whetherMore && !detForm.group">
          <div class="task-item" v-for="(item, index) in detForm.crews" :key="index">
            <span class="item-title">任务{{index+1}}</span>
            <el-input style="width: 200px;" :disabled="true" :value="item"></el-input>
          </div>
        </div>
        <div class="item" v-if="detForm.whetherMore">
          <span class="item-title">周期</span>
          <p>{{detForm.period}}</p>
        </div>
        <div class="frame" v-if="detForm.whetherMore">
          <p class="item-title">执行时段</p>
          <div class="times">
            <div class="time" v-for="(item, index) in detForm.timeFrame" :key="index">
              <div class="nape">
                <span class="nape-title">开始时间</span>
                <el-input style="width: 120px;" :disabled="true" :value="item.startTime"></el-input>
              </div>
              <div class="nape">
                <span class="nape-title">结束时间</span>
                <el-input style="width: 120px;" :disabled="true" v-model="item.endTime"></el-input>
              </div>
              <div class="nape" v-if="!detForm.group">
                <span class="nape-title">执行人员</span>
                <el-input style="width: 120px;" :disabled="true" v-model="item.crew"></el-input>
              </div>
            </div>
          </div>
        </div>
        <div class="item" v-if="detForm.whetherMore">
          <span class="item-title">巡检顺序</span>
          <p>{{detForm.order}}</p>
        </div>
      </div>
      <el-collapse>
        <div class="item" v-for="(item, index) in detForm.posData" :key="item.position_id">
          <p class="title" style="width: 580px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">{{item.position_name}}</p>
          <div v-if="item.template_id">
            <el-collapse-item :title="item.template_name" :name="index">
              <el-table class="show-table" :data="item.template.inss" style="width: 100%">
                <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
                <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
                <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
                <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
              </el-table>
            </el-collapse-item>
          </div>
          <p class="norm-hint" v-else>无关联标准模板</p>
        </div>
      </el-collapse>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该计划？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'plan',
  data () {
    return {
      authority: {
        add: true,
        com: true,
        del: true
      },
      search: {
        name: '',
        startDate: '',
        endDate: '',
        crew: '',
        sector: ''
      },
      nowSearch: {
        name: '',
        startDate: '',
        endDate: '',
        crew: '',
        sector: ''
      },
      sectorOptions: [],
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      formLabelWidth: '100px',
      detDialog: false,
      detForm: {
        name: '',
        project: '',
        sector: '',
        group: '',
        startDate: '',
        endDate: '',
        pattern: '',
        frequency: '',
        whetherMore: false,
        crews: [],
        period: '',
        timeFrame: [],
        order: '',
        posData: []
      },
      delDialog: false,
      delDisabled: false,
      itemId: ''
    }
  },
  created () {
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(30) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(31) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(34) === -1 ? this.authority.del = false : this.authority.del = true
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowProname: state => state.nowProname,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.plan
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
        plan_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        createN_user: this.search.crew,
        ogz_id: this.search.sector,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/selInsSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.plans
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
    /* 新增 */
    addClick () {
      this.$router.push({ path: '/main/plan-add' })
    },
    /* 详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        plan_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/selInsOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 计划名称
          this.detForm.name = itemData.plan_name
          // 所属项目
          this.detForm.project = this.nowProname
          // 操作角色
          this.detForm.sector = itemData.ogz_name || ''
          // 操作组
          this.detForm.group = itemData.group_name || ''
          // 开始日期
          this.detForm.startDate = itemData.start_date
          // 结束日期
          this.detForm.endDate = itemData.end_date
          // 任务模式
          const patternNum = itemData.plan_model
          let pattern = ''
          // 频次
          let frequency = ''
          // 是否一天多次
          let whetherMore = false
          if (patternNum === 0) {
            pattern = '循环任务'
            // 频率
            const freNum = itemData.frequency
            // 单位
            const unit = itemData.unit
            // 次数
            const degree = itemData.frequency1
            frequency = freNum + unit + degree + '次'
            // 是否一天多次
            if (freNum === 1 && unit === '天') {
              whetherMore = true
            }
          } else if (patternNum === 1) {
            pattern = '单次任务'
          }
          this.detForm.pattern = pattern
          // 频次
          this.detForm.frequency = frequency
          // 是否一天多次
          this.detForm.whetherMore = whetherMore
          // 人员
          const crewData = itemData.users
          let crews = []
          crewData.forEach(item => {
            crews.push(item.user_name)
          })
          this.detForm.crews = crews
          // 周期
          let periodNum = itemData.cycle
          if (periodNum) {
            periodNum = periodNum.split('/')
          } else {
            periodNum = []
          }
          const periodAry = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
          let period = []
          periodNum.forEach(item => {
            let num = parseInt(item)
            period.push(periodAry[num])
          })
          period = period.join(' ')
          this.detForm.period = period
          // 时段
          let timeFrame = []
          let times = itemData.times
          times = times.split('/')
          times.forEach((item, index) => {
            const timeItem = item.split('-')
            const timeFrameItem = {
              startTime: timeItem[0],
              endTime: timeItem[1],
              crew: crews[index]
            }
            timeFrame.push(timeFrameItem)
          })
          this.detForm.timeFrame = timeFrame
          // 点位顺序
          const orderNum = itemData.po_desc
          let order = ''
          if (orderNum === 0) {
            order = '随机顺序'
          } else if (orderNum === 1) {
            order = '固定顺序'
          }
          this.detForm.order = order
          // 点位
          let position = itemData.positions
          position = position.join(',')
          this.detForm.posData = []
          this.getPosData(position)
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
    // 地址
    getPosData (ids) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsSetPositionsTemplate',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.detForm.posData = res.data.data1
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
    /* 删除 */
    delClick (id) {
      this.itemId = id
      this.delDialog = true
    },
    submitDelForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        plan_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/delIns',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.delDialog = false
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
    /* 部门 */
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
    }
  }
}
</script>

<style lang="less" scoped>
.plan{
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
      max-height: 480px;
      overflow: auto;
      .content{
        .item{
          font-size: 0;
          margin-bottom: 15px;
          .item-title{
            display: inline-block;
            width: 100px;
            padding-right: 12px;
            text-align: right;
            font-size: 14px;
          }
          p{
            display: inline-block;
            font-size: 14px;
          }
        }
        .task{
          margin-bottom: 15px;
          .task-item{
            margin-bottom: 10px;
            .item-title{
              display: inline-block;
              width: 100px;
              padding-right: 12px;
              line-height: 34px;
              text-align: right;
            }
          }
        }
        .frame{
          margin-bottom: 15px;
          padding-left: 30px;
          .item-title{
            height: 34px;
            line-height: 34px;
          }
          .time{
            font-size: 0;
            .nape{
              display: inline-block;
              width: 200px;
              .nape-title{
                margin-right: 5px;
                line-height: 45px;
                font-size: 14px;
              }
            }
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
}
</style>
