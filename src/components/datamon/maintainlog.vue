<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item>设备维修记录</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-multi">
        <div class="search-row">
          <div class="item">
            <span>项目名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.proName"></el-input>
          </div>
          <div class="item">
            <span>设备类型</span>
            <el-select v-model="nowSearch.type" style="width: 160px;" clearable filterable placeholder="请选择设备类型">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" @click="addDialog = true">录入</el-button>
          </div>
        </div>
        <div class="search-row">
          <div class="item">
            <span>设备ID</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.deviceId"></el-input>
          </div>
          <div class="item">
            <span>处理状态</span>
            <el-select v-model="nowSearch.state" style="width: 160px;" clearable filterable placeholder="请选择处理状态">
              <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="operate">
            <el-button type="primary" :disabled="batchDisabled" @click="batchLogClick">批量记录</el-button>
            <el-button type="primary" :disabled="deriveDisabled" @click="deriveClick">导出</el-button>
          </div>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="设备维修录入">
          <el-table-column prop="project_name" :show-overflow-tooltip="true" label="所属项目"></el-table-column>
          <el-table-column width="200" :show-overflow-tooltip="true" label="设备ID">
            <template slot-scope="scope">
              <span>{{ scope.row.device_mac }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="device_type" :show-overflow-tooltip="true" label="设备类型"></el-table-column>
          <el-table-column prop="back_date" :show-overflow-tooltip="true" label="返回日期"></el-table-column>
          <el-table-column prop="primary_inspect_explain" :show-overflow-tooltip="true" label="初检说明"></el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="是否返厂维修">
            <template slot-scope="scope">
              <span class="red" v-if="scope.row.back_factory === '是'">是</span>
              <span v-else>否</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="设备维修录入">
          <el-table-column prop="back_factory_explain" :show-overflow-tooltip="true" label="维修结果说明"></el-table-column>
          <el-table-column prop="handle_result" :show-overflow-tooltip="true" label="最后处理方式"></el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="处理状态">
            <template slot-scope="scope">
              <span v-if="scope.row.handle_state === '已处理'">已处理</span>
              <span class="red" v-else>处理中</span>
            </template>
          </el-table-column>
          <el-table-column prop="handle_continue_date" :show-overflow-tooltip="true" label="处理完成日期"></el-table-column>
          <el-table-column prop="remarks" :show-overflow-tooltip="true" label="备注"></el-table-column>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="blue" @click="itemLogClick(scope.row.ed_id)" v-if="scope.row.handle_state !== '已处理'">维修记录</a>
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
    <!-- 详情 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 记录 -->
    <log-module
      :parentDialog="logDialog"
      :parentIds="itemIds"
      :parentTypeid="typeid"
      @parentUpdata="logUpdata"
      @parentCancel="logCancel">
    </log-module>
  </div>
</template>

<script>
/*
  * 参数说明：
  * project_name 所属项目
  * device_type 设备类型
  * device_mac 设备MAC
  * back_date 返回日期
  * back_factory 是否返厂
  * primary_inspect_explain 初检说明
  * handle_state 处理状态
  * handle_result 处理结果
  * handle_continue_date 处理完成日期
  * back_factory_explain 返厂维修结果说明
  * remarks 备注
  * 记录传递参数说明
  * typeid   1单个    2批量
  * */
// 引入录入组件
import addModule from '@/components/datamon/maintainlog-add'
// 引入记录组件
import logModule from '@/components/datamon/maintainlog-log'
import {mapState} from 'vuex'
export default{
  name: 'dataswgmon',
  data () {
    return {
      search: {
        proName: '',
        type: '',
        deviceId: '',
        state: ''
      },
      nowSearch: {
        proName: '',
        type: '',
        deviceId: '',
        state: ''
      },
      typeOptions: [
        {
          value: '无感采集卡',
          label: '无感采集卡'
        },
        {
          value: '有感采集卡',
          label: '有感采集卡'
        },
        {
          value: '无感基站',
          label: '无感基站'
        },
        {
          value: '数据网关',
          label: '数据网关'
        },
        {
          value: 'lora卡片',
          label: 'lora卡片'
        },
        {
          value: 'lora网关',
          label: 'lora网关'
        },
        {
          value: '传感器',
          label: '传感器'
        },
        {
          value: '手环',
          label: '手环'
        },
        {
          value: '车载',
          label: '车载'
        },
        {
          value: '其他',
          label: '其他'
        }
      ],
      stateOptions: [
        {
          value: '已处理',
          label: '已处理'
        },
        {
          value: '处理中',
          label: '处理中'
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      logDialog: false,
      itemIds: '',
      typeid: 1,
      multipleSelection: [],
      batchDisabled: true,
      deriveDisabled: false
    }
  },
  created () {

  },
  mounted () {
    if (this.companyId !== 1) {
      this.$router.go(-1)
    }
    // 获取列表数据
    this.getListData()
  },
  components: {
    addModule,
    logModule
  },
  computed: {
    ...mapState('user', [
      'companyId'
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
      let params = {
        project_name: this.search.proName,
        device_type: this.search.type,
        device_mac: this.search.deviceId,
        handle_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.runApi() + '/selErrDeviceRepairList',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    // 获取列表选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    /* 录入 */
    addUpdata () {
      this.addDialog = false
      // 更新列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 维修记录 */
    // 单个
    itemLogClick (id) {
      this.itemIds = id
      this.typeid = 1
      this.logDialog = true
    },
    // 批量
    batchLogClick () {
      let ids = []
      let checkedData = this.multipleSelection
      checkedData.forEach(item => {
        ids.push(item.ed_id)
      })
      this.itemIds = ids.join(',')
      this.typeid = 2
      this.logDialog = true
    },
    logUpdata () {
      this.logDialog = false
      // 更新列表
      this.getListData()
    },
    logCancel () {
      this.logDialog = false
    },
    /* 导出 */
    deriveClick () {
      let params = {
        project_name: this.search.proName,
        device_type: this.search.type,
        device_mac: this.search.deviceId,
        handle_state: this.search.state
      }
      params = this.$qs.stringify(params)
      this.deriveDisabled = true
      setTimeout(() => {
        this.deriveDisabled = false
      }, 5000)
      window.location.href = this.runApi() + '/errDeviceExport?' + params
    },
    /* 详情 */
    detClick (mac) {
      this.itemMac = mac
      this.detDialog = true
    },
    detCancel () {
      this.detDialog = false
    }
  },
  watch: {
    multipleSelection (val, oldVal) {
      if (val.length > 0) {
        this.batchDisabled = false
      } else {
        this.batchDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .hint-text{
    height: 35px;
    line-height: 35px;
  }
</style>
