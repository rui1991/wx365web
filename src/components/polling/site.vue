<template>
  <div class="site">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>地址管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            :data="siteTree"
            ref="siteTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            @check-change="siteCheckChange"
            @node-click="siteNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>地址名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="item">
                <span>地址编号</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.coding"></el-input>
              </div>
              <div class="operate">
                <el-button type="danger" v-if="authority.del" :disabled="handleDisabled" @click="delDialog = true">删除</el-button>
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" v-if="authority.add" @click="addClick">新增</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>地址类型</span>
                <el-select v-model="nowSearch.type" style="width: 160px;" clearable placeholder="请选择地址类型">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="qrDisabled" @click="qrcodeClick">生成二维码</el-button>
                <el-button type="primary" v-if="authority.add" @click="upClick">导入</el-button>
                <el-button type="primary" v-if="authority.add" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="position_id" label="地址编号"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" label="地址名称">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.position_id)">{{ scope.row.position_name }}</a>
              </template>
            </el-table-column>
            <el-table-column label="地址标签">
              <template slot-scope="scope">
                <span>{{ scope.row.position_mac | filterMac }}</span>
              </template>
            </el-table-column>
            <el-table-column label="设备电量">
              <template slot-scope="scope">
                <span v-if="scope.row.node_btpw === undefined">-</span>
                <span v-else>{{ scope.row.node_btpw }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="区域类型">
              <template slot-scope="scope">
                <span v-if="scope.row.area_type === 1">办公室区域</span>
                <span v-else-if="scope.row.area_type === 2">工作区域</span>
                <span v-else-if="scope.row.area_type === 6">固定岗位</span>
              </template>
            </el-table-column>
            <el-table-column label="上级地址">
              <template slot-scope="scope">
                <span v-if="scope.row.parent_address">{{ scope.row.parent_address }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.position_id)"  v-if="authority.com">编辑</a>
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
    <div id="qrcode" v-show="false">
      <vue-qr :text="item.value" :size="200" :margin="0" :logoMargin="2" v-for="item in qrValues" :key="item.id"></vue-qr>
    </div>
    <!-- 新增 -->
    <el-dialog title="新增地址" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="上级地址" prop="parentPath">
          <el-input :disabled="true" v-model="addForm.parentPath"></el-input>
        </el-form-item>
        <el-form-item label="地址名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="区域类型" prop="areaType">
          <el-radio-group v-model="addForm.areaType">
            <el-radio :label="1">办公室区域</el-radio>
            <el-radio :label="2">工作区域</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址类型" prop="type">
          <el-select style="width: 100%;" v-model="addForm.type" placeholder="请选择地址类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址标签" prop="mac">
          <el-input v-model.trim="addForm.mac" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="关联标准" prop="norm">
          <el-select style="width: 100%;" v-model="addForm.norm"  clearable filterable placeholder="请选择标准">
            <el-option
              v-for="item in normData"
              :key="item.template_id"
              :label="item.template_name"
              :value="item.template_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="全路径" prop="allPath">
          <el-input :disabled="true" v-model="addForm.allPath"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="addForm.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="地址详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="detForm" :label-width="formLabelWidth">
        <el-form-item label="上级地址">
          <el-input :disabled="true" v-model="detForm.parentPath"></el-input>
        </el-form-item>
        <el-form-item label="地址名称">
          <el-input :disabled="true" v-model="detForm.name"></el-input>
        </el-form-item>
        <el-form-item label="区域类型">
          <el-input :disabled="true" v-model="detForm.areaType"></el-input>
        </el-form-item>
        <el-form-item label="地址类型">
          <el-input :disabled="true" v-model="detForm.type"></el-input>
        </el-form-item>
        <el-form-item label="地址标签">
          <el-input :disabled="true" v-model="detForm.mac"></el-input>
        </el-form-item>
        <el-form-item label="关联标准">
          <el-input :disabled="true" v-model="detForm.norm"></el-input>
        </el-form-item>
        <el-form-item label="全路径">
          <el-input :disabled="true" v-model="detForm.allPath"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :disabled="true" v-model="detForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑地址" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="上级地址" prop="parentPath">
          <el-input :disabled="true" v-model="comForm.parentPath"></el-input>
        </el-form-item>
        <el-form-item label="地址名称" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="区域类型" prop="areaType">
          <el-radio-group v-model="comForm.areaType">
            <el-radio :label="1">办公室区域</el-radio>
            <el-radio :label="2">工作区域</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址类型" prop="type">
          <el-select style="width: 100%;" v-model="comForm.type" placeholder="请选择地址类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址标签" prop="mac">
          <el-input v-model.trim="comForm.mac" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="关联标准" prop="norm">
          <el-select style="width: 100%;" v-model="comForm.norm" clearable filterable placeholder="请选择标准">
            <el-option
              v-for="item in normData"
              :key="item.template_id"
              :label="item.template_name"
              :value="item.template_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="全路径" prop="allPath">
          <el-input :disabled="true" v-model="comForm.allPath"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="comForm.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除选中的地址？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog title="导入地址" :visible.sync="upDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
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
        <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑地址信息</p>
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
import VueQr from 'vue-qr'
export default{
  name: 'site',
  data () {
    let checkMac = (rule, value, callback) => {
      let regex = /^[a-zA-Z0-9]{8,12}$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac格式有误，请认真核对'))
        }
      } else {
        callback()
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
        coding: '',
        type: ''
      },
      nowSearch: {
        name: '',
        coding: '',
        type: ''
      },
      typeOptions: [
        {
          label: '巡检地址',
          value: 0
        },
        {
          label: '固定岗位',
          value: 6
        }
      ],
      siteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      siteName: '',
      siteId: 0,
      allPath: '',
      depth: -1,
      tableData: [],
      multipleSelection: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      addForm: {
        parentPath: '',
        name: '',
        areaType: 2,
        type: 0,
        mac: '',
        norm: '',
        allPath: '',
        remark: ''
      },
      addDisabled: false,
      detDialog: false,
      detForm: {
        parentPath: '',
        name: '',
        areaType: '',
        type: '',
        mac: '',
        norm: '',
        allPath: '',
        remark: ''
      },
      comDialog: false,
      comForm: {
        parentId: '',
        parentPath: '',
        name: '',
        areaType: '',
        type: '',
        mac: '',
        norm: '',
        allPath: '',
        remark: ''
      },
      comDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ],
        areaType: [
          { required: true, message: '请选择区域类型', trigger: 'change' }
        ],
        mac: [
          { validator: checkMac, trigger: 'blur' }
        ]
      },
      formLabelWidth: '100px',
      normData: [],
      delDialog: false,
      handleDisabled: true,
      delDisabled: false,
      itemId: '',
      upDialog: false,
      downDisabled: false,
      reqUrl: '',
      reqHead: {
        token: sessionStorage.getItem('wxWebToken'),
        user_id: sessionStorage.getItem('wxWebUserId')
      },
      fileList: [],
      qrDisabled: true,
      qrUrl: this.baseUrl() + '/posdet/#/details',
      qrValues: []
    }
  },
  created () {
    // 获取地址树
    this.getSiteTree()
    // 获取列表
    this.getListData()
    // 获取标准
    this.getNormData()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(26) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(27) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(28) === -1 ? this.authority.del = false : this.authority.del = true
  },
  components: {
    VueQr
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowProname: state => state.nowProname,
        autDet: state => state.autDet.site
      }
    )
  },
  methods: {
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
          this.siteTree = [
            {
              'id': 0,
              'name': this.nowProname,
              'depth': -1,
              'children': treeData
            }
          ]
          if (b) {
            this.$refs.siteTree.setCheckedKeys([this.siteId])
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
    // 点击地址树
    siteCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.siteId === data.id) {
          return
        }
        this.$refs.siteTree.setCheckedKeys([data.id])
        // 设置当前id和层级
        this.siteId = data.id
        this.depth = data.depth
        // 清空搜索框
        this.search = {
          name: '',
          coding: '',
          type: ''
        }
        this.nowSearch = {
          name: '',
          coding: '',
          type: ''
        }
        // 当前页码初始化
        this.nowPage = 1
        if (data.id === 0) {
          this.siteName = ''
          // 路径
          this.allPath = ''
          // 获取列表数据
          this.getListData()
          return
        }
        // 当前name
        this.siteName = data.name
        // 获取全路径
        this.getAllPath(data.id)
      } else {
        if (this.siteId === data.id) {
          this.$refs.siteTree.setCheckedKeys([data.id])
        }
      }
    },
    siteNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.siteTree.setCheckedKeys([data.id])
      // 设置当前id和层级
      this.siteId = data.id
      this.depth = data.depth
      // 清空搜索框
      this.search = {
        name: '',
        coding: '',
        type: ''
      }
      this.nowSearch = {
        name: '',
        coding: '',
        type: ''
      }
      // 当前页码初始化
      this.nowPage = 1
      if (data.id === 0) {
        this.siteName = ''
        // 路径
        this.allPath = ''
        // 获取列表数据
        this.getListData()
        return
      }
      // 当前name
      this.siteName = data.name
      // 获取全路径
      this.getAllPath(data.id)
    },
    // 获取全路径
    getAllPath (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 路径
          this.allPath = res.data.data1.all_address
          // 获取列表数据
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
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 清空选中数据
      // name
      this.siteName = ''
      // id
      this.siteId = 0
      // 全路径
      this.allPath = ''
      // 层级
      this.depth = -1
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
        position_id: this.siteId,
        parent_address: this.allPath,
        position_type: this.search.type,
        s_po_name: this.search.name,
        s_po_mark: this.search.coding,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionChild',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.ogz
          // 清空选中项
          this.multipleSelection = []
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
      let allPath = this.allPath
      if (allPath) {
        allPath = allPath + '>'
      }
      this.addForm = {
        parentPath: this.allPath,
        name: '',
        areaType: 2,
        type: 0,
        mac: '',
        norm: '',
        allPath: allPath,
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
      let mac = this.addForm.mac
      mac = this.formatSetMac(mac)
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        parent_po_id: this.siteId,
        parent_address: this.addForm.parentPath,
        position_name: this.addForm.name,
        area_type: this.addForm.areaType,
        position_type: this.addForm.type,
        position_mac: mac,
        template_id: this.addForm.norm || 0,
        all_address: this.addForm.allPath,
        instructions: this.addForm.remark,
        depth: this.depth + 1
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addPosition',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
          // 刷新树
          this.getSiteTree()
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
        position_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 区域类型
          const areaNum = itemData.area_type || ''
          let areaType = ''
          if (areaNum === 1) {
            areaType = '办公室区域'
          } else if (areaNum === 2) {
            areaType = '工作区域'
          }
          // 地址类型
          const typeNum = itemData.position_type
          let type = ''
          if (typeNum === 0) {
            type = '巡检地址'
          } else if (typeNum === 6) {
            type = '固定岗位'
          }
          // Mac地址
          let mac = itemData.position_mac
          mac = this.formatGetMac(mac)
          this.detForm = {
            parentPath: itemData.parent_address,
            name: itemData.position_name,
            areaType: areaType,
            type: type,
            mac: mac,
            norm: itemData.template_name || '',
            allPath: itemData.all_address,
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
      let allPath = this.allPath
      if (allPath) {
        allPath = allPath + '>'
      }
      this.comForm = {
        parentId: this.siteId,
        parentPath: this.allPath,
        name: '',
        areaType: '',
        type: '',
        mac: '',
        norm: '',
        allPath: allPath,
        remark: ''
      }
      this.getComItem()
    },
    getComItem () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // Mac地址
          let mac = itemData.position_mac
          mac = this.formatGetMac(mac)
          this.comForm = {
            parentId: itemData.parent_po_id,
            parentPath: itemData.parent_address,
            name: itemData.position_name,
            areaType: itemData.area_type || '',
            type: itemData.position_type,
            mac: mac,
            norm: itemData.template_id || '',
            allPath: itemData.all_address,
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
      let mac = this.comForm.mac
      mac = this.formatSetMac(mac)
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.itemId,
        parent_po_id: this.comForm.parentId,
        position_name: this.comForm.name,
        area_type: this.comForm.areaType,
        position_type: this.comForm.type,
        position_mac: mac,
        template_id: this.comForm.norm || 0,
        all_address: this.comForm.allPath,
        instructions: this.comForm.remark
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/alterPosition',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetComForm('ruleComForm')
          // 刷新树
          this.getSiteTree()
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
    // 格式化获取Mac地址
    formatGetMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    // 格式化设置Mac地址
    formatSetMac (str) {
      const mac = str.replace(/:/g, '')
      let value = mac.toLowerCase()
      return value
    },
    /* 删除 */
    // 获取选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    submitDelForm () {
      let ids = []
      this.multipleSelection.map((item) => {
        ids.push(item.position_id)
      })
      ids = ids.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: ids
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/delPosition',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏弹框
          this.delDialog = false
          // 刷新树
          this.getSiteTree()
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
    /* 获取标准 */
    getNormData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateBySearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let normData = res.data.data1.templates || []
          this.normData = normData
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
    /* 导入 */
    upClick () {
      this.upDialog = true
      let params = {
        state: 12,
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        parent_po_id: this.siteId,
        parent_address: this.allPath,
        depth: this.depth + 1
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.sysetApi() + '/upload?' + params
      this.reqUrl = reqUrl
      // 清空导入文件提示
      this.fileList = []
    },
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        // [{"msg":"0","filename":"20190114111721866.xls","errorMsg":""}]
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 关闭导入框
        this.upDialog = false
        // 清空导入文件提示
        this.fileList = []
        // 刷新树
        this.getSiteTree()
        // 刷新列表
        this.getListData()
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范且名称和MAC地址是否重复！',
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        filename: 'PositionModule.xls'
      }
      params = this.$qs.stringify(params)
      window.location.href = this.sysetApi() + '/download?filepath=/data/wx365/ExcelIn/&' + params
    },
    // 导出文件
    downFile () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        parent_address: this.allPath,
        depth: this.depth + 1
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/positionEO?' + params
    },
    /* 生成二维码 */
    qrcodeClick () {
      let qrValues = []
      this.multipleSelection.forEach((item) => {
        qrValues.push(
          {
            id: item.position_id,
            name: item.position_name,
            value: this.qrUrl + '?proid=' + this.nowProid + '&posid=' + item.position_id
          }
        )
      })
      this.qrValues = qrValues
      setTimeout(() => {
        this.downQrcode()
      }, 500)
    },
    downQrcode () {
      const qrValues = this.qrValues
      const eles = document.querySelectorAll('#qrcode img')
      for (let i = 0; i < qrValues.length; i++) {
        const iconUrl = eles[i].src
        let a = document.createElement('a')
        let event = new MouseEvent('click')
        a.download = qrValues[i].name
        a.href = iconUrl
        a.dispatchEvent(event)
      }
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
    'addForm.name' (newVal, oldVal) {
      let parentPath = this.addForm.parentPath
      if (parentPath) {
        parentPath = parentPath + '>'
      }
      this.addForm.allPath = parentPath + newVal
    },
    'comForm.name' (newVal, oldVal) {
      let parentPath = this.comForm.parentPath
      if (parentPath) {
        parentPath = parentPath + '>'
      }
      this.comForm.allPath = parentPath + newVal
    },
    multipleSelection (newVal, oldVal) {
      if (newVal.length > 0) {
        this.handleDisabled = false
        this.qrDisabled = false
      } else {
        this.handleDisabled = true
        this.qrDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.site{
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
<<<<<<< HEAD
      padding: 10px;
=======
      padding-top: 10px;
      padding-right: 0;
      padding-bottom: 10px;
      padding-left: 10px;
>>>>>>> 2019-07-06日更新
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
<<<<<<< HEAD
        padding-left: 20px;
        padding-top: 0;
        padding-right: 0;
        padding-bottom: 0;
=======
        padding-top: 0;
        padding-right: 10px;
        padding-bottom: 0;
        padding-left: 20px;
        overflow: scroll;
>>>>>>> 2019-07-06日更新
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
  .mult-dialog{
    .el-dialog__header{
      display: none;
    }
  }
}
</style>
