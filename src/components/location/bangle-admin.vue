<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>定位服务</el-breadcrumb-item>
        <el-breadcrumb-item>手环管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>姓名</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
        </div>
        <div class="item date">
          <span>所属部门</span>
          <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择所属部门">
            <el-option
              v-for="item in sectorOptions"
              :key="item.base_id"
              :label="item.name"
              :value="item.base_id">
            </el-option>
          </el-select>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" @click="addDialog = true" v-if="authority.indexOf(185) !== -1">新增</el-button>
          <el-button type="primary" @click="alarmDialog = true" v-if="authority.indexOf(188) !== -1">告警推送人</el-button>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="gps_number" label="手环IMEI"></el-table-column>
        <el-table-column prop="ogz_name" label="所属部门"></el-table-column>
        <el-table-column prop="user_name" label="绑定人员"></el-table-column>
        <el-table-column prop="gps_phone" label="通讯卡"></el-table-column>
        <el-table-column label="电量">
          <template slot-scope="scope">
            <span>{{ scope.row.B }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="sos_phone" label="SOS号码"></el-table-column>
        <el-table-column label="定位频率">
          <template slot-scope="scope">
            <span v-if="scope.row.fqcy">{{ scope.row.fqcy }}秒</span>
            <span v-else>60秒</span>
          </template>
        </el-table-column>
        <el-table-column width="360" label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="operate blue" @click="trackClick(scope.row.gps_number)" v-if="authority.indexOf(189) !== -1">足迹</a>
            <a href="javascript:void(0);" class="operate blue" @click="sosClick(scope.row.uid, scope.row.sos_phone)" v-if="authority.indexOf(186) !== -1">SOS号码</a>
            <a href="javascript:void(0);" class="operate blue" @click="freqClick(scope.row.gps_number, scope.row.fqcy)" v-if="companyId === 1">定位频率</a>
            <a href="javascript:void(0);" class="operate blue" @click="comClick(scope.row)" v-if="authority.indexOf(186) !== -1">编辑</a>
            <a href="javascript:void(0);" class="operate red" @click="delClick(scope.row.bracelet_id)" v-if="authority.indexOf(187) !== -1">删除</a>
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
    <!-- 足迹 -->
    <track-module
      :parentDialog="trackDialog"
      :parentDeviceNum="itemDeviceNum"
      @parentClose="trackClose">
    </track-module>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentSectorOptions="sectorOptions"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑 -->
    <sos-module
      :parentDialog="sosDialog"
      :parentUid="itemUid"
      :parentPhone="itemPhone"
      @parentUpdata="sosUpdata"
      @parentCancel="sosCancel">
    </sos-module>
    <!-- 定位频率 -->
    <freq-module
      :parentDialog="freqDialog"
      :parentGpsType="'bracelet'"
      :parentDeviceNum="itemDeviceNum"
      :parentFreqNum="itemFreqNum"
      @parentUpdata="freqUpdata"
      @parentCancel="freqCancel">
    </freq-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentSectorOptions="sectorOptions"
      :parentId="itemId"
      :parentForm="itemForm"
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
    <!-- 告警推送人 -->
    <alarm-module
      :parentDialog="alarmDialog"
      @parentClose="alarmClose">
    </alarm-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/location/bangle-admin-add'
// 引入足迹组件
import trackModule from '@/components/location/bangle-admin-track'
// 引入SOS组件
import sosModule from '@/components/location/bangle-admin-sos'
// 引入定位频率组件
import freqModule from '@/components/location/gps-admin-freq'
// 引入编辑组件
import comModule from '@/components/location/bangle-admin-com'
// 引入删除组件
import delModule from '@/components/location/bangle-admin-del'
// 引入设置告警人组件
import alarmModule from '@/components/location/bangle-admin-alarm'
export default{
  name: 'bangleAdmin',
  data () {
    return {
      search: {
        name: '',
        sector: '',
        state: ''
      },
      nowSearch: {
        name: '',
        sector: '',
        state: ''
      },
      sectorOptions: [],
      stateOptions: [
        {
          label: '正常',
          value: 1
        },
        {
          label: '网络中断',
          value: 2
        },
        {
          label: '离线',
          value: 3
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: 0,
      itemDeviceNum: '',
      trackDialog: false,
      addDialog: false,
      sosDialog: false,
      itemUid: '',
      itemPhone: '',
      freqDialog: false,
      itemFreqNum: 60,
      comDialog: false,
      delDialog: false,
      itemForm: {
        deviceNum: '',
        sector: '',
        crewId: 0,
        crewName: '',
        mesCard: ''
      },
      alarmDialog: false
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
    // 获取部门
    this.getSectorOptions()
  },
  components: {
    addModule,
    trackModule,
    sosModule,
    freqModule,
    comModule,
    alarmModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.bangleAdmin,
      authority: state => state.detAuthority.bangleAdmin
    }),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
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
        ogz_id: this.search.sector,
        bracelet_type: this.search.type,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsBraceletMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes || []
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
    /* 足迹 */
    trackClick (num) {
      this.itemDeviceNum = num
      this.trackDialog = true
    },
    trackClose () {
      this.trackDialog = false
    },
    /* SOS号码 */
    sosClick (uid, phone = '') {
      this.itemUid = uid
      this.itemPhone = phone
      this.sosDialog = true
    },
    sosUpdata () {
      this.sosDialog = false
      // 更新列表
      this.getListData()
    },
    sosCancel () {
      this.sosDialog = false
    },
    /* 定位频率 */
    freqClick (deviceNum, freqNum) {
      this.itemDeviceNum = deviceNum
      this.itemFreqNum = freqNum
      this.freqDialog = true
    },
    freqUpdata () {
      this.freqDialog = false
      // 更新列表
      this.getListData()
    },
    freqCancel () {
      this.freqDialog = false
    },
    /* 编辑 */
    comClick (data) {
      this.itemId = data.bracelet_id
      this.itemForm = {
        deviceNum: data.gps_number,
        sector: data.ogz_id,
        crewId: data.user_id || '',
        crewName: data.user_name || '',
        mesCard: data.gps_phone || ''
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
    },
    /* 告警 */
    alarmClose () {
      this.alarmDialog = false
      // 更新列表
      this.getListData()
    },
    /* 部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
  filters: {
    filterDeviceState (state) {
      let deviceState = ''
      switch (state) {
        case 1:
          deviceState = '正常'
          break
        case 2:
          deviceState = '网络中断'
          break
        case 3:
          deviceState = '离线'
          break
      }
      return deviceState
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
