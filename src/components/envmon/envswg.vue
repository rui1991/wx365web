<template>
  <div class="envswg">
    <div class="search">
      <div class="search-input" style="margin-bottom: 10px;">
        <div class="item">
          <span>网关名称</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
        </div>
        <div class="item">
          <span>网关位置</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.position"></el-input>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
          <el-button type="primary" @click="addDialog = true">新增</el-button>
        </div>
      </div>
      <div class="search-input">
        <div class="item">
          <span>网关状态</span>
          <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择设备状态">
            <el-option
              v-for="item in stateOptions"
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
      <el-table-column label="设备名称">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="location_name" label="网关位置"></el-table-column>
      <el-table-column prop="gatewayEUI" label="网关ID"></el-table-column>
      <el-table-column prop="onlineTime" label="最后在线时间"></el-table-column>
      <el-table-column prop="online" label="状态"></el-table-column>
      <el-table-column label="操作" width="240">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
          <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.gatewayEUI)">删除</a>
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
      :parentId="itemOId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/envmon/envswg-add'
// 引入编辑组件
import comModule from '@/components/envmon/envswg-com'
// 引入详情组件
import detModule from '@/components/envmon/envswg-det'
// 引入删除组件
import delModule from '@/components/envmon/envswg-del'
export default{
  name: 'envswg',
  data () {
    return {
      search: {
        name: '',
        position: '',
        state: ''
      },
      nowSearch: {
        name: '',
        position: '',
        state: ''
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
        id: '',
        posName: '',
        posId: '',
        longitude: '',
        latitude: '',
        describe: ''
      },
      itemOId: '',
      itemId: 0,
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
    addModule,
    comModule,
    detModule,
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
        online: this.search.state
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.loraApi() + '/lora/selGwList',
        data: params
      }).then((res) => {
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
      this.itemId = data.id
      this.itemData = {
        name: data.name,
        id: data.gatewayEUI,
        posName: data.location_name,
        posId: data.location_id,
        longitude: data.longitude,
        latitude: data.latitude,
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
        id: data.gatewayEUI,
        posName: data.location_name,
        posId: data.location_id,
        longitude: data.longitude,
        latitude: data.latitude,
        describe: data.description
      }
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 删除 */
    delClick (id) {
      this.itemOId = id
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
    /* 导出文件 */
    downFile () {
      let params = {

      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectPositionEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
  .envswg{
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
        .operate{
          display: table-cell;
          vertical-align: middle;
          text-align: right;
        }
      }
    }
  }
</style>
