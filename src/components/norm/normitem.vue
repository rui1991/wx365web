<template>
  <div class="normitem">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item v-for="item in pathArr" :key="item">{{ item }}</el-breadcrumb-item>
          <el-breadcrumb-item>检查项</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <el-button type="primary" @click="returnSuper">返回</el-button>
          <el-button type="primary" @click="addDialog = true">新增</el-button>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="表达方式" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.expression | filterWay }}</span>
            </template>
          </el-table-column>
          <el-table-column label="表达值" width="240" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.expression_value">{{ scope.row.expression_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="检查项名称" width="240" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row)">{{ scope.row.inspect_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="默认值" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.default_value">{{ scope.row.default_value }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="检查内容及要求" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.inspect_contents">{{ scope.row.inspect_contents }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.sdd_id)">删除</a>
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
    <!-- 新增标准项 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 标准项详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentForm="formData"
      @parentClose="detClose">
    </det-module>
    <!-- 编辑标准项 -->
    <com-module
      :parentDialog="comDialog"
      :parentId="itemId"
      :parentForm="formData"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 删除标准项 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入新增标准项组件
import addModule from '@/components/norm/normitem-add'
// 引入标准项详情组件
import detModule from '@/components/norm/normitem-det'
// 引入标准项详情组件
import comModule from '@/components/norm/normitem-com'
// 引入标准项删除组件
import delModule from '@/components/norm/normitem-del'
export default{
  name: 'normitem',
  data () {
    return {
      pathArr: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: 0,
      addDialog: false,
      detDialog: false,
      comDialog: false,
      formData: {
        name: '',
        way: 1,
        values: [],
        valueText: '',
        defValue: '',
        abnValue: [],
        content: ''
      },
      delDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 路径
    let path = this.parPath
    let pathArr = path.split('>')
    this.pathArr = pathArr
    // 获取列表
    this.getListData()
  },
  components: {
    addModule,
    detModule,
    comModule,
    delModule
  },
  computed: {
    ...mapState('other', {
      orgType: state => state.normOrgan.type,
      companyId: state => state.normOrgan.companyId,
      projectId: state => state.normOrgan.projectId,
      parId: state => state.normData.id,
      typeid: state => state.normData.typeid,
      parPath: state => state.normData.path
    })
  },
  methods: {
    /*
    * 参数说明：
    * ascription_type：Number  组织类型； 0：平台，1：企业， 2：项目
    * sdt_id：Number  检查项上级的sdt_id
    * sdt_type：String  检查项上级的sdt_type
    * path：String  检查项上级的路径
    * */
    ...mapActions('other', [
      'setProDisabled'
    ]),
    // 获取列表数据
    getListData () {
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_id: this.parId,
        sdt_type: this.typeid,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsCheckMes',
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
      // 获取列表数据
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    detClick (data) {
      // 表达值
      let values = data.expression_value
      let valuesArr = []
      if (values) {
        valuesArr = values.split(',')
      }
      // 提示
      const way = data.expression
      let valueText = ''
      if (way === 3 || way === 4) {
        valueText = '长度不得超过100个字符'
      } else if (way === 5) {
        valueText = '最多可上传3张图片'
      }
      // 异常值
      let abnValue = data.abnormal_value
      let abnValueArr = []
      if (abnValue) {
        abnValueArr = abnValue.split(',')
      }
      this.formData = {
        name: data.inspect_name,
        way: way,
        values: valuesArr,
        valueText: valueText,
        defValue: data.default_value,
        abnValue: abnValueArr,
        content: data.inspect_contents
      }
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 编辑 */
    comClick (data) {
      this.itemId = data.sdd_id
      // 表达值
      let values = data.expression_value
      let valuesArr = []
      if (values) {
        valuesArr = values.split(',')
      }
      // 提示
      const way = data.expression
      let valueText = ''
      if (way === 3 || way === 4) {
        valueText = '长度不得超过100个字符'
      } else if (way === 5) {
        valueText = '最多可上传3张图片'
      }
      // 异常值
      let abnValue = data.abnormal_value
      let abnValueArr = []
      if (abnValue) {
        abnValueArr = abnValue.split(',')
      }
      this.formData = {
        name: data.inspect_name,
        way: way,
        values: valuesArr,
        valueText: valueText,
        defValue: data.default_value,
        abnValue: abnValueArr,
        content: data.inspect_contents
      }
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 获取列表数据
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
      // 获取列表数据
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    },
    /* 返回 */
    returnSuper () {
      this.$router.go(-1)
    }
  },
  filters: {
    filterWay (num) {
      if (!num) { return '' }
      let value = Number.parseInt(num)
      switch (value) {
        case 1:
          return '单选'
        case 2:
          return '多选'
        case 3:
          return '文本框'
        case 4:
          return '文本域'
        case 5:
          return '图片'
        default:
          return ''
      }
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
  .normitem{
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
          display: flex;
          height: 60px;
          align-items: center;
          justify-content: flex-end;
        }
      }
    }
  }
</style>
