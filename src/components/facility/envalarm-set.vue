<template>
  <div class="envalarm">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/envalarm">告警记录</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>告警设置</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <p class="hint">*当设备发生告警时，将推送消息到设置的相关人员！</p>
          <el-button type="primary" @click="addDialog = true">新增</el-button>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="alarm_node" :show-overflow-tooltip="true" label="告警设备"></el-table-column>
          <!--<el-table-column prop="alarm_condition" :show-overflow-tooltip="true" label="告警条件"></el-table-column>-->
          <!--<el-table-column prop="alarm_condition" :show-overflow-tooltip="true" label="告警条件">-->
            <!--<template slot-scope="scope">-->
              <!--<span v-if="scope.row.alarm_condition">{{ scope.row.alarm_condition }}</span>-->
              <!--<span v-else>-</span>-->
            <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column prop="push_user" :show-overflow-tooltip="true" label="推送人"></el-table-column>
          <el-table-column width="160" label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.las_id)">删除</a>
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
      :parentFormData="itemData"
      :parentCcdParam="itemParam"
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
import addModule from '@/components/facility/envalarm-add'
// 引入编辑组件
import comModule from '@/components/facility/envalarm-com'
// 引入删除组件
import delModule from '@/components/facility/envalarm-del'
export default{
  name: 'envalarmSet',
  data () {
    return {
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      comDialog: false,
      itemData: {
        ccdName: '',
        ccdId: [],
        crewName: '',
        crewId: []
      },
      itemParam: {
        humiState: 1,
        tempMax: '',
        tempMin: '',
        moisMax: '',
        moisMin: '',
        waterState: 1,
        waterValue: ''
      },
      itemId: 0,
      delDialog: false
    }
  },
  created () {
    // 获取列表
    this.getListData()
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
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selAlarm',
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
    /* 新增 */
    addCancel () {
      this.addDialog = false
    },
    addUpdata () {
      this.addDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 编辑 */
    comClick (data) {
      this.itemId = data.las_id
      // 设备ID
      let ccdId = data.alarm_node_id
      ccdId = ccdId.split(',')
      // 告警人ID
      let crewId = data.push_user_id
      crewId = crewId.split(',')
      crewId = crewId.map(item => {
        return Number.parseInt(item)
      })
      this.itemData = {
        ccdName: data.alarm_node,
        ccdId: ccdId,
        crewName: data.push_user,
        crewId: crewId
      }
      // 温湿度
      let humiState = 1
      const tempMax = data.max_temperature
      const tempMin = data.min_temperature
      const moisMax = data.max_humidity
      const moisMin = data.min_humidity
      if (tempMax || tempMin || moisMax || moisMin) {
        humiState = 0
      }
      // 水浸
      let waterState = 1
      const waterValue = data.dry_wet
      if (waterValue) {
        waterState = 0
      }
      this.itemParam = {
        humiState: humiState,
        tempMax: tempMax,
        tempMin: tempMin,
        moisMax: moisMax,
        moisMin: moisMin,
        waterState: waterState,
        waterValue: waterValue
      }
      this.comDialog = true
    },
    comCancel () {
      this.comDialog = false
    },
    comUpdata () {
      this.comDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 删除 */
    delClick (id) {
      this.itemId = id
      this.delDialog = true
    },
    delCancel () {
      this.delDialog = false
    },
    delUpdata () {
      this.delDialog = false
      // 获取列表数据
      this.getListData()
    }
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
        height: 60px;
        display: flex;
        align-items: center;
        .hint{
          flex-grow: 1;
          color: red;
        }
      }
    }
  }
}
</style>
