<template>
  <div class="user">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            :data="orgTree"
            :highlight-current="true"
            default-expand-all
            node-key="id"
            :props="defaultProps"
            @node-click="handleNodeClick">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>用户姓名</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="item">
                <span>联系电话</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.phone"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" v-if="authority.add" @click="addClick">新增</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>用户角色</span>
                <el-select v-model="nowSearch.role" style="width: 160px;" clearable filterable placeholder="请选择用户角色">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.role_id"
                    :label="item.role_name"
                    :value="item.role_id">
                  </el-option>
                </el-select>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="opeUpDis" v-if="authority.add" @click="upClick">导入</el-button>
                <el-button type="primary" v-if="authority.add" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="user_id" label="用户ID"></el-table-column>
            <el-table-column label="用户姓名">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.user_id)">{{ scope.row.user_name }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="user_phone" label="联系电话"></el-table-column>
            <el-table-column prop="role_name" label="角色"></el-table-column>
            <el-table-column prop="ogz_name" label="所属部门"></el-table-column>
            <el-table-column label="卡片mac地址">
              <template slot-scope="scope">
                <span>{{ scope.row.card_mac | filterMac }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="178">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="operate com" @click="bindClick(scope.row.user_id, scope.row.project_id)" v-if="scope.row.project_id && !scope.row.card_mac">绑卡</a>
                <a href="javascript:void(0);" class="operate del" @click="untieClick(scope.row.user_id, scope.row.project_id, scope.row.card_mac)" v-if="scope.row.project_id && scope.row.card_mac">解绑</a>
                <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.user_id, scope.row.card_mac)" v-if="authority.com">编辑</a>
                <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.user_id)" v-if="authority.del">删除</a>
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
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增用户" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model.trim="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model.trim="addForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门" prop="sectorName">
          <el-input :disabled="true" v-model="addForm.sectorName"></el-input>
          <el-button type="primary" @click="addSecClick">选择部门</el-button>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addForm.role" filterable placeholder="请选择用户角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.role_name"
              :value="item.role_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="授权范围" prop="accreditName">
          <el-input type="textarea" :disabled="true" v-model="addForm.accreditName"></el-input>
          <el-button type="primary" @click="addAccClick">选择范围</el-button>
        </el-form-item>
        <el-form-item label="技能" prop="parSkillName">
          <el-input type="textarea" :disabled="true" v-model="addForm.parSkillName"></el-input>
          <el-button type="primary" @click="addSkillClick">选择技能</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="用户详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="addForm" :label-width="formLabelWidth">
        <el-form-item label="用户姓名">
          <el-input :disabled="true" v-model="detForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input :disabled="true" v-model="detForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-input :disabled="true" v-model="detForm.sector" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-input :disabled="true" v-model="detForm.role" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="卡片mac">
          <el-input :disabled="true" v-model="detForm.mac" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="授权范围">
          <el-input type="textarea" :disabled="true" v-model="detForm.accredit" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="技能">
          <el-input type="textarea" :disabled="true" v-model="detForm.skill" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑用户" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <p style="height: 30px; color: #f04645;" v-show="comSector">提示：如需更换所属部门请先解绑卡片！</p>
      <el-form class="divide-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model.trim="comForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门" prop="sectorName">
          <el-input :disabled="true" v-model="comForm.sectorName"></el-input>
          <el-button type="primary" @click="comSecClick" :disabled="comSector">选择部门</el-button>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="comForm.role" filterable placeholder="请选择用户角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.role_name"
              :value="item.role_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="授权范围" prop="accreditName">
          <el-input type="textarea" :disabled="true" v-model="comForm.accreditName"></el-input>
          <el-button type="primary" @click="comAccClick">选择范围</el-button>
        </el-form-item>
        <el-form-item label="技能" prop="parSkillName">
          <el-input type="textarea" :disabled="true" v-model="comForm.parSkillName"></el-input>
          <el-button type="primary" @click="comSkillClick">选择技能</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 绑卡 -->
    <el-dialog title="用户绑卡" :visible.sync="bindDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="bindForm" :rules="rules" ref="ruleBindForm" :label-width="formLabelWidth">
        <el-form-item label="卡片MAC" prop="mac">
          <el-input v-model.trim="bindForm.mac" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetBindForm('ruleBindForm')">取 消</el-button>
        <el-button type="primary" :disabled="bindDisabled" @click="submitBindForm('ruleBindForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 解绑 -->
    <el-dialog title="提示" :visible.sync="untieDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要解绑该用户与卡片之间的关联？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="untieDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="untieDisabled" @click="submitUntieForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 部门 -->
    <el-dialog title="选择部门" :visible.sync="sectorDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="sectorTree"
        show-checkbox
        default-expand-all
        check-strictly
        node-key="id"
        ref="sectorTree"
        @check-change="secCheckChange"
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sectorDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="sectorDisabled" @click="selectSector">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 授权范围 -->
    <el-dialog title="选择授权范围" :visible.sync="accreditDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="accreditTree"
        show-checkbox
        default-expand-all
        check-strictly
        node-key="id"
        ref="accreditTree"
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="accreditDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectAccredit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 技能 -->
    <el-dialog title="选择技能" :visible.sync="skillDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入技能名称" prefix-icon="el-icon-search" v-model="skillFilter"></el-input>
      <el-table class="select-table" :data="skillData" ref="skillTable" @selection-change="skillSelectChange" style="width: 100%" max-height="360">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="技能名称"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="skillDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectSkill">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该用户？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog title="导入用户资料" :visible.sync="upDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="up-file">
        <span class="txt">导入文件</span>
        <el-upload
          class="upload-demo"
          :action="reqUrl"
          :headers="reqHead"
          :on-success="upFileSuccess"
          :on-error="upFileError"
          :multiple="false"
          :file-list="fileList">
          <el-button size="small" type="primary">点击导入</el-button>
        </el-upload>
        <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑用户资料</p>
        <!--<p class="up-hint">&nbsp;&nbsp;&nbsp;&nbsp;2.导入的用户文件仅支持excel文件</p>-->
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="upDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'cuser',
  data () {
    let checkPhone = (rule, value, callback) => {
      let regex = /^1[3|4|5|6|7|8|9][0-9]{9}$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('手机号码格式错误'))
        }
      } else {
        callback(new Error('请输入手机号码'))
      }
    }
    let checkMac = (rule, value, callback) => {
      const formValue = value.replace(/:/g, '')
      let regex = /^[a-zA-Z0-9]{12}$/
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac地址格式有误，请认真核对'))
        }
      } else {
        callback(new Error('请输入mac地址'))
      }
    }
    return {
      authority: {
        add: true,
        com: true,
        del: true
      },
      search: {
        name: '',
        phone: '',
        role: ''
      },
      nowSearch: {
        name: '',
        phone: '',
        role: ''
      },
      orgId: 0,
      orgName: '',
      orgType: '',
      orgBase: '',
      roleOptions: [],
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: checkPhone, trigger: 'blur' }
        ],
        sectorName: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        accreditName: [
          { required: true, message: '请选择授权范围', trigger: 'change' }
        ],
        mac: [
          { required: true, validator: checkMac, trigger: 'blur' }
        ]
      },
      addDialog: false,
      addForm: {
        name: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: '',
        parSkillName: '',
        parSkillId: [],
        skillId: ''
      },
      addDisabled: false,
      detDialog: false,
      detForm: {
        name: '',
        phone: '',
        sector: '',
        role: '',
        mac: '',
        accredit: '',
        skill: ''
      },
      comDialog: false,
      comForm: {
        name: '',
        ophone: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: '',
        parSkillName: '',
        parSkillId: [],
        skillId: ''
      },
      comSector: false,
      comDisabled: false,
      delDialog: false,
      delDisabled: false,
      bindDialog: false,
      bindDisabled: false,
      bindForm: {
        mac: ''
      },
      untieDialog: false,
      untieDisabled: false,
      itemId: '',
      cardMac: '',
      proId: '',
      sectorDialog: false,
      sectorDisabled: true,
      sectorTree: [],
      sectorOrgId: '',
      sectorName: '',
      sectorId: '',
      accreditDialog: false,
      accreditTree: [],
      skillDialog: false,
      skillData: [],
      oskillData: [],
      skillFilter: '',
      skillSelected: [],
      opeUpDis: true,
      upDialog: false,
      downDisabled: true,
      reqUrl: '',
      reqHead: {
        token: sessionStorage.getItem('wxWebToken'),
        user_id: sessionStorage.getItem('wxWebUserId')
      },
      fileList: []
    }
  },
  created () {
    // 获取组织树
    this.getOrganTree()
    // 获取列表
    // this.getListData()
    // 获取角色
    this.getRoleOptions()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(15) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(16) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(17) === -1 ? this.authority.del = false : this.authority.del = true
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        autDet: state => state.autDet.user
      }
    )
  },
  methods: {
    // 获取组织树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          const orgTree = res.data.data1
          this.orgTree = JSON.parse(JSON.stringify(orgTree))
          // 处理部门树
          const sectorData = this.initDisSecTree(JSON.parse(JSON.stringify(orgTree)))
          this.sectorTree = sectorData
          // 处理授权范围树
          const accreditData = this.initDisAccTree(JSON.parse(JSON.stringify(orgTree)))
          this.accreditTree = accreditData
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
    /* 初始化处理部门树开始 */
    initDisSecTree (treeData) {
      treeData.forEach(item => {
        if (item.organize_type !== 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
      return treeData
    },
    initRecSecTree (data) {
      data.forEach(item => {
        if (item.organize_type !== 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
    },
    /* 初始化处理部门树结束 */
    /* 初始化处理授权范围树开始 */
    initDisAccTree (treeData) {
      treeData.forEach(item => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecAccTree(item.children)
        }
      })
      return treeData
    },
    initRecAccTree (data) {
      data.forEach(item => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecAccTree(item.children)
        }
      })
    },
    /* 初始化处理授权范围树结束 */
    // 点击组织树
    handleNodeClick (data) {
      // 设置当前id
      this.orgId = data.id
      this.orgName = data.name
      this.orgType = data.organize_type
      this.orgBase = data.base_id
      // 可导入
      this.opeUpDis = false
      // 清空搜索框
      this.search = {
        name: '',
        phone: '',
        role: ''
      }
      this.nowSearch = {
        name: '',
        phone: '',
        role: ''
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
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
      let params = {
        organize_id: this.orgId,
        user_name: this.search.name,
        user_phone: this.search.phone,
        role_id: this.search.role,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.users
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
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: '',
        parSkillName: '',
        parSkillId: [],
        skillId: ''
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
        company_id: this.companyId,
        user_id: this.userId,
        user_name: this.addForm.name,
        user_phone: this.addForm.phone,
        ogz_id: this.addForm.sectorId,
        role_id: this.addForm.role,
        organize_ids: this.addForm.accreditId,
        skills_id: this.addForm.skillId
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/addUser',
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
        userN_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUserOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 授权范围
          const accredits = itemData.userOgzs
          let accreditName = []
          accredits.forEach(item => {
            accreditName.push(item.organize_name)
          })
          accreditName = accreditName.join('、')
          // 技能
          const skills = itemData.userSkls
          let skillName = []
          skills.forEach(item => {
            // skillName.push(item.all_name)
            skillName.push(item.parent_name)
          })
          skillName = skillName.join('、')
          this.detForm = {
            name: itemData.user_name,
            phone: itemData.user_phone,
            sector: itemData.organize_name,
            role: itemData.role_name,
            mac: itemData.card_mac || '',
            accredit: accreditName,
            skill: skillName
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
    /* 编辑 */
    comClick (id, mac) {
      this.itemId = id
      this.comDialog = true
      if (mac) {
        this.comSector = true
      } else {
        this.comSector = false
      }
      this.comForm = {
        name: '',
        ophone: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: '',
        parSkillName: '',
        parSkillId: [],
        skillId: ''
      }
      this.getComItem()
    },
    getComItem () {
      let params = {
        userN_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUserOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 授权范围
          const accredits = itemData.userOgzs
          let accreditName = []
          let accreditId = []
          accredits.forEach(item => {
            accreditName.push(item.organize_name)
            accreditId.push(item.organize_id)
          })
          accreditName = accreditName.join('、')
          accreditId = accreditId.join(',')
          // 技能
          const skills = itemData.userSkls
          let parSkillName = []
          let parSkillId = []
          let skillId = []
          skills.forEach(item => {
            parSkillName.push(item.parent_name)
            parSkillId.push(item.parent_sk_id)
            skillId.push(item.skills_id)
          })
          parSkillName = parSkillName.join('、')
          skillId = skillId.join(',')
          this.comForm = {
            name: itemData.user_name,
            ophone: itemData.user_phone,
            phone: itemData.user_phone,
            sectorName: itemData.organize_name,
            sectorId: itemData.ogz_id,
            role: itemData.role_id,
            accreditName: accreditName,
            accreditId: accreditId,
            parSkillName: parSkillName,
            parSkillId: parSkillId,
            skillId: skillId
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
        // company_id: this.companyId,
        user_id: this.userId,
        userN_id: this.itemId,
        user_name: this.comForm.name,
        old_phone: this.comForm.ophone,
        user_phone: this.comForm.phone,
        ogz_id: this.comForm.sectorId,
        role_id: this.comForm.role,
        organize_ids: this.comForm.accreditId,
        skills_id: this.comForm.skillId
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altUser',
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
        company_id: this.companyId,
        user_id: this.userId,
        userN_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/delUser',
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
    /* 绑卡 */
    bindClick (id, proid) {
      this.itemId = id
      this.proId = proid
      this.bindDialog = true
      this.bindForm = {
        mac: ''
      }
    },
    // 验证表单
    submitBindForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendBindRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetBindForm (formName) {
      this.$refs[formName].resetFields()
      this.bindDialog = false
    },
    // 提交
    sendBindRequest () {
      let mac = this.formatCardMac(this.bindForm.mac)
      let params = {
        company_id: this.companyId,
        project_id: this.proId,
        user_id: this.userId,
        bind_user: this.itemId,
        card_mac: mac,
        type: '1'
      }
      params = this.$qs.stringify(params)
      this.bindDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.5/setCardBind',
        data: params
      }).then((res) => {
        this.bindDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetBindForm('ruleBindForm')
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
        this.bindDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 格式化卡片mac
    formatCardMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      return value
      // value = value.replace(/(.{2})/g, '$1:')
      // const lastStr = value.charAt(value.length - 1)
      // return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    /* 解绑 */
    untieClick (id, proid, mac) {
      this.itemId = id
      this.proId = proid
      this.cardMac = mac
      this.untieDialog = true
    },
    submitUntieForm () {
      let mac = this.formatCardMac(this.cardMac)
      let params = {
        company_id: this.companyId,
        project_id: this.proId,
        user_id: this.userId,
        bind_user: this.itemId,
        card_mac: mac
      }
      params = this.$qs.stringify(params)
      this.untieDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.5/releaseBind',
        data: params
      }).then((res) => {
        this.untieDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.untieDialog = false
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
        this.untieDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 选择角色 */
    getRoleOptions () {
      let params = {
        company_id: this.companyId,
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
          const roleData = res.data.data1
          this.roleOptions = roleData
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
    /* 选择部门开始 */
    // 新增
    addSecClick () {
      this.sectorDialog = true
      this.sectorOrgId = ''
      this.sectorId = ''
      this.sectorName = ''
      setTimeout(() => {
        this.$refs.sectorTree.setCheckedKeys([])
      }, 100)
    },
    // 编辑
    comSecClick () {
      this.sectorDialog = true
      this.sectorOrgId = ''
      this.sectorId = ''
      this.sectorName = ''
      setTimeout(() => {
        this.$refs.sectorTree.setCheckedKeys([])
      }, 100)
    },
    // 选择
    secCheckChange (data, checked, self) {
      if (checked === true) {
        this.sectorOrgId = data.id
        this.sectorId = data.base_id
        this.sectorName = data.name
        this.$refs.sectorTree.setCheckedKeys([data.id])
      } else {
        if (this.sectorOrgId === data.id) {
          this.$refs.sectorTree.setCheckedKeys([data.id])
        }
      }
    },
    // 确定
    selectSector () {
      const sectorId = this.sectorId
      const sectorName = this.sectorName
      if (!sectorId) {
        this.$message({
          showClose: true,
          message: '请选择部门！',
          type: 'warning'
        })
        return
      }
      if (this.addDialog) {
        this.addForm.sectorName = sectorName
        this.addForm.sectorId = sectorId
      } else if (this.comDialog) {
        this.comForm.sectorName = sectorName
        this.comForm.sectorId = sectorId
      }
      this.sectorDialog = false
    },
    /* 选择部门结束 */
    /* 选择授权范围开始 */
    // 新增
    addAccClick () {
      this.accreditDialog = true
      let accreditId = this.addForm.accreditId
      let ids = []
      if (accreditId) {
        ids = accreditId.split(',')
      }
      setTimeout(() => {
        this.$refs.accreditTree.setCheckedKeys(ids)
      }, 100)
    },
    // 编辑
    comAccClick () {
      this.accreditDialog = true
      let accreditId = this.comForm.accreditId
      let ids = []
      if (accreditId) {
        ids = accreditId.split(',')
      }
      setTimeout(() => {
        this.$refs.accreditTree.setCheckedKeys(ids)
      }, 100)
    },
    // 确定
    selectAccredit () {
      const nodesData = this.$refs.accreditTree.getCheckedNodes()
      const keysData = this.$refs.accreditTree.getCheckedKeys()
      if (keysData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择授权范围！',
          type: 'warning'
        })
        return
      }
      let ids = []
      let names = []
      const firmNode = nodesData.find(item => {
        return item.organize_type === 1
      })
      if (firmNode) {
        ids.push(firmNode.id)
        names.push(firmNode.name)
      } else {
        nodesData.forEach(node => {
          const parentId = node.parent_id
          const state = keysData.find(id => {
            return id === parentId
          })
          if (state === undefined) {
            ids.push(node.id)
            names.push(node.name)
          }
        })
      }
      names = names.join('、')
      ids = ids.join(',')
      if (this.addDialog) {
        this.addForm.accreditName = names
        this.addForm.accreditId = ids
      } else if (this.comDialog) {
        this.comForm.accreditName = names
        this.comForm.accreditId = ids
      }
      this.accreditDialog = false
    },
    /* 选择授权范围结束 */
    /* 选择技能开始 */
    // 新增
    addSkillClick () {
      this.skillDialog = true
      // 清空搜索
      this.skillFilter = ''
      if (this.skillData.length === 0) {
        setTimeout(() => {
          const skills = []
          this.getSkillData(skills)
        }, 100)
      } else {
        // 清空选中项
        this.$refs.skillTable.clearSelection()
        let skillSelected = []
        // 切换选中
        const parSkillId = this.addForm.parSkillId
        this.skillData.forEach(item => {
          for (let i = 0; i < parSkillId.length; i++) {
            if (parSkillId[i] === item.id) {
              skillSelected.push(item)
              break
            }
          }
        })
        skillSelected.forEach(item => {
          this.$refs.skillTable.toggleRowSelection(item)
        })
        this.skillSelected = skillSelected
      }
    },
    // 编辑
    comSkillClick () {
      this.skillDialog = true
      // 清空搜索
      this.skillFilter = ''
      if (this.skillData.length === 0) {
        setTimeout(() => {
          const parSkillId = this.comForm.parSkillId
          this.getSkillData(parSkillId)
        }, 100)
      } else {
        let skillSelected = []
        // 切换选中
        const parSkillId = this.comForm.parSkillId
        this.skillData.forEach(item => {
          for (let i = 0; i < parSkillId.length; i++) {
            if (parSkillId[i] === item.id) {
              skillSelected.push(item)
              break
            }
          }
        })
        // 清空选中项
        this.$refs.skillTable.clearSelection()
        skillSelected.forEach(item => {
          this.$refs.skillTable.toggleRowSelection(item)
        })
        this.skillSelected = skillSelected
      }
    },
    // 获取技能
    getSkillData (skills) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selSkillTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.skillData = res.data.data1
          this.oskillData = res.data.data1
          // 清空选中项
          this.$refs.skillTable.clearSelection()
          // 切换选中
          let skillSelected = []
          this.skillData.forEach(item => {
            for (let i = 0; i < skills.length; i++) {
              if (skills[i] === item.id) {
                skillSelected.push(item)
                break
              }
            }
          })
          skillSelected.forEach(item => {
            this.$refs.skillTable.toggleRowSelection(item)
          })
          // 设置选择项
          this.skillSelected = skillSelected
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
    // 点击列表
    skillSelectChange (data) {
      this.skillSelected = data
    },
    // 确定
    selectSkill () {
      const skills = this.skillSelected
      let parSkillName = []
      let parSkillId = []
      let skillId = []
      skills.forEach(item => {
        parSkillName.push(item.name)
        parSkillId.push(item.id)
        skillId.push(item.children[0].id)
      })
      parSkillName = parSkillName.join('、')
      skillId = skillId.join(',')
      if (this.addDialog) {
        this.addForm.parSkillName = parSkillName
        this.addForm.parSkillId = parSkillId
        this.addForm.skillId = skillId
      } else if (this.comDialog) {
        this.comForm.parSkillName = parSkillName
        this.comForm.parSkillId = parSkillId
        this.comForm.skillId = skillId
      }
      this.skillDialog = false
    },
    /* 选择技能结束 */
    /* 导入 */
    upClick () {
      this.upDialog = true
      let params = {
        state: 13,
        organize_id: this.orgId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.sysetApi() + '/upload?' + params
      this.reqUrl = reqUrl
      // 清空导入文件提示
      this.fileList = []
    },
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 关闭导入框
        this.upDialog = false
        // 清空导入文件提示
        this.fileList = []
        // 刷新列表
        this.getListData()
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范且手机号是否重复！',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件导入失败！',
          type: 'error'
        })
      }
    },
    upFileError () {
      this.$message({
        showClose: true,
        message: '文件导入失败！',
        type: 'error'
      })
    },
    /* 下载 */
    // 下载模板
    downTemplate () {
      let params = {
        organize_id: this.orgId,
        organize_name: this.orgName,
        seltype: this.orgType,
        base_id: this.orgBase
      }
      params = this.$qs.stringify(params)
      window.location.href = this.sysetApi() + '/v3.4/userModelEO?' + params
    },
    // 导出文件
    downFile () {
      let params = {
        user_id: this.userId,
        organize_id: this.orgId,
        user_name: this.search.name,
        user_phone: this.search.phone,
        role_id: this.search.role
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.2/userEO?' + params
    }
  },
  filters: {
    filterMac (str) {
      if (!str) { return '-' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  },
  watch: {
    orgId (val, oldVal) {
      if (val) {
        this.opeUpDis = false
        this.downDisabled = false
      } else {
        this.opeUpDis = true
        this.downDisabled = true
      }
    },
    skillFilter (val, oldVal) {
      this.skillData = this.oskillData.filter(item => (~item.name.indexOf(val)))
    },
    sectorOrgId (val, oldVal) {
      if (val) {
        this.sectorDisabled = false
      } else {
        this.sectorDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .user{
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
        padding-top: 10px;
        padding-right: 0;
        padding-bottom: 10px;
        padding-left: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          padding: 5px;
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
            padding-top: 5px;
            padding-bottom: 5px;
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
  }
</style>
