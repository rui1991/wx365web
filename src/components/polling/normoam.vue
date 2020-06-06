<template>
  <div class="normoam">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>标准维护</el-breadcrumb-item>
          <el-breadcrumb-item>标准维护管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <span>标准名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
          </div>
          <div class="item">
            <span>执行部门</span>
            <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择执行部门">
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
            <el-button type="primary" @click="addDialog = true">新增</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="模板名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row.os_id)">{{ scope.row.standard_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="模板类型">
            <template slot-scope="scope">
              <span>{{ scope.row.standard_type | filterType }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ogz_name" label="执行部门"></el-table-column>
          <el-table-column prop="osize" label="检查项数量"></el-table-column>
          <!--<el-table-column label="创建时间">-->
            <!--<template slot-scope="scope">-->
              <!--<span>{{ scope.row.create_time | formatDate }}</span>-->
            <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column prop="remarks" :show-overflow-tooltip="true" max-width="600" label="备注"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.os_id)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.os_id)">删除</a>
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
      :parentSectors="sectorOptions"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentSectors="sectorOptions"
      :parentId="itemId"
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
import addModule from '@/components/polling/normoam-add'
// 引入详情组件
import detModule from '@/components/polling/normoam-det'
// 引入编辑组件
import comModule from '@/components/polling/normoam-com'
// 引入删除组件
import delModule from '@/components/polling/normoam-del'
export default{
  name: 'normoam',
  data () {
    return {
      sectorOptions: [],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      search: {
        name: '',
        sector: ''
      },
      nowSearch: {
        name: '',
        sector: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      detDialog: false,
      comDialog: false,
      delDialog: false,
      itemId: ''
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
  },
  components: {
    addModule,
    detModule,
    comModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
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
        standard_name: this.search.name,
        ogz_id: this.search.sector,
        standard_type: '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    addUpdata () {
      this.addDialog = false
      // 更新列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 编辑 */
    comClick (id) {
      this.itemId = id
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
    /* 获取部门 */
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
    filterType (num) {
      if (!num) { return '' }
      let value = Number.parseInt(num)
      switch (value) {
        case 1:
          return '设备标准'
        case 2:
          return '巡检标准'
        default:
          return ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .normoam{
    height: 100%;
    padding-bottom: 20px;
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
          display: flex;
          width: 100%;
          height: 60px;
          .item{
            display: flex;
            align-items: center;
            margin-right: 50px;
            span{
              width: 70px;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            flex-grow: 1;
            text-align: right;
          }
        }
      }
    }
  }
</style>
