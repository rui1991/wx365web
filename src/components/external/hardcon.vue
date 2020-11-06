<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>硬件对接</el-breadcrumb-item>
        <el-breadcrumb-item>硬件管控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <div class="aside-header">
          <div class="operate">
            <a href="javascript:;" style="margin-right: 5px;" class="blue" v-show="!downDisabled" @click="corgDialog = true">编辑组织</a>
            <a href="javascript:;" class="blue" @click="aorgDialog = true">新建组织</a>
          </div>
        </div>
        <el-tree
          class="aside-tree"
          :data="orgData"
          ref="tree"
          show-checkbox
          default-expand-all
          check-strictly
          node-key="id"
          @check-change="orgCheckChange"
          @node-click="orgNodeClick"
          :props="defaultProps">
        </el-tree>
      </div>
      <div class="module-main">
        <div class="main-search main-search-single">
          <div class="item">
            <span>设备类型</span>
            <el-select v-model="nowSearch.type" style="width: 160px;" clearable placeholder="请选择设备类型">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <span>设备MAC</span>
            <el-input style="width: 200px;" placeholder="请输入MAC" v-model.trim="nowSearch.mac"></el-input>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="addDialog = true">新增</el-button>
            <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="ogz_name" label="组织名称"></el-table-column>
          <el-table-column label="设备类型" width="230">
            <template slot-scope="scope">
              <span v-if="scope.row.device_type === 'cjk'">采集器</span>
              <span v-else-if="scope.row.device_type === 'sjwg'">数据网关</span>
              <span v-else>{{ scope.row.device_type }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备mac/DevEui">
            <template slot-scope="scope">
              <span>{{scope.row.device_mac | filterMac}}</span>
            </template>
          </el-table-column>
          <el-table-column label="添加时间">
            <template slot-scope="scope">
              <span>{{scope.row.create_time | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="178">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.device_mac, scope.row.device_type)">删除</a>
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
    </div>
    <!-- 新增组织 -->
    <aorg-module
      :parentDialog="aorgDialog"
      :parentId="orgId"
      :parentName="orgName"
      @parentUpdata="aorgUpdata"
      @parentCancel="aorgCancel">
    </aorg-module>
    <!-- 编辑组织 -->
    <corg-module
      :parentDialog="corgDialog"
      :parentId="orgId"
      @parentUpdata="corgUpdata"
      @parentCancel="corgCancel">
    </corg-module>
    <!-- 新增设备 -->
    <add-module
      :parentDialog="addDialog"
      :parentId="orgId"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 删除设备 -->
    <del-module
      :parentDialog="delDialog"
      :parentMac="itemMac"
      :parentType="itemType"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
// 引入新增组织组件
import aorgModule from '@/components/external/hardcon-aorg'
// 引入编辑组织组件
import corgModule from '@/components/external/hardcon-corg'
// 引入新增设备组件
import addModule from '@/components/external/hardcon-add'
// 引入删除设备组件
import delModule from '@/components/external/hardcon-del'
import {mapState} from 'vuex'
export default{
  name: 'hardcon',
  data () {
    return {
      orgData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      orgId: 0,
      orgName: '',
      search: {
        type: '',
        mac: ''
      },
      nowSearch: {
        type: '',
        mac: ''
      },
      typeOptions: [
        {
          label: '采集器',
          value: 'cjk'
        },
        {
          label: '数据网关',
          value: 'sjwg'
        },
        {
          label: '压力变送器',
          value: '压力变送器'
        },
        {
          label: '液位变送器',
          value: '液位变送器'
        },
        {
          label: '温湿度采集器',
          value: '温湿度采集器'
        },
        {
          label: '燃气报警器',
          value: '燃气报警器'
        },
        {
          label: '一键报警器',
          value: '一键报警器'
        },
        {
          label: '红外报警器',
          value: '红外报警器'
        },
        {
          label: '水浸采集器',
          value: '水浸采集器'
        },
        {
          label: '安全用电',
          value: '安全用电'
        },
        {
          label: '烟感报警器',
          value: '烟感报警器'
        },
        {
          label: 'lora采集卡',
          value: 'lora采集卡'
        },
        {
          label: 'lora网关',
          value: 'lora网关'
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      aorgDialog: false,
      corgDialog: false,
      addDialog: false,
      delDialog: false,
      itemMac: '',
      itemType: '',
      downDisabled: true
    }
  },
  created () {

  },
  mounted () {
    if (this.deviceUid.indexOf(this.userId) === -1) {
      this.$router.go(-1)
      return
    }
    // 获取机构树
    this.getOrganTree()
  },
  components: {
    aorgModule,
    corgModule,
    addModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId',
      'deviceUid'
    ])
  },
  methods: {
    // 获取机构树
    getOrganTree (b = false) {
      let params = {
        ogz_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.deviceApi() + '/device/v1/selOgzTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let orgData = res.data.data1
          this.orgData = [
            {
              'id': 0,
              'name': '深圳市黑卡科技有限公司',
              'children': orgData
            }
          ]
          if (b) {
            this.$refs.tree.setCheckedKeys([this.orgId])
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
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) {
          return
        }
        this.$refs.tree.setCheckedKeys([data.id])
        // id
        this.orgId = data.id
        // name
        if (data.id === 0) {
          this.orgName = ''
        } else {
          this.orgName = data.name
        }
      } else {
        if (this.orgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.tree.setCheckedKeys([data.id])
      // id
      this.orgId = data.id
      // name
      if (data.id === 0) {
        this.orgName = ''
      } else {
        this.orgName = data.name
      }
    },
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
      if (!this.orgId) return
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        ogz_id: this.orgId,
        device_mac: mac,
        device_type: this.search.type,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.deviceApi() + '/device/v1/selDevices',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.devices
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
    /* 新增组织 */
    aorgUpdata () {
      this.aorgDialog = false
      // 更新组织树
      this.getOrganTree(true)
    },
    aorgCancel () {
      this.aorgDialog = false
    },
    /* 编辑组织 */
    corgUpdata () {
      this.corgDialog = false
      // 更新组织树
      this.getOrganTree(true)
    },
    corgCancel () {
      this.corgDialog = false
    },
    /* 新增设备 */
    addCancel () {
      this.addDialog = false
    },
    addUpdata () {
      this.addDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 删除设备 */
    delClick (mac, type) {
      this.itemMac = mac
      this.itemType = type
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
    /* 导出 */
    downFile () {
      if (!this.orgId) return
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        ogz_id: this.orgId,
        device_mac: mac,
        device_type: this.search.type
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.deviceApi() + '/device/v1/selDevicesEO?' + params
    }
  },
  filters: {
    filterMac (str, type) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      if (type === 'kqj') { return value }
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  },
  watch: {
    orgId (val, oldVal) {
      this.search = {
        type: '',
        mac: ''
      }
      this.nowSearch = {
        type: '',
        mac: ''
      }
      if (val) {
        // 初始化页码
        this.nowPage = 1
        // 获取列表数据
        this.getListData()
        // 可导出
        this.downDisabled = false
      } else {
        // 不可导出
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-row.css';
  .module-aside {
    padding-top: 40px;
    position: relative;
    .aside-header{
      width: 100%;
      height: 40px;
      padding: 0 10px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: #f1f1f1;
      .operate{
        a{
          margin: 0 5px;
        }
      }
    }
    .aside-tree{
      height: 100%;
      padding: 5px;
      overflow: auto;
    }
  }
</style>
