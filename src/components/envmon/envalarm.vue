<template>
  <div class="envalarm">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>环境监控管理</el-breadcrumb-item>
          <el-breadcrumb-item>告警记录</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>设备名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>设备类型</span>
              <el-select v-model="nowSearch.type" clearable style="width: 160px;" placeholder="请选择设备类型">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="item">
              <span>设备位置</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.position"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="setClick">设置</el-button>
            </div>
          </div>
          <div class="search-input">
            <div class="item date">
              <span>告警时段</span>
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
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="告警时间" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{ scope.row.alarm_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="location_name" label="设备位置"></el-table-column>
          <el-table-column label="设备名称" width="180" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.lam_id)">{{ scope.row.node_name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="node_type" label="设备类型"></el-table-column>
          <el-table-column prop="dev_eui" label="DevEui"></el-table-column>
          <el-table-column prop="push_user" :show-overflow-tooltip="true" label="告警推送人"></el-table-column>
          <el-table-column prop="alarm_message" :show-overflow-tooltip="true" label="告警内容"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="addLogClick(scope.row.lam_id)" v-if="scope.row.push_user.split('、').indexOf(userName) !== -1">追加日志</a>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 追加日志 -->
    <log-module
      :parentDialog="logDialog"
      :parentId="itemId"
      @parentUpdata="logUpdata"
      @parentCancel="logCancel">
    </log-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/envmon/envalarm-det'
// 引入追加日志组件
import logModule from '@/components/envmon/envalarm-log'
export default{
  name: 'envalarm',
  data () {
    return {
      search: {
        name: '',
        type: '',
        position: '',
        date: []
      },
      nowSearch: {
        name: '',
        type: '',
        position: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      typeOptions: [
        {
          label: '温湿度',
          value: '温湿度'
        },
        {
          label: '无线水浸',
          value: '无线水浸'
        },
        {
          label: '无线压力变送器',
          value: '无线压力变送器'
        },
        {
          label: '无线液位变送器',
          value: '无线液位变送器'
        },
        {
          label: '无线烟感',
          value: '无线烟感'
        },
        {
          label: '一键报警',
          value: '一键报警'
        },
        {
          label: '红外报警',
          value: '红外报警'
        },
        {
          label: '燃气报警',
          value: '燃气报警'
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: 0,
      detDialog: false,
      logDialog: false,
      downDisabled: false
    }
  },
  created () {
    // 获取当天日期
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 获取列表
    this.getListData()
  },
  components: {
    detModule,
    logModule
  },
  computed: {
    ...mapState('user', [
      'userId',
      'userName'
    ]),
    ...mapState('other', [
      'companyId',
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
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        node_name: this.search.name,
        node_type: this.search.type,
        location_name: this.search.position,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selAlarmMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.messages
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
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
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

    /* 导出 */
    downFile () {
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        node_name: this.search.name,
        node_type: this.search.type,
        location_name: this.search.position
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.loraApi() + '/lora/selAlarmMessageEO?' + params
    },
    /* 设置 */
    setClick () {
      this.$router.push({ path: '/main/envalarm-set' })
    }
  },
  filters: {

  }
}
</script>

<style lang="less" scoped>
.envalarm{
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
        padding: 5px 0;
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
          .date{
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
}
</style>
