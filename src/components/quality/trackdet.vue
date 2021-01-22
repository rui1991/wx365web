<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
        <el-breadcrumb-item>轨迹记录详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>选择人员</span>
            <el-select v-model="nowSearch.crew" style="width: 180px;" filterable clearable placeholder="请选择人员">
              <el-option
                v-for="item in crewOptions"
                :key="item.user_id"
                :label="item.user_name"
                :value="item.user_id">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>位置名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.position"></el-input>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" @click="clickTrack" v-if="authority.indexOf(52) !== -1">人员轨迹</el-button>
            <!--<el-button type="primary" :disabled="downProDisa" @click="downProject">导出</el-button>-->
          </div>
        </div>
        <div class="search-row">
          <div class="item date">
            <span>打卡时段</span>
            <el-date-picker
              style="width: 280px;"
              v-model="nowSearch.date"
              type="daterange"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="user_name" label="姓名" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="position_name" label="位置" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="打卡时间">
          <template slot-scope="scope">
            <span>{{ scope.row.check_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上传时间">
          <template slot-scope="scope">
            <span>{{ scope.row.upload_time | formatDate }}</span>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'trackdet',
  data () {
    return {
      search: {
        crew: '',
        position: '',
        date: []
      },
      nowSearch: {
        crew: '',
        position: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      crewOptions: [],
      logData: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downCrewDisa: false,
      downProDisa: false,
      loading: false
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 获取项目人员
    this.getCrewOptions()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.trackdet,
      authority: state => state.detAuthority.trackdet
    }),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    /* 人员 */
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
          // 获取列表数据
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
    /* 搜索 */
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
        userN_id: this.search.crew,
        position_name: this.search.position,
        startdate: date[0] || '',
        enddate: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/findCheckResultNewWeb',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.excList
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
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
    /* 导出 */
    // 导出个人
    downCrew () {

    },
    // 导出项目
    downProject () {

    },
    /* 轨迹 */
    // 人员轨迹
    /**
     * 53: 黑卡测试
     * 134：御景湖山
     * */
    clickTrack () {
      let params = {
        user_id: this.userId,
        token: sessionStorage.getItem('wxWebToken'),
        project_id: this.projectId,
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      // trackimg 非实时展示           trackreal 实时展示
      if (this.projectId === 53 || this.projectId === 134) {
        const openUrl = this.baseUrl() + '/trackimg/#/home?' + params
        window.open(openUrl)
      } else {
        const openUrl = this.baseUrl() + '/trackreal/#/home?' + params
        window.open(openUrl)
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
