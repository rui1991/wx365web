<template>
  <div
    class="module-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>报表管理</el-breadcrumb-item>
        <el-breadcrumb-item>项目工单报表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <!-- 组织树 -->
        <org-module
          @parentUpOrg="updateOrgan">
        </org-module>
      </div>
      <div class="module-main">
        <div class="main-search">
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
        <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
          <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
          <el-table-column fixed prop="organize_name" label="机构名称" width="160"></el-table-column>
          <el-table-column prop="woSize" label="工单总数" width="110"></el-table-column>
          <el-table-column prop="insSize" label="巡检工单" width="110"></el-table-column>
          <el-table-column prop="repairSize" label="维修工单" width="110"></el-table-column>
          <el-table-column prop="continueSize" label="已结单" width="100"></el-table-column>
          <el-table-column prop="notContinueSize" label="未结单" width="100"></el-table-column>
          <el-table-column prop="outtimeSize" label="超时工单" width="110"></el-table-column>
          <el-table-column label="完成率" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.continueRate | formatPercent }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="continueOntimeSize" label="完成及时数" width="118"></el-table-column>
          <el-table-column prop="ingOuttimeSize" label="处理超时数" width="120"></el-table-column>
          <el-table-column label="完成及时率" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.continueOntimeRate | formatPercent }}</span>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入组织树组件
import orgModule from '@/components/public/report-org2'
export default{
  name: 'reportWorkpro',
  data () {
    return {
      search: {
        date: []
      },
      nowSearch: {
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      organizeId: 0,
      organizeType: 0,
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: true,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    // 时段
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
  },
  components: {
    orgModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 更新组织
    updateOrgan (data) {
      // 可导出
      this.downDisabled = false
      // 保存参数
      this.organizeId = data.id
      this.organizeType = data.type
      // 更新列表
      this.updateList()
    },
    // 更新列表
    updateList () {
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 判断是否选择组织
      if (!this.organizeId) return
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      if (!this.organizeId) return
      const date = this.search.date
      let params = {
        organize_id: this.organizeId,
        seltype: this.organizeType,
        start_date: date[0],
        end_date: date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/v3.4/selProWo',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          // 表格
          this.tableData = res.data.data1.message
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
    // 合计表格规则设置
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1) {
          sums[index] = '-'
          return
        }
        if (index === 8) {
          const values = data.map(item => Number(item.continueRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 11) {
          const values = data.map(item => Number(item.continueOntimeRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 12) {
          const values = data.map(item => Number(item.avEvaluateSize))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average)
            sums[index] = average
          } else {
            sums[index] = ''
          }
          return
        }
        const vals = data.map(item => Number(item[column.property]))
        if (!vals.every(value => isNaN(value))) {
          sums[index] = vals.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          })
        } else {
          sums[index] = ''
        }
      })
      return sums
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
    /* 导出文件 */
    downFile () {
      const date = this.search.date
      let params = {
        organize_id: this.organizeId,
        seltype: this.organizeType,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selProWoEO?' + params
    }
  },
  filters: {
    filterTimelyRate (son, mother) {
      if (!son) { return '0%' }
      if (!mother) { return '0%' }
      let consult = Number.parseFloat(son) / Number.parseFloat(mother)
      return Math.round(consult * 100) + '%'
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-row.css';
</style>
