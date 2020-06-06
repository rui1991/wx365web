<template>
  <div class="event-list">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>事件管理</el-breadcrumb-item>
          <el-breadcrumb-item>事件列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>事件名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>事件状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择事件状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>创建人员</span>
              <el-select v-model="nowSearch.creCrew" style="width: 160px;" clearable filterable placeholder="请选择创建人员">
                <el-option
                  v-for="item in crewOptions"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item date">
              <span>创建时段</span>
              <el-date-picker
                style="width: 280px;"
                v-model="nowSearch.date"
                type="daterange"
                value-format="yyyy-MM-dd"
                :clearable="true"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addDialog = true">新增</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="事件名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.te_id)">{{ scope.row.event_title }}</a>
            </template>
          </el-table-column>
          <el-table-column label="事件类型">
            <template slot-scope="scope">
              <span v-if="scope.row.event_type === '0'">设备</span>
              <span v-else-if="scope.row.event_type === '1'">公告</span>
              <span v-else-if="scope.row.event_type === '6'">日常</span>
            </template>
          </el-table-column>
          <el-table-column label="事件状态">
            <template slot-scope="scope">
              <span v-if="scope.row.event_state === 1">已处理</span>
              <span v-else>未处理</span>
            </template>
          </el-table-column>
          <el-table-column label="紧急程度">
            <template slot-scope="scope">
              <span v-if="scope.row.event_level === 0">一般</span>
              <span v-else-if="scope.row.event_level === 1">重要</span>
              <span v-else-if="scope.row.event_level === 2">紧急</span>
            </template>
          </el-table-column>
          <el-table-column prop="user_name" label="创建人"></el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatReplyTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="addMesClick(scope.row.te_id, scope.row.user_id)">追加消息</a>
              <span class="operate forbid" v-if="scope.row.event_state === 1">已处理</span>
              <a href="javascript:void(0);" class="operate com" @click="disposeClick(scope.row.te_id)" v-else-if="scope.row.user_id === userId">处理</a>
              <span class="operate forbid" v-else>处理</span>
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
      :parentCrew="crewOptions"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="projectId"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 追加消息 -->
    <mes-module
      :parentDialog="mesDialog"
      :parentId="itemId"
      :parentUId="uId"
      @parentUpdata="mesUpdata"
      @parentCancel="mesCancel">
    </mes-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/event/event-add'
// 引入详情组件
import detModule from '@/components/event/event-det'
// 引入编辑组件
import mesModule from '@/components/event/event-mes'
export default{
  name: 'event',
  data () {
    return {
      search: {
        name: '',
        state: '',
        creCrew: '',
        date: []
      },
      nowSearch: {
        name: '',
        state: '',
        creCrew: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      stateOptions: [
        {
          label: '已处理',
          value: '1'
        },
        {
          label: '未处理',
          value: '2'
        }
      ],
      crewOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: '',
      uId: 0,
      addDialog: false,
      detDialog: false,
      mesDialog: false
    }
  },
  created () {
    // 获取列表数据
    this.getListData()
    // 获取项目人员
    this.getCrewOptions()
  },
  components: {
    addModule,
    detModule,
    mesModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  filters: {
    formatReplyTime (value) {
      if (!value) return ''
      const index = value.indexOf('.')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    }
  },
  methods: {
    // 获取项目人员
    getCrewOptions () {
      let params = {
        organize_id: this.projectOrgId,
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
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        eventString: this.search.name,
        event_state: this.search.state,
        userN_id: this.search.creCrew,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/findIEventCom',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.eventMain
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
    /* 添加消息 */
    addMesClick (id, uid) {
      this.itemId = id
      this.uId = uid
      this.mesDialog = true
    },
    mesUpdata () {
      this.mesDialog = false
    },
    mesCancel () {
      this.mesDialog = false
    },
    /* 处理 */
    disposeClick (id) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        te_id: id,
        event_state: '1'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/updateEventCom',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '处理成功',
            type: 'success'
          })
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
.event-list{
  height: 100%;
  padding-bottom: 20px;
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
          .date{
            width: 420px;
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
    }
  }
}
</style>
