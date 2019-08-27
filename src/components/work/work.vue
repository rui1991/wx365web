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
              <span>创建时段</span>
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
              <el-button type="primary" @click="addDialog = true">新增</el-button>
            </div>
          </div>
          <div class="search-input">
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
              <el-button type="primary" :disabled="downDisabled" @click="downWork">导出</el-button>
            </div>
          </div>
        </div>
        <el-tabs v-model="navActive" style="margin-top: 10px;" @tab-click="tabClick">
          <el-tab-pane label="我的工单" name="5"></el-tab-pane>
          <el-tab-pane label="待处理" name="0"></el-tab-pane>
          <el-tab-pane label="跟进中" name="1"></el-tab-pane>
          <el-tab-pane label="催单列表" name="6"></el-tab-pane>
          <el-tab-pane label="未完成" name="4"></el-tab-pane>
          <el-tab-pane label="超时工单" name="7"></el-tab-pane>
          <el-tab-pane label="结案关闭" name="8"></el-tab-pane>
          <el-tab-pane label="全部" name="9"></el-tab-pane>
        </el-tabs>
        <!--<list-module-->
          <!--:parentSearch="search"-->
          <!--:parentType="navActive"-->
          <!--@parentDetails="checkDetails">-->
        <!--</list-module>-->
        <router-view
          :parentSearch="search"
          :parentType="navActive"
          @parentDetails="checkDetails">
        </router-view>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入列表组件
import listModule from '@/components/work/work-list'
// 引入新增组件
import addModule from '@/components/work/work-add'
// 引入详情组件
import detModule from '@/components/work/work-det'
export default{
  name: 'work',
  data () {
    return {
      search: {
        name: '',
        startDate: '',
        endDate: '',
        source: '',
        sort: '',
        crews: '0'
      },
      nowSearch: {
        name: '',
        startDate: '',
        endDate: '',
        source: '',
        sort: '',
        crews: []
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
      addDialog: false,
      detDialog: false,
      itemId: 0,
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
    // 跳转路由
    this.skipChildRouter()
  },
  components: {
    listModule,
    addModule,
    detModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid
      }
    ),
    navActive: {
      get () {
        return this.$store.state.workNavActive
      },
      set (value) {
        this.$store.commit('setWorkNav', value)
      }
    }
  },
  methods: {
    // 获取业务类别
    getSortOptions () {
      let params = {
        company_id: this.nowClientId,
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
    // 初始化跳转
    skipChildRouter () {
      // const type = this.navActive
      // switch (type) {
      //   case '5':
      //     // 我的工单
      //     this.$router.push({ path: '/main/work/work-my' })
      //     break
      //   case '0':
      //     // 待处理
      //     this.$router.push({ path: '/main/work/work-wait' })
      //     break
      //   case '1':
      //     // 跟进中
      //     this.$router.push({ path: '/main/work/work-follow' })
      //     break
      //   case '6':
      //     // 催单列表
      //     this.$router.push({ path: '/main/work/work-urge' })
      //     break
      //   case '4':
      //     // 未完成
      //     this.$router.push({ path: '/main/work/work-undone' })
      //     break
      //   case '7':
      //     // 超时工单
      //     this.$router.push({ path: '/main/work/work-over' })
      //     break
      //   case '8':
      //     // 结案关闭
      //     this.$router.push({ path: '/main/work/work-close' })
      //     break
      //   case '9':
      //     // 全部
      //     this.$router.push({ path: '/main/work/work-all' })
      //     break
      // }
    },
    // 切换类型
    tabClick (data) {
      // const type = data.name
      // switch (type) {
      //   case '5':
      //     // 我的工单
      //     this.$router.push({ path: '/main/work/work-my' })
      //     break
      //   case '0':
      //     // 待处理
      //     this.$router.push({ path: '/main/work/work-wait' })
      //     break
      //   case '1':
      //     // 跟进中
      //     this.$router.push({ path: '/main/work/work-follow' })
      //     break
      //   case '6':
      //     // 催单列表
      //     this.$router.push({ path: '/main/work/work-urge' })
      //     break
      //   case '4':
      //     // 未完成
      //     this.$router.push({ path: '/main/work/work-undone' })
      //     break
      //   case '7':
      //     // 超时工单
      //     this.$router.push({ path: '/main/work/work-over' })
      //     break
      //   case '8':
      //     // 结案关闭
      //     this.$router.push({ path: '/main/work/work-close' })
      //     break
      //   case '9':
      //     // 全部
      //     this.$router.push({ path: '/main/work/work-all' })
      //     break
      // }
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
        startDate: this.nowSearch.startDate,
        endDate: this.nowSearch.endDate,
        source: this.nowSearch.source,
        sort: this.nowSearch.sort,
        crews: crews
      }
    },
    /* 新增 */
    addUpdata () {
      this.addDialog = false
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    checkDetails (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downWork () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        woN_name: this.search.name,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
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
