<template>
  <div class="work-item">
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column label="工单名称">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="name" @click="detClick(scope.row.wo_id)">{{ scope.row.wo_name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="wo_from" label="工单来源"></el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="创建人"></el-table-column>
      <el-table-column label="派单时间">
        <template slot-scope="scope">
          <span>{{ scope.row.dispatch_time | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工单状态">
        <template slot-scope="scope">
          <span v-if="scope.row.wo_state === 0">待处理</span>
          <span v-else-if="scope.row.wo_state === 1">跟进中</span>
          <span v-else-if="scope.row.wo_state === 2">结单</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="addLogClick(scope.row.wo_id)">追加日志</a>
          <a href="javascript:void(0);" class="operate com" @click="closeClick(scope.row.wo_id)" v-if="scope.row.wo_state === 1">结单</a>
          <span class="operate forbid" v-else-if="scope.row.wo_state === 2">已结单</span>
          <a href="javascript:void(0);" class="operate com" @click="returnClick(scope.row.wo_id)" v-if="scope.row.wo_state === 1">退单</a>
          <span class="operate forbid" v-else-if="scope.row.wo_state === 2">退单</span>
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
    <!-- 追加日志 -->
    <log-module
      :parentDialog="logDialog"
      :parentId="itemId"
      @parentUpdata="logUpdata"
      @parentCancel="logCancel">
    </log-module>
    <!-- 退单 -->
    <return-module
      :parentDialog="returnDialog"
      :parentId="itemId"
      @parentUpdata="returnUpdata"
      @parentCancel="returnCancel">
    </return-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 追加日志
import logModule from '@/components/work/work-log'
// 退单
import returnModule from '@/components/work/work-return'
export default{
  name: 'workMy',
  props: ['parentSearch'],
  data () {
    return {
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      logDialog: false,
      returnDialog: false,
      itemId: ''
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
  },
  components: {
    logModule,
    returnModule
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        woN_name: this.parentSearch.name,
        startN_date: this.parentSearch.startDate,
        endN_date: this.parentSearch.endDate,
        woN_from: this.parentSearch.source,
        businessN_type: this.parentSearch.sort,
        userN_id: this.parentSearch.crews,
        // woN_state: 5,
        type: 5,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/v2.1.02/all/sel/selWoSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.woos
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
    // 查看详情
    detClick (id) {
      this.$emit('parentDetails', id)
    },
    /* 追加日志 */
    addLogClick (id) {
      this.itemId = id
      this.logDialog = true
    },
    logUpdata () {
      this.logDialog = false
    },
    logCancel () {
      this.logDialog = false
    },
    /* 退单 */
    returnClick (id) {
      this.itemId = id
      this.returnDialog = true
    },
    returnUpdata () {
      this.returnDialog = false
      // 刷新列表
      this.getListData()
    },
    returnCancel () {
      this.returnDialog = false
    },
    /* 结单 */
    closeClick (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        wo_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/updateWoClose',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '结单成功',
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
  },
  watch: {
    parentSearch (newVal, oldVal) {
      this.nowPage = 1
      this.getListData()
    }
  }
}
</script>

<style lang="less" scoped>
.work-item{
  .paging{
    margin-top: 20px;
  }
}
</style>
