<template>
  <div class="cardcon">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>硬件对接</el-breadcrumb-item>
          <el-breadcrumb-item>打卡数据查询</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            style="padding: 5px;"
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
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="item date">
              <span>打卡时段</span>
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
            <div class="item">
              <span>设备MAC</span>
              <el-input style="width: 200px;" placeholder="请输入MAC" v-model.trim="nowSearch.mac"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <!--<el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>-->
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="ogz_name" label="组织名称"></el-table-column>
            <el-table-column prop="gateway_mac" label="网关MAC"></el-table-column>
            <el-table-column prop="card_mac" label="采集器MAC"></el-table-column>
            <el-table-column prop="tab_mac" label="打卡位置MAC"></el-table-column>
            <el-table-column prop="check_time" label="打卡时间"></el-table-column>
            <el-table-column prop="get_time" label="上传时间"></el-table-column>
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
    </el-container>
  </div>
</template>

<script>
export default{
  name: 'cardcon',
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
        mac: ''
      },
      nowSearch: {
        date: [],
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
          this.orgData = orgData
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
        ogz_id: this.orgId,
        start_time: this.search.date[0],
        end_time: this.search.date[1],
        device_mac: mac,
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
    },
    /* 导出 */
    downFile () {
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        ogz_id: this.orgId,
        start_time: this.search.date[0],
        end_time: this.search.date[1],
        device_mac: mac
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.deviceApi() + '/inspection/v3.0/selGwCardMessageEO?' + params
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
  .cardcon{
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
      .module-content{
        height: 100%;
        padding: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          border-radius: 6px;
          border: 1px solid #cccccc;
        }
        .module-main{
          padding-top: 0;
          padding-right: 10px;
          padding-bottom: 0;
          padding-left: 20px;
          overflow: scroll;
          .search{
            display: flex;
            align-items: center;
            height: 60px;
            .item{
              align-items: center;
              span{
                width: 70px;
                display: inline-block;
                font-size: 14px;
              }
              &.date{
                margin-right: 20px;
              }
            }
            .operate{
              align-items: center;
              flex-grow: 1;
              text-align: right;
            }
          }
        }
      }
    }
  }
</style>
