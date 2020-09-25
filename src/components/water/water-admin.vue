<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>水表数据管理</el-breadcrumb-item>
        <el-breadcrumb-item>抄表设备管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>用户名称</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
        </div>
        <div class="item date">
          <span>设备号</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.deviceNum"></el-input>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" @click="addDialog = true">获取设备</el-button>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="user_name" label="用户名称"></el-table-column>
        <el-table-column prop="wm_number" label="水表设备号"></el-table-column>
        <el-table-column prop="install_address" label="安装位置"></el-table-column>
        <el-table-column label="倍数">
          <template slot-scope="scope">
            <span v-if="scope.row.multiple">{{ scope.row.multiple }}</span>
            <span v-else>1</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_date" label="初始化日期"></el-table-column>
        <el-table-column width="360" label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="operate blue" @click="monthClick(scope.row)">月用水量</a>
            <a href="javascript:void(0);" class="operate blue" @click="logClick(scope.row)">历史抄表</a>
            <a href="javascript:void(0);" class="operate blue" @click="rateClick(scope.row.wm_number)">设置倍数</a>
            <a href="javascript:void(0);" class="operate red" @click="delClick(scope.row.wm_number)">移除</a>
          </template>
        </el-table-column>
      </el-table>
<!--      <el-pagination-->
<!--        background-->
<!--        prev-text="上一页"-->
<!--        next-text="下一页"-->
<!--        :current-page="nowPage"-->
<!--        layout="sizes, prev, pager, next, total"-->
<!--        :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"-->
<!--        :page-size="limit"-->
<!--        @size-change="handleSizeChange"-->
<!--        @current-change="pageChang"-->
<!--        :total="total">-->
<!--      </el-pagination>-->
    </div>
    <!-- 月用水量 -->
    <month-module
      :parentDialog="monthDialog"
      :parentName="itemName"
      :parentRate="itemRate"
      :parentCode="itemCode"
      @parentClose="monthClose">
    </month-module>
    <!-- 历史抄表 -->
    <log-module
      :parentDialog="logDialog"
      :parentName="itemName"
      :parentCode="itemCode"
      @parentClose="logClose">
    </log-module>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 设置倍数 -->
    <rate-module
      :parentDialog="rateDialog"
      :parentDeviceNum="itemDeviceNum"
      @parentUpdata="rateUpdata"
      @parentCancel="rateCancel">
    </rate-module>
    <!-- 移除 -->
    <del-module
      :parentDialog="delDialog"
      :parentDeviceNum="itemDeviceNum"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入月用水量组件
import monthModule from '@/components/water/water-admin-month'
// 引入历史抄表组件
import logModule from '@/components/water/water-admin-log'
// 引入新增组件
import addModule from '@/components/water/water-admin-add'
// 引入设置倍数组件
import rateModule from '@/components/water/water-admin-rate'
// 引入移除组件
import delModule from '@/components/water/water-admin-del'
export default{
  name: 'waterAdmin',
  data () {
    return {
      search: {
        name: '',
        deviceNum: ''
      },
      nowSearch: {
        name: '',
        deviceNum: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemName: '',
      itemDeviceNum: '',
      itemRate: '',
      itemCode: '',
      monthDialog: false,
      logDialog: false,
      addDialog: false,
      rateDialog: false,
      delDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
  },
  components: {
    monthModule,
    logModule,
    addModule,
    rateModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
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
      let params = {
        project_id: this.projectId,
        user_name: this.search.name,
        wm_number: this.search.deviceNum,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selWaterMeter',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // this.total = res.data.data1.total
          this.tableData = res.data.data1 || []
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
    /* 月用水量 */
    monthClick (data) {
      this.itemName = data.user_name
      this.itemRate = data.multiple || 1
      this.itemDeviceNum = data.wm_number
      this.itemCode = data.user_code
      this.monthDialog = true
    },
    monthClose () {
      this.monthDialog = false
    },
    /* 历史抄表 */
    logClick (data) {
      this.itemName = data.user_name
      this.itemRate = data.multiple || 1
      this.itemDeviceNum = data.wm_number
      this.itemCode = data.user_code
      this.logDialog = true
    },
    logClose () {
      this.logDialog = false
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
    /* 设置倍数 */
    rateClick (num) {
      this.itemDeviceNum = num
      this.rateDialog = true
    },
    rateUpdata () {
      this.rateDialog = false
      // 更新列表
      this.getListData()
    },
    rateCancel () {
      this.rateDialog = false
    },
    /* 删除 */
    delClick (num) {
      this.itemDeviceNum = num
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
  },
  filters: {

  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
