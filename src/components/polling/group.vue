<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
        <el-breadcrumb-item>组管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>组名称</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
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
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" @click="addDialog = true" v-if="authority.indexOf(54) !== -1">新增</el-button>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column width="180" :show-overflow-tooltip="true" prop="group_name" label="组名称"></el-table-column>
        <el-table-column width="140" label="部门">
          <template slot-scope="scope">
            <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column width="200" label="创建时间">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_names" :show-overflow-tooltip="true" label="人员名称"></el-table-column>
        <el-table-column width="160" label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)" v-if="authority.indexOf(55) !== -1">编辑</a>
            <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.group_id)" v-if="authority.indexOf(56) !== -1">删除</a>
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
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentId="itemId"
      :parentForm="comForm"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/polling/group-add'
// 引入编辑组件
import comModule from '@/components/polling/group-com'
// 引入删除组件
import delModule from '@/components/polling/group-del'
export default{
  name: 'group',
  data () {
    return {
      search: {
        name: '',
        date: []
      },
      nowSearch: {
        name: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      comDialog: false,
      comForm: {
        name: '',
        sector: '',
        crewName: '',
        crewId: []
      },
      delDialog: false,
      itemId: ''
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 获取列表数据
    this.getListData()
  },
  mounted () {

  },
  components: {
    addModule,
    comModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.group,
      authority: state => state.detAuthority.group
    }),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
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
        user_name: '',
        group_id: '',
        group_name: this.search.name,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/selDutyGroupAndUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.dataList
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
    /* 编辑 */
    comClick (data) {
      this.itemId = data.group_id
      let sector = data.ogz_id || ''
      let uids = data.user_ids
      let userArr = []
      if (uids) {
        userArr = uids.split(',')
      }
      let crewId = userArr.map((value) => {
        return Number.parseInt(value)
      })
      this.comForm = {
        name: data.group_name,
        sector: sector,
        crewName: data.user_names,
        crewId: crewId
      }
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 更新列表
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 删除 */
    delClick (id) {
      this.itemId = id
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      // 更新列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
