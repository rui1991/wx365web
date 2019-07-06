<template>
  <div class="callname">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>人员位置管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/callname">点名管理</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>点名规则设置</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="operate">
            <el-button type="primary" @click="addClick">新增</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_names" :show-overflow-tooltip="true" label="点名人员"></el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="点名地址">
            <template slot-scope="scope">
              <span v-if="scope.row.position_names">{{ scope.row.position_names }}</span>
              <span v-else>全部</span>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="urc_size" label="点名次数"></el-table-column>
          <el-table-column width="160" label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.rcs_id)">删除</a>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增点名规则" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="点名人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="addForm.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="addCrewClick">选择人员</el-button>
        </el-form-item>
        <el-form-item label="点名地址" prop="siteName">
          <el-input :disabled="true" type="textarea" v-model="addForm.siteName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="addSiteClick">选择地址</el-button>
        </el-form-item>
        <el-form-item label="点名次数" prop="count">
          <el-input style="width: 140px;" v-model.trim="addForm.count" auto-complete="off">
            <template slot="append">次</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑点名规则" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="点名人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="comForm.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="comCrewClick">选择人员</el-button>
        </el-form-item>
        <el-form-item label="点名地址" prop="siteName">
          <el-input :disabled="true" type="textarea" v-model="comForm.siteName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="comSiteClick">选择地址</el-button>
        </el-form-item>
        <el-form-item label="点名次数" prop="count">
          <el-input style="width: 140px;" v-model.trim="comForm.count" auto-complete="off">
            <template slot="append">次</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" width="26%" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该点名规则？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </span>
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
    <!-- 地址 -->
    <el-dialog title="选择地址" :visible.sync="siteDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="siteTree"
        ref="siteTree"
        show-checkbox
        default-expand-all
        check-strictly
        node-key="id"
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="siteDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectSite">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'callnameSet',
  data () {
    return {
      tableData: [],
      formLabelWidth: '100px',
      rules: {
        crewName: [
          { required: true, message: '请选择人员', trigger: 'change' }
        ],
        count: [
          { required: true, message: '请输入点名次数', trigger: 'blur' }
        ]
      },
      addDialog: false,
      addForm: {
        crewName: '',
        crewId: [],
        siteName: '',
        siteId: '',
        count: ''
      },
      addDisabled: false,
      comDialog: false,
      comForm: {
        crewName: '',
        crewId: [],
        siteName: '',
        siteId: '',
        count: ''
      },
      comDisabled: false,
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
      },
      siteDialog: false,
      siteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', true)
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
        nowOrgid: state => state.nowOrgid
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 表格数据
          this.tableData = res.data.data1
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
    /* 新增 */
    addClick () {
      this.addDialog = true
      this.addForm = {
        crewName: '',
        crewId: [],
        siteName: '',
        siteId: '',
        count: ''
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
      let count = this.addForm.count + ''
      count = this.verifyNum(count)
      if (count > 24) {
        this.$message({
          showClose: true,
          message: '点名次数不能超过24次！',
          type: 'warning'
        })
        return
      }
      let crewId = this.addForm.crewId
      crewId = crewId.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        users: crewId,
        // user_names: this.addForm.crewName,
        positions: this.addForm.siteId,
        // position_names: this.addForm.siteName,
        urc_size: count
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/setRollCallMessage',
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
      this.itemId = data.rcs_id
      let users = data.users
      let userArr = []
      if (users) {
        userArr = users.split(',')
      } else {
        userArr = []
      }
      let crewId = userArr.map((value) => {
        return Number.parseInt(value)
      })
      this.comForm = {
        crewName: data.user_names,
        crewId: crewId,
        siteName: data.position_names || '',
        siteId: data.positions || '',
        count: data.urc_size
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
      let count = this.comForm.count + ''
      count = this.verifyNum(count)
      if (count > 24) {
        this.$message({
          showClose: true,
          message: '点名次数不能超过24次！',
          type: 'warning'
        })
        return
      }
      let crewId = this.comForm.crewId
      crewId = crewId.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        rcs_id: this.itemId,
        project_id: this.nowProid,
        users: crewId,
        positions: this.comForm.siteId,
        urc_size: count
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/altRollCallMessage',
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
    // 处理次数
    verifyNum (value) {
      let str = /^\+?[1-9][0-9]*$/
      return value.match(str) ? Number.parseInt(value) : 1
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
        rcs_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/delRollCallMessage',
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
      crewName = crewName.join('，')
      if (this.addDialog) {
        this.addForm.crewName = crewName
        this.addForm.crewId = crewId
      } else if (this.comDialog) {
        this.comForm.crewName = crewName
        this.comForm.crewId = crewId
      }
      this.crewDialog = false
    },
    /* 地址 */
    // 获取地址树
    getSiteTree (b = false) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const treeData = res.data.data1
          this.siteTree = treeData
          if (b) {
            let ids = this.comForm.siteId
            ids = ids.split(',')
            setTimeout(() => {
              this.$refs.siteTree.setCheckedKeys(ids)
            }, 100)
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
    // 新增
    addSiteClick () {
      this.siteDialog = true
      if (this.siteTree.length === 0) {
        this.getSiteTree()
      } else {
        let ids = this.addForm.siteId
        ids = ids.split(',')
        setTimeout(() => {
          this.$refs.siteTree.setCheckedKeys(ids)
        }, 100)
      }
    },
    // 编辑
    comSiteClick () {
      this.siteDialog = true
      if (this.siteTree.length === 0) {
        this.getSiteTree(true)
      } else {
        let ids = this.comForm.siteId
        ids = ids.split(',')
        setTimeout(() => {
          this.$refs.siteTree.setCheckedKeys(ids)
        }, 100)
      }
    },
    // 确定
    selectSite () {
      const nodesData = this.$refs.siteTree.getCheckedNodes()
      let siteName = []
      let siteId = []
      nodesData.forEach(item => {
        siteName.push(item.name)
        siteId.push(item.id)
      })
      siteName = siteName.join('，')
      siteId = siteId.join(',')
      if (this.addDialog) {
        this.addForm.siteName = siteName
        this.addForm.siteId = siteId
      } else if (this.comDialog) {
        this.comForm.siteName = siteName
        this.comForm.siteId = siteId
      }
      this.siteDialog = false
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
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', false)
  }
}
</script>

<style lang="less" scoped>
.callname{
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
