<template>
  <div class="norm">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检标准维护</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>模板名称</span>
              <el-input style="width: 160px;" v-model="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>模板类型</span>
              <el-input style="width: 160px;" v-model="nowSearch.type"></el-input>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>创建日期</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.creDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="item">
              <span>创建人员</span>
              <el-input style="width: 160px;" v-model="nowSearch.crePerson"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" v-if="authority.add" @click="addClick">新增</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="模板名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.template_id)">{{ scope.row.template_name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="template_type" label="模板类型"></el-table-column>
          <el-table-column prop="size" label="标准数量"></el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="user_name" label="创建人"></el-table-column>
          <el-table-column prop="describe" max-width="600" label="描述"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.template_id)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.template_id)">删除</a>
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
    <el-dialog title="新增标准" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-input v-model.trim="addForm.type"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="addForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="巡检标准" prop="temIds">
          <el-input v-model="addForm.temIds" v-show="false" style="width: 60%;"></el-input>
          <el-button type="primary" @click="temClick">选择巡检标准</el-button>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="addForm.temData" style="width: 100%" v-show="addForm.temData.length > 0">
        <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
        <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
        <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
        <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="标准详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="detForm" ref="ruleDetForm" :label-width="formLabelWidth">
        <el-form-item label="模板名称">
          <el-input :disabled="true" v-model="detForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板类型">
          <el-input :disabled="true" v-model="detForm.type"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input :disabled="true" type="textarea" v-model="detForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="detForm.temData" style="width: 100%" v-show="detForm.temData.length > 0">
        <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
        <el-table-column prop="ins_method" class-name="multi-row" label="检查方法"></el-table-column>
        <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
        <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑标准" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-input v-model.trim="comForm.type"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="comForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="巡检标准" prop="temIds">
          <el-input v-model="comForm.temIds" v-show="false" style="width: 60%;"></el-input>
          <el-button type="primary" @click="temClick">选择巡检标准</el-button>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="comForm.temData" style="width: 100%" v-show="comForm.temData.length > 0">
        <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
        <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
        <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
        <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 巡检标准 -->
    <el-dialog title="选择标准" :visible.sync="temDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="temTree"
        ref="temTree"
        default-expand-all
        node-key="id"
        show-checkbox
        check-strictly
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="temDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectTemClick">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该巡检标准？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'norm',
  data () {
    return {
      authority: {
        add: true,
        com: true,
        del: true
      },
      search: {
        name: '',
        type: '',
        creDate: '',
        crePerson: ''
      },
      nowSearch: {
        name: '',
        type: '',
        creDate: '',
        crePerson: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      addForm: {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      },
      addDisabled: false,
      detDialog: false,
      detForm: {
        name: '',
        type: '',
        remark: '',
        temData: []
      },
      comDialog: false,
      comForm: {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      },
      comDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入模板类型', trigger: 'blur' }
        ],
        temIds: [
          { required: true, message: '请选择巡检标准', trigger: 'input' }
        ]
      },
      formLabelWidth: '100px',
      temDialog: false,
      temTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      delDialog: false,
      delDisabled: false,
      itemId: ''
    }
  },
  created () {
    // 获取列表
    this.getListData()
    // 获取标准
    this.getTemData()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(42) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(44) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(45) === -1 ? this.authority.del = false : this.authority.del = true
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        autDet: state => state.autDet.norm
      }
    )
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        templateN_name: this.search.name,
        templateN_type: this.search.type,
        createN_time: this.search.creDate,
        createN_user: this.search.crePerson,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateBySearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.templates
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
    addClick () {
      this.addDialog = true
      this.addForm = {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      }
    },
    // 验证表单
    submitAddForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendAddRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetAddForm (formName) {
      this.$refs[formName].resetFields()
      this.addDialog = false
    },
    // 提交
    sendAddRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_name: this.addForm.name,
        template_type: this.addForm.type,
        describe: this.addForm.remark,
        ins_ids: this.addForm.temIds
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/addTemplate',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.addDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 名称
          this.detForm.name = itemData.template_name
          // 类型
          this.detForm.type = itemData.template_type
          // 描述
          this.detForm.remark = itemData.describe
          // 模板id
          const temData = itemData.Ins
          let temIds = []
          temData.forEach(item => {
            temIds.push(item.ins_id)
          })
          temIds = temIds.join(',')
          this.getTemContent(temIds)
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
    /* 编辑 */
    comClick (id) {
      this.itemId = id
      this.comDialog = true
      this.comForm = {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      }
      this.getComItem()
    },
    getComItem () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 名称
          this.comForm.name = itemData.template_name
          // 类型
          this.comForm.type = itemData.template_type
          // 描述
          this.comForm.remark = itemData.describe
          // 模板id
          const temData = itemData.Ins
          let temIds = []
          temData.forEach(item => {
            temIds.push(item.ins_id)
          })
          temIds = temIds.join(',')
          this.comForm.temIds = temIds
          this.getTemContent(temIds)
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
    // 重置表单
    resetComForm (formName) {
      this.$refs[formName].resetFields()
      this.comDialog = false
    },
    // 验证表单
    submitComForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendComRequest()
        } else {
          return false
        }
      })
    },
    // 提交
    sendComRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: this.itemId,
        template_name: this.comForm.name,
        template_type: this.comForm.type,
        describe: this.comForm.remark,
        ins_ids: this.comForm.temIds
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/altTemplate',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetComForm('ruleComForm')
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.comDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 删除 */
    delClick (id) {
      this.delDialog = true
      this.itemId = id
    },
    submitDelForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/delTemplate',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.delDialog = false
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.delDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 巡检标准 */
    getTemData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temTree = res.data.data1
          temTree.forEach(item => {
            item.disabled = true
          })
          this.temTree = temTree
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
    temClick () {
      this.temDialog = true
      let temIds = ''
      if (this.addDialog) {
        temIds = this.addForm.temIds
      } else if (this.comDialog) {
        temIds = this.comForm.temIds
      }
      if (temIds) {
        temIds = temIds.split(',')
      } else {
        temIds = []
      }
      setTimeout(() => {
        this.$refs.temTree.setCheckedKeys(temIds)
      }, 100)
    },
    selectTemClick () {
      let temIds = this.$refs.temTree.getCheckedKeys()
      temIds = temIds.join(',')
      if (!temIds) {
        this.$message({
          showClose: true,
          message: '请选择巡检标准',
          type: 'warning'
        })
        return
      }
      if (this.addDialog) {
        this.addForm.temIds = temIds
      } else if (this.comDialog) {
        this.comForm.temIds = temIds
      }
      this.getTemContent(temIds)
    },
    getTemContent (ids) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: 0,
        ins_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temData = res.data.data1
          if (this.addDialog) {
            this.addForm.temData = temData
          } else if (this.comDialog) {
            this.comForm.temData = temData
          } else if (this.detDialog) {
            this.detForm.temData = temData
          }
          this.temDialog = false
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
  }
}
</script>

<style lang="less" scoped>
.norm{
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
  }
}
</style>
