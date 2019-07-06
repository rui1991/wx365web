<template>
  <div class="group">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>组管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <span>组名称</span>
            <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
          </div>
          <div class="item">
            <span>创建时段</span>
            <el-date-picker
              style="width: 160px;"
              v-model="nowSearch.startDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="item">
            <span>----</span>
            <el-date-picker
              style="width: 160px;"
              v-model="nowSearch.endDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="operate">
            <el-button type="primary" @click="searchList">搜索</el-button>
            <el-button type="primary" @click="addClick">新增</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column width="280" prop="group_name" label="组名称"></el-table-column>
          <el-table-column width="200" label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="user_names" :show-overflow-tooltip="true" label="人员名称"></el-table-column>
          <el-table-column width="160" label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.group_id)">删除</a>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page="nowPage"
          layout="prev, pager, next, total"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增组" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="组名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="addForm.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="addCrewClick">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑组" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="组名称" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="comForm.crewName"></el-input>
          <el-button type="primary" @click="comCrewClick">选择人员</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该组？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-transfer
        filterable
        ref="myTransfer"
        :filter-method="filterMethod"
        filter-placeholder="请输入人员姓名"
        v-model="checkCrew"
        :props="props"
        :titles="['人员列表', '已选择']"
        :data="crewData">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="crewDisabled" @click="selectCrew">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'group',
  data () {
    return {
      search: {
        name: '',
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        name: '',
        startDate: '',
        endDate: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      addForm: {
        name: '',
        crewName: '',
        crewId: []
      },
      addDisabled: false,
      comDialog: false,
      comForm: {
        name: '',
        crewName: '',
        crewId: []
      },
      comDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入组名称', trigger: 'blur' }
        ],
        crewName: [
          { required: true, message: '请选择组人员', trigger: 'change' }
        ]
      },
      formLabelWidth: '100px',
      delDialog: false,
      delDisabled: false,
      itemId: '',
      crewDialog: false,
      crewDisabled: true,
      crewData: [],
      props: {
        label: 'user_name',
        key: 'user_id'
      },
      checkCrew: [],
      filterMethod (query, item) {
        return item.user_name.indexOf(query) > -1
      }
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
    // 获取项目人员
    this.getCrewOptions()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.shift
      }
    )
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_name: '',
        group_id: '',
        group_name: this.search.name,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/selDutyGroupAndUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.dataList
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
        crewName: '',
        crewId: []
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
      let crewId = this.addForm.crewId
      crewId = crewId.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        group_name: this.addForm.name,
        userN_ids: crewId
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/addDutyGroup',
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
    /* 编辑 */
    comClick (data) {
      this.comDialog = true
      this.itemId = data.group_id
      let uids = data.user_ids
      let userArr = []
      if (uids) {
        userArr = uids.split(',')
      } else {
        userArr = []
      }
      let crewId = userArr.map((value) => {
        return Number.parseInt(value)
      })
      this.comForm = {
        name: data.group_name,
        crewName: data.user_names,
        crewId: crewId
      }
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
    // 重置表单
    resetComForm (formName) {
      this.$refs[formName].resetFields()
      this.comDialog = false
    },
    // 提交
    sendComRequest () {
      let crewId = this.comForm.crewId
      crewId = crewId.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        group_id: this.itemId,
        group_name: this.comForm.name,
        userN_ids: crewId
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/altDutyGroup',
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
        userN_ids: '',
        group_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/delDutyGroup',
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
    /* 人员 */
    // 获取项目人员
    getCrewOptions () {
      let params = {
        organize_id: this.nowOrgid,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewData = res.data.data1.users
          this.crewData = crewData
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
    // 新增
    addCrewClick () {
      this.crewDialog = true
      let crewId = this.addForm.crewId
      this.checkCrew = crewId
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
    },
    // 编辑
    comCrewClick () {
      this.crewDialog = true
      let crewId = this.comForm.crewId
      this.checkCrew = crewId
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
    },
    // 确定
    selectCrew () {
      const crewData = this.crewData
      const checkCrew = this.checkCrew
      let crewArr = []
      checkCrew.forEach(itemValue => {
        let temp = crewData.find((item, index, array) => {
          return itemValue === item.user_id
        })
        if (temp) {
          crewArr.push(temp)
        }
      })
      let crewName = []
      let crewId = []
      crewArr.forEach(item => {
        crewName.push(item.user_name)
        crewId.push(item.user_id)
      })
      crewName = crewName.join('、')
      if (this.addDialog) {
        this.addForm.crewName = crewName
        this.addForm.crewId = crewId
      } else if (this.comDialog) {
        this.comForm.crewName = crewName
        this.comForm.crewId = crewId
      }
      this.crewDialog = false
    }
  },
  watch: {
    checkCrew (val, oldVal) {
      if (val.length === 0) {
        this.crewDisabled = true
      } else {
        this.crewDisabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.group{
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
        display: table;
        width: 100%;
        height: 60px;
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
</style>
