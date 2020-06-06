<template>
  <div class="scheduling">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业配置</el-breadcrumb-item>
          <el-breadcrumb-item>排班管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="180px" class="module-aside">
          <p class="title"><i class="iconfont icon-renyuanliebiao"></i>人员列表</p>
          <el-menu class="el-menu-vertical-demo" :default-active="userActive" @select="selectUser">
            <el-menu-item :index="String(item.user_id)" v-for="item in crewList" :key="item.user_id"><span slot="title">{{ item.user_name }}</span></el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <p class="title"><i class="iconfont icon-rili"></i>排班日历</p>
            <div class="date">
              <el-date-picker
                v-model="showDate"
                type="month"
                value-format="yyyy-MM"
                :clearable="false"
                placeholder="选择月">
              </el-date-picker>
            </div>
            <div class="tabs">
              <el-radio-group v-model="tabActive">
                <el-radio-button :label="item.work_id" v-for="item in tabList" :key="item.work_id">{{ item.work_name }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="operate">
              <el-button type="primary" @click="upClick">导入排班</el-button>
            </div>
          </div>
          <all-module
            :parentTime="showDate"
            v-if="type === 1">
          </all-module>
          <shift-module
            :parentTime="showDate"
            :parentTabActive="tabActive"
            v-else-if="type === 2">
          </shift-module>
          <rest-module
            :parentTime="showDate"
            v-else-if="type === 3">
          </rest-module>
          <crew-module
            :parentTime="showDate"
            :parentUserActive="userActive"
            v-else-if="type === 4">
          </crew-module>
        </el-main>
      </el-container>
    </el-container>
    <!-- 导入 -->
    <el-dialog title="导入排班" :visible.sync="upDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div style="margin-bottom: 20px;">
        <span>选择月份</span>
        <el-date-picker
          style="margin-left: 30px;"
          v-model="upDate"
          type="month"
          placeholder="选择月"
          value-format="yyyy-MM"
          :clearable="false"
          :picker-options="pickerOptions"
          @change="upDateChange">
        </el-date-picker>
      </div>
      <div class="up-file">
        <span class="txt">导入文件</span>
        <el-upload
          class="upload-demo"
          :action="reqUrl"
          :headers="reqHead"
          :on-success="upFileSuccess"
          :on-error="upFileError"
          :multiple="false"
          :file-list="fileList">
          <el-button size="small" type="primary">点击导入</el-button>
        </el-upload>
        <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑排班信息</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="upDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入排班概况
import allModule from '@/components/company/schedul-all'
// 引入班次排班
import shiftModule from '@/components/company/schedul-shift'
// 引入休息概况
import restModule from '@/components/company/schedul-rest'
// 引入人员排班
import crewModule from '@/components/company/schedul-crew'
export default{
  name: 'scheduling',
  data () {
    return {
      showDate: '',
      type: 1,
      tabList: [],
      tabActive: 0,
      crewList: [],
      userActive: '',
      downDisabled: false,
      upDialog: false,
      upDate: '',
      reqUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      fileList: [],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  created () {
    // 设置上传参数
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
    }
  },
  mounted () {
    // 获取当前月份
    const mydata = this.$common.getNowDate('yyyy-mm')
    this.showDate = mydata
    this.upDate = mydata
    let params = {
      state: 14,
      company_id: this.companyId,
      user_id: this.userId,
      project_id: this.projectId,
      month_day: this.upDate
    }
    params = this.$qs.stringify(params)
    const reqUrl = this.sysetApi() + '/upload?' + params
    this.reqUrl = reqUrl
    // 获取班次列表
    this.getShiftList()
    // 获取人员列表
    this.getCrewList()
  },
  components: {
    allModule,
    shiftModule,
    restModule,
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectName',
      'projectOrgId'
    ])
  },
  methods: {
    /* 选择年月 */
    // 上一月
    lastMonthClick () {
      const nowYear = this.time.nowYear
      const nowMonth = this.time.nowMonth
      if (nowMonth === 1) {
        this.time.nowYear = nowYear - 1
        this.time.nowMonth = 12
      } else {
        this.time.nowMonth = nowMonth - 1
      }
    },
    // 下个月
    nextMonthClick () {
      const nowYear = this.time.nowYear
      const nowMonth = this.time.nowMonth
      if (nowMonth === 12) {
        this.time.nowYear = nowYear + 1
        this.time.nowMonth = 1
      } else {
        this.time.nowMonth = nowMonth + 1
      }
    },
    /* 班次 */
    // 获取班次列表
    getShiftList () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/findScheduling',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let shift = res.data.data1
          shift.push(
            {
              work_id: -1,
              work_name: '休息'
            },
            {
              work_id: 0,
              work_name: '全部'
            }
          )
          this.tabList = shift
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
    /* 人员 */
    // 获取人员列表
    getCrewList () {
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
          this.crewList = crewData
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
    selectUser (id) {
      this.userActive = id
      // 设置操作类型
      this.tabActive = -2
    },
    /* 导入 */
    upClick () {
      this.upDialog = true
      // 清空导入文件提示
      this.fileList = []
    },
    upDateChange () {
      const upDate = this.upDate
      let params = {
        state: 14,
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        month_day: upDate
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.sysetApi() + '/upload?' + params
      this.reqUrl = reqUrl
    },
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 关闭导入框
        this.upDialog = false
        // 清空导入文件提示
        this.fileList = []
        // 刷新树
        this.getSiteTree()
        // 刷新列表
        this.getListData()
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范！',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件导入失败！',
          type: 'error'
        })
      }
    },
    upFileError () {
      this.$message({
        showClose: true,
        message: '文件导入失败！',
        type: 'error'
      })
    },
    /* 导出 */
    downTemplate () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        project_name: this.projectName
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/attendance/workDemoEO?' + params
    }
  },
  watch: {
    tabActive (newVal, oldVal) {
      // 获取操作类型  1全部 2班次 3休息 4人员
      if (newVal === 0) {
        this.type = 1
        this.userActive = ''
      } else if (newVal === -1) {
        this.type = 3
        this.userActive = ''
      } else if (newVal === -2) {
        this.type = 4
      } else {
        this.type = 2
        this.userActive = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.scheduling{
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
    .module-content{
      height: 100%;
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        .title{
          height: 45px;
          padding-left: 10px;
          line-height: 45px;
          font-size: 14px;
          color: #142c4b;
          background: #77a3cf;;
        }
        .el-menu{
          border-right: none;
          .el-menu-item{
            height: 35px;
            line-height: 35px;
            padding: 0 10px;
            background: #f1f1f1;
            color: #999999;
            border-top: 1px solid #d1d1d1;
            &.is-active{
              background: #bed5ec;
              color: #142c4b;
            }
          }
        }
      }
      .module-main{
        padding-left: 20px;
        padding-top: 0;
        padding-right: 0;
        padding-bottom: 0;
        .search{
          display: table;
          width: 100%;
          height: 60px;
          .title{
            display: table-cell;
            vertical-align:middle;
            width: 100px;
            font-size: 14px;
            color: #142c4b;
            i{
              margin-right: 3px;
            }
          }
          .date{
            display: table-cell;
            vertical-align:middle;
            width: 220px;
            padding-right: 20px;
          }
          .tabs{
            display: table-cell;
            vertical-align:middle;
          }
          .operate{
            display: table-cell;
            vertical-align:middle;
            width: 150px;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
