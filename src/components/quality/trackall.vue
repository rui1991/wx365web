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
        <el-breadcrumb-item>轨迹记录总览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>区域类型</span>
            <el-select v-model="nowSearch.type" clearable style="width: 160px;" placeholder="请选择区域类型">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>人员名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
          </div>
          <div class="operate"></div>
        </div>
        <div class="search-row">
          <div class="item date">
            <span>选择时段</span>
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
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column prop="at_date" label="日期"></el-table-column>
        <el-table-column prop="start_date" label="区域类型">
          <template slot-scope="scope">{{ scope.row.area_type | filterType }}</template>
        </el-table-column>
        <el-table-column prop="wait_time" label="停留时长（min）"></el-table-column>
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
  name: 'trackall',
  data () {
    return {
      search: {
        type: '',
        crew: '',
        date: []
      },
      nowSearch: {
        type: '',
        crew: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      typeOptions: [
        {
          label: '楼栋',
          value: 0
        },
        {
          label: '单元',
          value: 1
        },
        {
          label: '楼层',
          value: 2
        },
        {
          label: '办公区域',
          value: 3
        },
        {
          label: '商铺',
          value: 4
        },
        {
          label: '卫生间',
          value: 5
        },
        {
          label: '停车场',
          value: 6
        },
        {
          label: '公共区域',
          value: 7
        },
        {
          label: '外围',
          value: 8
        },
        {
          label: '岗亭',
          value: 9
        },
        {
          label: '设备机房',
          value: 10
        }
      ],
      logData: [],
      whetherProject: true,
      sectionIds: 0,
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: false,
      loading: false
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    const nowDate = this.$common.getNowDate()
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 判断组织
    const allProject = this.allProject
    const projectId = Number.parseInt(this.projectId)
    const nowProject = allProject.find(item => {
      return item.project_id === projectId
    })
    if (nowProject.ogzs === undefined) {
      this.whetherProject = true
    } else {
      this.whetherProject = false
      let ids = []
      nowProject.ogzs.forEach(item => {
        ids.push(item.ogz_id)
      })
      ids = ids.join(',')
      this.sectionIds = ids
    }
    // 获取列表
    this.getListData()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.trackall
    }),
    ...mapState('other', [
      'companyId',
      'allProject',
      'projectId'
    ])
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
      let date = this.search.date || []
      let params = {}
      if (this.whetherProject) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          area_type: this.search.type,
          user_name: this.search.crew,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          ogz_ids: this.sectionIds,
          area_type: this.search.type,
          user_name: this.search.crew,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/locationTimeStatistics',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          // 全部数据
          const logData = res.data.data1
          this.logData = logData
          // 总页数
          const total = logData.length
          this.total = total
          // 表格数据
          const tableData = logData.slice(0, this.limit)
          this.tableData = tableData
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
      // 更新列表数据
      const start = this.nowPage * this.limit - this.limit
      const end = this.nowPage * this.limit
      const tableData = this.logData.slice(start, end)
      this.tableData = tableData
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 更新列表数据
      const start = page * this.limit - this.limit
      const end = page * this.limit
      const tableData = this.logData.slice(start, end)
      this.tableData = tableData
    },
    /* 导出 */
    downFile () {
      let date = this.search.date || []
      let params = {}
      if (this.whetherProject) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          area_type: this.search.type,
          user_name: this.search.crew,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          ogz_ids: this.sectionIds,
          area_type: this.search.type,
          user_name: this.search.crew,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/locationTimeStatisticsEo?' + params
    }
  },
  filters: {
    filterType (value) {
      let areaType = ''
      switch (value) {
        case 0:
          areaType = '楼栋'
          break
        case 1:
          areaType = '单元'
          break
        case 2:
          areaType = '楼层'
          break
        case 3:
          areaType = '办公区域'
          break
        case 4:
          areaType = '商铺'
          break
        case 5:
          areaType = '卫生间'
          break
        case 6:
          areaType = '停车场'
          break
        case 7:
          areaType = '公共区域'
          break
        case 8:
          areaType = '外围'
          break
        case 9:
          areaType = '岗亭'
          break
        case 10:
          areaType = '设备机房'
          break
        default:
          areaType = ''
      }
      return areaType
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
