<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>硬件对接</el-breadcrumb-item>
        <el-breadcrumb-item>lora数据查询</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
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
        <div class="main-search main-search-multi">
          <div class="search-row">
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
            <div class="operate"></div>
          </div>
          <div class="search-row">
            <div class="item date">
              <span>上报时段</span>
              <el-date-picker
                style="width: 320px;"
                v-model="nowSearch.date"
                :clearable="false"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm"
                :time-arrow-control="true"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="ogz_name" label="组织名称"></el-table-column>
          <el-table-column prop="lora_type" label="设备类型"></el-table-column>
          <el-table-column label="设备DevEui">
            <template slot-scope="scope">
              <span>{{scope.row.dev_eui | filterMac}}</span>
            </template>
          </el-table-column>
          <el-table-column label="上报时间">
            <template slot-scope="scope">
              <span>{{scope.row.check_in | formatDate}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="178">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate det">数据上报</a>
              <!--<a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.device_mac, scope.row.device_type)">删除</a>-->
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
  </div>
</template>

<script>
export default{
  name: 'loracon',
  data () {
    return {
      orgData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      orgId: 0,
      search: {
        date: [],
        mac: '',
        type: ''
      },
      nowSearch: {
        date: [],
        mac: '',
        type: ''
      },
      typeOptions: [
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
      downDisabled: true
    }
  },
  created () {

  },
  mounted () {
    // 获取当天日期
    let startTime = this.$common.getNowDate('yyyy-mm-dd')
    startTime = startTime + ' 00:00:00'
    let endTime = this.$common.getNowDate('yyyy-mm-dd hh:mm:ss')
    this.search.date = [startTime, endTime]
    this.nowSearch.date = [startTime, endTime]
    // 获取机构树
    this.getOrganTree()
  },
  methods: {
    // 获取机构树
    getOrganTree () {
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
          this.orgData = orgData
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
        om_type: 'lora',
        ogz_id: this.orgId,
        start_time: this.search.date[0],
        end_time: this.search.date[1],
        device_mac: mac,
        device_type: this.search.type,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.deviceApi() + '/inspection/v3.0/selGwCardMessage',
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
      this.search.mac = ''
      this.nowSearch.mac = ''
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
  .module-aside .aside-tree{
    height: 100%;
    padding: 5px;
    overflow: auto;
  }
</style>
