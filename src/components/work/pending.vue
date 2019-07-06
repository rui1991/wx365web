<template>
  <div class="work-pending">
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column label="工单名称">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.wo_id)">{{ scope.row.wo_name }}</a>
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
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="clickDispatch(scope.row.wo_id)" v-if="authority.dispatch">派单</a>
          <a href="javascript:void(0);" class="operate com" @click="clickOrder(scope.row.wo_id)" v-if="authority.order">接单</a>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      prev-text="上一页"
      next-text="下一页"
      :current-page="nowPage"
      layout="prev, pager, next, total"
      @current-change="pageChang"
      :total="total">
    </el-pagination>
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model="crewfilter" style="width: 40%; margin-bottom: 10px;"></el-input>
      <el-table class="select-table" :data="crewOptions" style="width: 100%" max-height="360">
        <el-table-column label="" width="65">
          <template slot-scope="scope">
            <el-radio v-model="radioCrewId" :label="scope.row.user_id">&nbsp;&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column prop="user_phone" label="联系方式"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="crewDisabled" @click="sendOrders(radioCrewId)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'workPending',
  props: ['parentSearch'],
  data () {
    return {
      authority: {
        dispatch: true,
        order: true
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: '',
      crewDialog: false,
      crewDisabled: true,
      crewOptions: [],
      ocrewOptions: [],
      crewfilter: '',
      radioCrewId: ''
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(51) === -1 ? this.authority.dispatch = false : this.authority.dispatch = true
    autDet.indexOf(52) === -1 ? this.authority.order = false : this.authority.order = true
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.work
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
        // woN_state: 0,
        type: 0,
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    // 查看详情
    checkDetails (id) {
      this.$emit('parentDetails', id)
    },
    // 派单
    clickDispatch (id) {
      this.itemId = id
      this.crewDialog = true
      if (this.crewOptions.length === 0) {
        this.getCrewOptions()
      } else {
        this.crewfilter = ''
        this.radioCrewId = ''
      }
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
          this.ocrewOptions = crewData
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
    // 接单
    clickOrder (id) {
      this.itemId = id
      this.sendOrders(this.userId)
    },
    sendOrders (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        userN_id: id,
        wo_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/sendWO',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          if (this.crewDialog) {
            this.crewDialog = false
            this.$message({
              showClose: true,
              message: '派单成功',
              type: 'success'
            })
          } else {
            this.$message({
              showClose: true,
              message: '接单成功',
              type: 'success'
            })
          }
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
    parentSearch (val, oldVal) {
      this.nowPage = 1
      this.getListData()
    },
    crewfilter (val, oldVal) {
      this.crewOptions = this.ocrewOptions.filter(item => (~item.user_name.indexOf(val)))
    },
    radioCrewId (val, oldVal) {
      if (val) {
        this.crewDisabled = false
      } else {
        this.crewDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.work-pending{
  .paging{
    margin-top: 20px;
  }
}
</style>
