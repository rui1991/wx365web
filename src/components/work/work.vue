<template>
  <div class="work">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>工单管理</el-breadcrumb-item>
          <el-breadcrumb-item>工单列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>工单名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>工单来源</span>
              <el-select v-model="nowSearch.source" clearable style="width: 160px;" placeholder="请选择工单来源">
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>业务类别</span>
              <el-select v-model="nowSearch.sort" clearable style="width: 160px;" placeholder="请选择业务类别">
                <el-option v-for="item in sortOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addDialog = true">新增</el-button>
            </div>
          </div>
          <div class="search-input">
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
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-tabs v-model="navActive" style="margin-top: 10px;">
          <el-tab-pane label="我的工单" name="5"></el-tab-pane>
          <el-tab-pane label="待处理" name="0"></el-tab-pane>
          <el-tab-pane label="跟进中" name="1"></el-tab-pane>
          <el-tab-pane label="催单列表" name="6"></el-tab-pane>
          <el-tab-pane label="未完成" name="4"></el-tab-pane>
          <el-tab-pane label="超时工单" name="7"></el-tab-pane>
          <el-tab-pane label="结案关闭" name="8"></el-tab-pane>
          <el-tab-pane label="全部" name="9"></el-tab-pane>
        </el-tabs>
        <!-- 工单列表 -->
        <list-module
          :parentSearch="search"
          :parentType="navActive">
        </list-module>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentSort="sortOptions"
      :parentCrew="crewOptions"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入列表组件
import listModule from '@/components/work/work-list'
// 引入新增组件
import addModule from '@/components/work/work-add'
export default{
  name: 'work',
  data () {
    return {
      search: {
        name: '',
        source: '',
        sort: '',
        crews: '0',
        date: []
      },
      nowSearch: {
        name: '',
        source: '',
        sort: '',
        crews: [],
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      sourceOptions: [
        {
          label: '巡检',
          value: '巡检'
        },
        {
          label: '维修报修',
          value: '维修报修'
        },
        {
          label: '第三方',
          value: '第三方'
        }
      ],
      sortOptions: [],
      crewOptions: [],
      navActive: '5',
      addDialog: false,
      detDialog: false,
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取业务类别
    this.getSortOptions()
    // 获取项目人员
    this.getCrewOptions()
  },
  components: {
    listModule,
    addModule
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
  methods: {
    // 获取业务类别
    getSortOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selSkillTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let sortData = res.data.data1
          let sortOptions = []
          sortData.forEach(item => {
            sortOptions.push({
              name: item.name,
              id: item.id
            })
          })
          this.sortOptions = sortOptions
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
      let crews = this.nowSearch.crews
      if (crews.length > 0) {
        crews = crews.join(',')
      } else {
        crews = '0'
      }
      this.search = {
        name: this.nowSearch.name,
        source: this.nowSearch.source,
        sort: this.nowSearch.sort,
        crews: crews,
        date: this.nowSearch.date
      }
    },
    /* 新增 */
    addUpdata () {
      this.addDialog = false
    },
    addCancel () {
      this.addDialog = false
    },
    /* 导出 */
    downFile () {
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        projectN_id: this.projectId,
        woN_name: this.search.name,
        startN_date: date[0] || '',
        endN_date: date[1] || '',
        woN_from: this.search.source,
        businessN_type: this.search.sort,
        userN_id: this.search.crews,
        woN_state: this.navActive,
        type: this.navActive,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/wo/v2.1.02/pc/imp/woeximport?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.work{
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
          .date {
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
    }
  }
}
</style>
