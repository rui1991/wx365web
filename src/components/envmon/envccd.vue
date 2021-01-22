<template>
  <!-- 环境监控传感器 -->
  <div
    class="main-seed"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="main-search main-search-multi">
      <div class="search-row">
        <div class="item">
          <span>设备名称</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
        </div>
        <div class="item">
          <span>设备位置</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.position"></el-input>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" @click="addDialog = true" v-if="authority.indexOf(135) !== -1">新增</el-button>
        </div>
      </div>
      <div class="search-row">
        <div class="item">
          <span>设备状态</span>
          <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择设备状态">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
        <div class="operate">

        </div>
      </div>
    </div>
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column label="设备名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="location_name" label="设备位置" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="node_cn_type" label="设备类型"></el-table-column>
      <!--<el-table-column label="设备类型">-->
        <!--<template slot-scope="scope">-->
          <!--<span v-if="scope.row.type === 45">温湿度</span>-->
          <!--<span v-else-if="scope.row.type === 25">无线水浸</span>-->
          <!--<span v-else-if="scope.row.type === 39">无线烟感</span>-->
          <!--<span v-else-if="scope.row.type === 44">报警设备</span>-->
          <!--<span v-else>其它</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column prop="devEUI" label="DevEui"></el-table-column>
      <el-table-column prop="online" label="状态"></el-table-column>
      <el-table-column label="操作" width="240">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="logClick(scope.row.devEUI, scope.row.name, scope.row.type)" v-if="authority.indexOf(138) !== -1">历史记录</a>
          <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)" v-if="authority.indexOf(136) !== -1">编辑</a>
          <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.devEUI)" v-if="authority.indexOf(137) !== -1">删除</a>
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
      :parentData="itemData"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentData="itemData"
      @parentClose="detClose">
    </det-module>
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
import addModule from '@/components/envmon/envccd-add'
// 引入编辑组件
import comModule from '@/components/envmon/envccd-com'
// 引入详情组件
import detModule from '@/components/envmon/envccd-det'
// 引入删除组件
import delModule from '@/components/envmon/envccd-del'
export default{
  name: 'envccd',
  data () {
    return {
      search: {
        name: '',
        position: '',
        state: '',
        type: ''
      },
      nowSearch: {
        name: '',
        position: '',
        state: '',
        type: ''
      },
      stateOptions: [
        {
          label: '在线',
          value: '在线'
        },
        {
          label: '离线',
          value: '离线'
        }
      ],
      typeOptions: [
        {
          label: '温湿度',
          value: 45
        },
        {
          label: '无线水浸',
          value: 25
        },
        {
          label: '无线压力变送器',
          value: 36
        },
        {
          label: '无线液位变送器',
          value: 37
        },
        {
          label: '无线烟感',
          value: 39
        },
        {
          label: '安全用电',
          value: 41
        },
        {
          label: '报警设备',
          value: 44
        }
      ],
      tableAllData: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      comDialog: false,
      detDialog: false,
      itemData: {
        name: '',
        typeValue: '',
        type: '',
        htempMin: '',
        htempMax: '',
        moisMin: '',
        moisMax: '',
        waterRule: '',
        presMin: '',
        presMax: '',
        liquMin: '',
        liquMax: '',
        etempMin: '',
        etempMax: '',
        voltageMin: '',
        voltageMax: '',
        electMin: '',
        electMax: '',
        posName: '',
        posId: '',
        DevEui: '',
        // beat: '',
        lastTime: '',
        describe: ''
      },
      itemId: '',
      delDialog: false,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 获取列表数据
    this.getListData()
  },
  components: {
    addModule,
    comModule,
    detModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.envccd,
      authority: state => state.detAuthority.envccd
    }),
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
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        search: this.search.name,
        location_name: this.search.position,
        online: this.search.state,
        type: this.search.type
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selNodeList',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const tableAllData = res.data.data1
          this.total = tableAllData.length
          this.tableAllData = tableAllData
          // 表格数据
          const start = this.nowPage * this.limit - this.limit
          const end = this.nowPage * this.limit
          const tableData = tableAllData.slice(start, end)
          this.tableData = tableData
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            const start1 = this.nowPage * this.limit - this.limit
            const end1 = this.nowPage * this.limit
            const tableData1 = tableAllData.slice(start1, end1)
            this.tableData = tableData1
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
      const tableData = this.tableAllData.slice(start, end)
      this.tableData = tableData
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 更新列表数据
      const start = page * this.limit - this.limit
      const end = page * this.limit
      const tableData = this.tableAllData.slice(start, end)
      this.tableData = tableData
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
      this.itemId = data.devEUI
      this.itemData = {
        name: data.name,
        typeValue: data.type,
        type: data.node_cn_type,
        htempMin: data.min_temperature,
        htempMax: data.max_temperature,
        moisMin: data.min_humidity,
        moisMax: data.max_humidity,
        waterRule: data.dry_wet,
        presMin: data.min_pressure,
        presMax: data.max_pressure,
        liquMin: data.min_liquid,
        liquMax: data.max_liquid,
        etempMin: data.min_temp,
        etempMax: data.max_temp,
        voltageMin: data.min_voltage,
        voltageMax: data.max_voltage,
        electMin: data.min_current,
        electMax: data.max_current,
        posName: data.location_name,
        posId: data.location_id,
        DevEui: data.devEUI,
        // beat: data.out_time || '',
        lastTime: data.onlineTime,
        describe: data.description
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
    /* 详情 */
    detClick (data) {
      this.itemData = {
        name: data.name,
        typeValue: data.type,
        type: data.node_cn_type,
        htempMin: data.min_temperature,
        htempMax: data.max_temperature,
        moisMin: data.min_humidity,
        moisMax: data.max_humidity,
        waterRule: data.dry_wet,
        presMin: data.min_pressure,
        presMax: data.max_pressure,
        liquMin: data.min_liquid,
        liquMax: data.max_liquid,
        etempMin: data.min_temp,
        etempMax: data.max_temp,
        voltageMin: data.min_voltage,
        voltageMax: data.max_voltage,
        electMin: data.min_current,
        electMax: data.max_current,
        posName: data.location_name,
        posId: data.location_id,
        DevEui: data.devEUI,
        // beat: data.out_time || '',
        lastTime: data.onlineTime,
        describe: data.description
      }
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
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
    },
    /* 历史记录 */
    logClick (id, name, type) {
      this.$router.push(
        {
          path: '/main/envccd-log',
          query: {
            id: id,
            name: name,
            type: type
          }
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
  .main-seed{
    height: 100%;
    .main-search-multi {
      .search-row{
        display: flex;
        height: 50px;
        align-items: center;
      }
    }
    .main-search{
      .item{
        width: 280px;
        display: flex;
        align-items: center;
        span{
          width: 70px;
          font-size: 14px;
        }
      }
      .date{
        width: 420px;
      }
      .operate{
        display: flex;
        flex-grow: 1;
        justify-content: flex-end;
      }
    }
  }
</style>
