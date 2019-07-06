<template>
  <div class="role">
    <div class="search">
      <div class="operate">
        <el-button type="primary" @click="addClick">新增</el-button>
      </div>
    </div>
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="role_mark" label="编码"></el-table-column>
      <el-table-column label="角色名称">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.role_id)">{{ scope.row.role_name }}</a>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | formatDate('yyyy-mm-dd') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="创建人"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.role_id)">编辑</a>
          <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.role_id)">删除</a>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增 -->
    <el-dialog title="新增角色" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="coding">
          <el-input type="textarea" v-model="addForm.coding"></el-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="autNames">
          <el-input type="textarea" :disabled="true" v-model="addForm.autNames"></el-input>
          <el-button type="primary" @click="addAutClick">选择权限</el-button>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model="addForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="角色详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="body-content">
        <el-form class="entirety-from" :label-width="formLabelWidth">
          <el-form-item label="角色名称">
            <el-input v-model="detForm.name" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="角色编码">
            <el-input v-model="detForm.coding" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="角色权限">
            <el-input type="textarea" :disabled="true" v-model="detForm.authority"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" :disabled="true" v-model="detForm.remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑角色" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="coding">
          <el-input :disabled="true" v-model="comForm.coding"></el-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="autNames">
          <el-input type="textarea" :disabled="true" v-model="comForm.autNames"></el-input>
          <el-button type="primary" @click="comAutClick">选择权限</el-button>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model="comForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 权限 -->
    <el-dialog title="选择权限" :visible.sync="autDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="tree">
        <el-tree :data="autTree" ref="autTree" show-checkbox node-key="id" :props="defaultProps"></el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="autDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="autDisabled" @click="selectAut">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该角色？</p>
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
  name: 'role',
  data () {
    let checkCoding = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]+$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('编码只能为数字或字母'))
        }
      } else {
        callback(new Error('请输入机构编码'))
      }
    }
    return {
      tableData: [],
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入机构名称', trigger: 'blur' }
        ],
        coding: [
          { required: true, validator: checkCoding, trigger: 'blur' }
        ]
      },
      addDialog: false,
      addForm: {
        name: '',
        coding: '',
        autIds: '',
        autNames: '',
        remark: ''
      },
      addDisabled: false,
      detDialog: false,
      detForm: {
        name: '',
        coding: '',
        authority: '',
        remark: ''
      },
      comDialog: false,
      comForm: {
        name: '',
        coding: '',
        autIds: '',
        autNames: '',
        remark: ''
      },
      comDisabled: false,
      delDialog: false,
      delDisabled: false,
      itemId: '',
      autDialog: false,
      autTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      autDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        companyName: state => state.org.orgName,
        userId: state => state.info.userId,
        orgId: state => state.org.orgId,
        baseId: state => state.org.baseId
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: 1,
        user_id: this.userId,
        s_role_name: '',
        s_role_mark: ''
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selRole',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
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
        name: '',
        coding: '',
        autIds: '',
        autNames: '',
        remark: ''
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
        company_id: 1,
        user_id: this.userId,
        role_name: this.addForm.name,
        role_mark: this.addForm.coding,
        function_id: this.addForm.autIds || 0,
        remarks: this.addForm.remark
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/addRole',
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
    /* 查看详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: 1,
        user_id: this.userId,
        project_id: 0,
        role_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selRoleOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 权限
          const authority = itemData.permissions
          let autNames = []
          authority.forEach(item => {
            autNames.push(item.function_name)
          })
          autNames = autNames.join('、')
          this.detForm = {
            name: itemData.role_name,
            coding: itemData.role_mark,
            authority: autNames,
            remark: itemData.instructions
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
        this.addDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 编辑 */
    comClick (id) {
      this.comDialog = true
      this.itemId = id
      this.comForm = {
        name: '',
        coding: '',
        autIds: '',
        autNames: '',
        remark: ''
      }
      this.getComItem()
    },
    getComItem () {
      let params = {
        company_id: 1,
        user_id: this.userId,
        project_id: 0,
        role_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selRoleOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 权限
          const authority = itemData.permissions
          let autIds = []
          let autNames = []
          authority.forEach(item => {
            autNames.push(item.function_name)
            autIds.push(item.function_id)
          })
          autIds = autIds.join(',')
          autNames = autNames.join('、')
          this.comForm = {
            name: itemData.role_name,
            coding: itemData.role_mark,
            autIds: autIds,
            autNames: autNames,
            remark: itemData.instructions
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
        this.addDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
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
      let params = {
        company_id: 1,
        user_id: this.userId,
        role_id: this.itemId,
        role_name: this.comForm.name,
        role_mark: this.comForm.coding,
        function_id: this.comForm.autIds || 0,
        remarks: this.comForm.remark
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/alterRole',
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
      this.itemId = id
      this.delDialog = true
    },
    submitDelForm () {
      let params = {
        company_id: 1,
        user_id: this.userId,
        project_id: 0,
        role_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/delRole',
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
    /* 权限 */
    // 新增
    addAutClick () {
      this.autDialog = true
      if (this.autTree.length === 0) {
        setTimeout(() => {
          let ids = []
          this.getAutOptions(ids)
        }, 100)
      } else {
        let ids = this.addForm.autIds
        if (ids) {
          ids = ids.split(',')
        } else {
          ids = []
        }
        setTimeout(() => {
          this.$refs.autTree.setCheckedKeys(ids)
        }, 100)
      }
    },
    // 编辑
    comAutClick () {
      this.autDialog = true
      let ids = this.comForm.autIds
      if (ids) {
        ids = ids.split(',')
      } else {
        ids = []
      }
      if (this.autTree.length === 0) {
        setTimeout(() => {
          this.getAutOptions(ids)
        }, 100)
      } else {
        setTimeout(() => {
          this.$refs.autTree.setCheckedKeys(ids)
        }, 100)
      }
    },
    // 获取权限树
    getAutOptions (id) {
      let params = {
        company_id: 1,
        user_id: this.userId,
        project_id: 0,
        type: 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPermissionTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.autTree = res.data.data1
          this.$refs.autTree.setCheckedKeys(id)
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
    // 确定
    selectAut () {
      const autData = this.$refs.autTree.getCheckedNodes()
      let autNames = []
      let autIds = []
      autData.forEach(item => {
        autNames.push(item.name)
        autIds.push(item.id)
      })
      autNames = autNames.join('、')
      autIds = autIds.join(',')
      if (this.addDialog) {
        this.addForm.autNames = autNames
        this.addForm.autIds = autIds
      } else if (this.comDialog) {
        this.comForm.autNames = autNames
        this.comForm.autIds = autIds
      }
      this.autDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.role{
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
</style>
