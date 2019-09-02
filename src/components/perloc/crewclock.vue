<template>
  <div
    class="crewclock"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>人员位置管理</el-breadcrumb-item>
          <el-breadcrumb-item>人员打卡报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            style="padding: 5px"
            :data="orgTree"
            ref="orgTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            @check-change="orgCheckChange"
            @node-click="orgNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
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
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item" v-show="orgType === 3">
                <span>员工姓名</span>
                <el-input style="width: 160px;" v-model="nowSearch.name"></el-input>
              </div>
              <div class="operate"></div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData1" border :summary-method="getSummaries1" show-summary style="width: 100%" v-show="orgType !== 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column width="200" :show-overflow-tooltip="true" prop="organize_name" label="组织机构"></el-table-column>
            <el-table-column prop="all_po_size" label="地址总数"></el-table-column>
            <el-table-column prop="all_set_user" label="打卡人数"></el-table-column>
            <el-table-column label="打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.position_size < scope.row.po_size">{{ scope.row.position_size }}</span>
                <span v-else>{{ scope.row.position_size }}</span>
              </template>
            </el-table-column>
            <el-table-column label="未打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.notRecordSize > 0">{{ scope.row.notRecordSize  }}</span>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="打卡率">
              <template slot-scope="scope">
                <span>{{ scope.row.recordRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
            <el-table-column label="点位平均停留时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avwaittime | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="点位之间间隔时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avrecord | formatNum }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-table class="list-table" :data="tableData2" border :summary-method="getSummaries2" show-summary style="width: 100%" v-show="orgType === 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="user_name" label="姓名"></el-table-column>
            <el-table-column width="200" :show-overflow-tooltip="true" prop="positions" label="点名地址"></el-table-column>
            <el-table-column width="180" :show-overflow-tooltip="true" label="胸牌编号">
              <template slot-scope="scope">
                <span v-if="scope.row.card_mac">{{ scope.row.card_mac }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="po_size" label="负责点位数"></el-table-column>
            <el-table-column label="打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.position_size < scope.row.po_size">{{ scope.row.position_size }}</span>
                <span v-else>{{ scope.row.position_size }}</span>
              </template>
            </el-table-column>
            <el-table-column label="未打卡点位数">
              <template slot-scope="scope">
                <a href="javascript:;" class="red" v-if="scope.row.notRecordSize > 0" @click="detClick(scope.row.user_id, scope.row.positions)">{{ scope.row.notRecordSize  }}</a>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="打卡率">
              <template slot-scope="scope">
                <span>{{ scope.row.recordRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
            <el-table-column label="点位平均停留时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avwaittime | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="点位之间间隔时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avrecord | formatNum }}</span>
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
    </el-container>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="proId"
      :parentUid="detUid"
      :parentState="detState"
      :parentStart="search.startDate"
      :parentEnd="search.endDate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/perloc/crewclock-det'
export default{
  name: 'crewclock',
  data () {
    return {
      search: {
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate(),
        name: ''
      },
      nowSearch: {
        startDate: this.$common.getBeforeDate(),
        endDate: this.$common.getBeforeDate(),
        name: ''
      },
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      orgId: 0,
      orgType: 0,
      proId: 0,
      tableData1: [],
      tableData2: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detUid: 0,
      detState: 1,
      downDisabled: false,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    // 获取组织树
    this.getOrganTree()
  },
  components: {
    detModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId
      }
    )
  },
  filters: {
    countRate (want, already) {
      if (!want) return '0%'
      if (!already) return '0%'
      let rate = already / want
      return Math.round(rate * 100) + '%'
    }
  },
  methods: {
    // 获取机构树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let orgData = res.data.data1
          // 处理部门树
          orgData = this.initDisSecTree(orgData)
          this.orgTree = orgData
          if (this.orgId) {
            this.$refs.orgTree.setCheckedKeys([this.orgId])
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
    // 初始化处理部门
    initDisSecTree (treeData) {
      treeData.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
      return treeData
    },
    initRecSecTree (data) {
      data.forEach((item, index, array) => {
        if (item.children) {
          this.initRecSecTree(item.children)
        } else if (item.organize_type === 4) {
          item.disabled = true
        }
      })
    },
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) return
        const type = data.organize_type
        this.orgId = data.id
        this.orgType = type
        this.$refs.orgTree.setCheckedKeys([data.id])
        // 清空搜索框
        this.search.name = ''
        this.nowSearch.name = ''
        // 当前页码初始化
        this.nowPage = 1
        if (type === 3) {
          this.proId = data.base_id
          // 获取列表数据
          this.getListDetData()
        } else {
          this.proId = 0
          // 获取列表数据
          this.getListAllData()
        }
      } else {
        if (this.orgId === data.id) {
          this.$refs.orgTree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (data.disabled) return
      if (node.checked) return
      const type = data.organize_type
      this.orgId = data.id
      this.orgType = type
      this.$refs.orgTree.setCheckedKeys([data.id])
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      if (type === 3) {
        this.proId = data.base_id
        // 获取列表数据
        this.getListDetData()
      } else {
        this.proId = 0
        // 获取列表数据
        this.getListAllData()
      }
    },
    // 搜索
    searchList () {
      const startDate = this.nowSearch.startDate
      const endDate = this.nowSearch.endDate
      const fate = this.getDateDiff(startDate, endDate)
      if (fate) {
        this.$message({
          showClose: true,
          message: '查询时长不能超过31天',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 获取列表数据
    getListAllData () {
      let params = {
        user_id: this.userId,
        ogz_id: this.orgId,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReport823',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData1 = res.data.data1.message
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
    getListDetData () {
      let params = {
        user_id: this.userId,
        project_id: this.proId,
        user_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReport',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData2 = res.data.data1.reports
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
    getSummaries1 (param) {
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
        if (index === 4) {
          const values = data.map(item => Number(item.position_size))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
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
          return
        }
        if (index === 5) {
          const values = data.map(item => Number(item.notRecordSize))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
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
          return
        }
        if (index === 6) {
          const values = data.map(item => Number(item.recordRate))
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
        if (index === 8) {
          const values = data.map(item => Number(item.avwaittime))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 9) {
          const values = data.map(item => Number(item.avrecord))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
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
    getSummaries2 (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1 || index === 2 || index === 3) {
          sums[index] = '-'
          return
        }
        if (index === 5) {
          const values = data.map(item => Number(item.position_size))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
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
          return
        }
        if (index === 6) {
          const values = data.map(item => Number(item.notRecordSize))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
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
          return
        }
        if (index === 7) {
          const values = data.map(item => Number(item.recordRate))
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
        if (index === 9) {
          const values = data.map(item => Number(item.avwaittime))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 10) {
          const values = data.map(item => Number(item.avrecord))
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
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
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
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 获取跨越天数
    getDateDiff (startDate, endDate) {
      let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime()
      let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime()
      const seaDuration = endTime - startTime
      const maxDuration = 1000 * 60 * 60 * 24 * 31
      if (seaDuration > maxDuration) {
        return true
      } else {
        return false
      }
    },
    /* 详情 */
    detClick (uid, positions) {
      this.detUid = uid
      let detState = 1
      if (positions === '全部') {
        detState = 0
      }
      this.detState = detState
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downFile () {
      if (this.orgType === 3) {
        let params = {
          user_id: this.userId,
          project_id: this.proId,
          user_name: this.search.name,
          start_date: this.search.startDate,
          end_date: this.search.endDate
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selRollCallReportEO?' + params
      } else {
        let params = {
          user_id: this.userId,
          ogz_id: this.orgId,
          start_date: this.search.startDate,
          end_date: this.search.endDate
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selRollCallReport823EO?' + params
      }
    }
  }
}
</script>

<style lang="less" scoped>
.crewclock{
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
    .module-content{
      height: 100%;
      padding-top: 10px;
      padding-right: 0;
      padding-bottom: 10px;
      padding-left: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        height: 100%;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid #cccccc;
      }
      .module-main{
        padding-top: 0;
        padding-right: 10px;
        padding-bottom: 0;
        padding-left: 20px;
        overflow: scroll;
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
}
</style>
