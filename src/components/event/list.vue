<template>
  <div class="event-list">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>事件管理</el-breadcrumb-item>
          <el-breadcrumb-item>事件列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>事件名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>事件状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择事件状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>创建人员</span>
              <el-select v-model="nowSearch.creCrew" style="width: 160px;" clearable filterable placeholder="请选择创建人员">
                <el-option
                  v-for="item in crewOptions"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
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
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="事件名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row.te_id)">{{ scope.row.event_title }}</a>
            </template>
          </el-table-column>
          <el-table-column label="事件类型">
            <template slot-scope="scope">
              <span v-if="scope.row.event_type === '0'">设备</span>
              <span v-else-if="scope.row.event_type === '1'">公告</span>
              <span v-else-if="scope.row.event_type === '6'">日常</span>
            </template>
          </el-table-column>
          <el-table-column label="事件状态">
            <template slot-scope="scope">
              <span v-if="scope.row.event_state === 1">已处理</span>
              <span v-else>未处理</span>
            </template>
          </el-table-column>
          <el-table-column label="紧急程度">
            <template slot-scope="scope">
              <span v-if="scope.row.event_level === 0">一般</span>
              <span v-else-if="scope.row.event_level === 1">重要</span>
              <span v-else-if="scope.row.event_level === 2">紧急</span>
            </template>
          </el-table-column>
          <el-table-column prop="user_name" label="创建人"></el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatReplyTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="addMesClick(scope.row.te_id, scope.row.user_id)">追加消息</a>
              <span class="operate forbid" v-if="scope.row.event_state === 1">已处理</span>
              <a href="javascript:void(0);" class="operate com" @click="disposeClick(scope.row.te_id)" v-else-if="scope.row.user_id === userId">处理</a>
              <span class="operate forbid" v-else>处理</span>
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
    <el-dialog title="新增事件" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="事件名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="addForm.type" @change="typeChange" placeholder="请选择事件类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件状态" prop="state">
          <el-select v-model="addForm.state" placeholder="请选择事件状态">
            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件紧急" prop="level">
          <el-select v-model="addForm.level" :disabled="leveDisabled" placeholder="请选择事件紧急">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发生位置" prop="site">
          <el-input v-model="addForm.site"></el-input>
          <el-button type="primary" @click="siteClick">选择地址</el-button>
        </el-form-item>
        <el-form-item label="提醒给谁" prop="crew">
          <el-select v-model="addForm.crew" multiple collapse-tags placeholder="请选择提醒人员">
            <el-option v-for="item in crewOptions" :key="item.user_id" :label="item.user_name" :value="item.user_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件内容" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="addForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :file-list="fileList"
        :multiple="true"
        :limit="imgLimit"
        list-type="picture">
        <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip" style="padding-left: 100px; color: red;">只能上传jpg/png文件，大小不超过2048kb，且最多只能上传9张！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="事件详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h4 class="form-title">事件详情</h4>
      <el-form :model="detForm" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece">
        <div class="two-form">
          <el-form-item class="item" label="事件名称">
            <el-input :disabled="true" v-model="detForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="事件状态">
            <el-input :disabled="true" v-model="detForm.state"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="detForm.cerCrew"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="detForm.creaTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="事件类型">
            <el-input :disabled="true" v-model="detForm.type"></el-input>
          </el-form-item>
          <el-form-item class="item" label="事件紧急">
            <el-input :disabled="true" v-model="detForm.level"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="发生位置">
          <el-input :disabled="true" v-model="detForm.site"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="备注">
          <el-input :disabled="true" type="textarea" maxlength="100" v-model="detForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <h4 class="form-title">图片</h4>
      <div class="show-img">
        <div class="images">
          <img :src="item" v-for="item in detForm.images" :key="item" height="120" alt="">
        </div>
        <p class="img-hint" v-if="detForm.images.length === 0">未上传图片</p>
      </div>
      <el-table class="select-table" :data="detForm.logData" style="width: 100%;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="user_name" width="100" label="回复人"></el-table-column>
        <el-table-column label="回复时间">
          <template slot-scope="scope">
            <span>{{ scope.row.discuss_time | formatReplyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="replay" label="回复内容" class-name="multi-row"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 地址 -->
    <el-dialog title="选择地址" :visible.sync="siteDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="siteData"
        ref="siteTree"
        :highlight-current="siteHighlight"
        node-key="id"
        :props="defaultProps"
        @node-click="handleNodeClick">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="siteDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectSite">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 追加消息 -->
    <el-dialog title="追加消息" :visible.sync="mesDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="mesForm" :rules="mesRules" ref="ruleMesForm" :label-width="formLabelWidth">
        <el-form-item label="消息" prop="content">
          <el-input type="textarea" v-model.trim="mesForm.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetMesForm('ruleMesForm')">取 消</el-button>
        <el-button type="primary" :disabled="mesDisabled" @click="submitMesForm('ruleMesForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'event',
  data () {
    return {
      search: {
        name: '',
        state: '',
        creCrew: '',
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        name: '',
        state: '',
        creCrew: '',
        startDate: '',
        endDate: ''
      },
      stateOptions: [
        {
          label: '已处理',
          value: '1'
        },
        {
          label: '未处理',
          value: '2'
        }
      ],
      leveDisabled: false,
      crewOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      formLabelWidth: '100px',
      addDialog: false,
      addForm: {
        name: '',
        type: '6',
        state: '2',
        level: '0',
        site: '',
        crew: [],
        remark: ''
      },
      addDisabled: false,
      typeOptions: [
        {
          label: '设备',
          value: '0'
        },
        {
          label: '公告',
          value: '1'
        },
        {
          label: '日常',
          value: '6'
        }
      ],
      levelOptions: [
        {
          label: '一般',
          value: '0'
        },
        {
          label: '重要',
          value: '1'
        },
        {
          label: '紧急',
          value: '2'
        }
      ],
      rules: {
        name: [
          { required: true, message: '请输入事件名称', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入事件内容', trigger: 'blur' }
        ]
      },
      detDialog: false,
      detForm: {
        name: '',
        state: '',
        cerCrew: '',
        creaTime: '',
        type: '',
        level: '',
        site: '',
        remark: '',
        images: [],
        logData: []
      },
      siteDialog: false,
      siteData: [],
      siteHighlight: true,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      siteId: '',
      reqUrl: '',
      imgLimit: 9,
      fileList: [],
      itemId: '',
      itemUId: '',
      mesDialog: false,
      mesForm: {
        content: ''
      },
      mesDisabled: false,
      mesRules: {
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 设置上传图片地址
    this.reqUrl = this.sysetApi() + '/upload?state=2&user_id=' + this.userId
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
        userName: state => state.info.userName,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.shift
      }
    )
  },
  filters: {
    formatReplyTime (value) {
      if (!value) return ''
      const index = value.indexOf('.')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    }
  },
  methods: {
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
          this.crewOptions = crewData
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
        eventString: this.search.name,
        event_state: this.search.state,
        userN_id: this.search.creCrew,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/findIEventCom',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.eventMain
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
        type: '6',
        state: '2',
        level: '0',
        site: '',
        crew: [],
        remark: ''
      }
      this.fileList = []
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
      const fileList = this.fileList
      let fileName = []
      fileList.forEach(item => {
        fileName.push(item.response)
      })
      let imgUrls = fileName.join('/')
      if (imgUrls) {
        imgUrls = '/' + imgUrls
      }
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        event_title: this.addForm.name,
        event_type: this.addForm.type,
        event_state: this.addForm.state,
        event_level: this.addForm.level,
        atuserid: this.addForm.crew.join(','),
        atgroupid: '',
        event_content: this.addForm.remark,
        address: this.addForm.site,
        user_name: this.userName,
        add_info: imgUrls
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/addIEventNew',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
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
    // 选择类型
    typeChange () {
      const type = this.addForm.type
      if (type === '1') {
        this.addForm.level = '2'
        this.leveDisabled = true
      } else {
        this.leveDisabled = false
      }
    },
    /* 地址 */
    siteClick () {
      this.siteDialog = true
      // 清空选中
      this.siteId = ''
      // 取消高亮
      this.siteHighlight = false
      if (this.siteData.length === 0) {
        setTimeout(() => {
          this.getSiteData()
        }, 100)
      }
    },
    // 获取地址树
    getSiteData () {
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
          this.siteData = res.data.data1
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
    handleNodeClick (data) {
      this.siteId = data.id
      // 设置高亮
      this.siteHighlight = true
    },
    // 选择
    selectSite () {
      if (this.siteId) {
        this.getAllPath()
      } else {
        this.addForm.site = ''
        this.siteDialog = false
      }
    },
    // 获取全路径
    getAllPath () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.siteId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 路径
          let allPath = res.data.data1.all_address
          this.addForm.site = allPath
          this.siteDialog = false
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
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      this.fileList = fileList
    },
    // 上传图片失败
    handleError () {
      this.$message({
        showClose: true,
        message: '上传图片失败，请稍后再试！',
        type: 'error'
      })
    },
    // 删除图片
    handleRemove (file, fileList) {
      this.fileList = fileList
    },
    /* 详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        te_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/getEventToAll',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 事件状态
          const stateNum = itemData.event_state
          let state = ''
          if (stateNum === 1) {
            state = '已处理'
          } else {
            state = '未处理'
          }
          // 创建时间
          const creaTime = itemData.create_time
          // 类型
          const typpeNum = itemData.event_type
          let type = ''
          if (typpeNum === 0) {
            type = '设备'
          } else if (typpeNum === 1) {
            type = '公告'
          } else if (typpeNum === 6) {
            type = '日常'
          }
          // 事件紧急
          let levelNum = itemData.event_level
          let level = ''
          if (levelNum === 0) {
            level = '一般'
          } else if (levelNum === 1) {
            level = '重要'
          } else if (levelNum === 2) {
            level = '紧急'
          }
          // 图片
          let photo = itemData.add_info || []
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=2&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.discussloong || []
          this.detForm = {
            name: itemData.event_title,
            state: state,
            cerCrew: itemData.user_name,
            creaTime: creaTime,
            type: type,
            level: level,
            site: itemData.address,
            remark: itemData.event_content,
            images: images,
            logData: logData
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
    /* 追加日志 */
    addMesClick (id, uid) {
      this.itemId = id
      this.itemUId = uid
      this.mesDialog = true
      this.mesForm = {
        content: ''
      }
    },
    // 验证表单
    submitMesForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendMesRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetMesForm (formName) {
      this.$refs[formName].resetFields()
      this.mesDialog = false
    },
    // 提交
    sendMesRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        te_id: this.itemId,
        replay: this.mesForm.content,
        touser_id: this.itemUId,
        toreplayId: ''
      }
      params = this.$qs.stringify(params)
      this.mesDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/addDiscuss',
        data: params
      }).then((res) => {
        this.mesDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetMesForm('ruleMesForm')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.mesDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 处理 */
    disposeClick (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        te_id: id,
        event_state: '1'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/updateEventCom',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '处理成功',
            type: 'success'
          })
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
.event-list{
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
  .large-dialog{
    .el-dialog__body{
      .form-title{
        height: 45px;
        line-height: 45px;
        font-size: 16px;
        color: #272727;
      }
      .show-img{
        padding-bottom: 10px;
        border-bottom: 1px solid #cecece;
        margin-bottom: 20px;
        .images{
          text-align: center;
          img{
            margin: 5px;
          }
        }
        .img-hint{
          height: 35px;
          line-height: 35px;
          text-align: center;
        }
      }
      .show-table{
        margin-top: 10px;
        border-radius: 4px;
        border: 1px solid #cecece;
      }
    }
  }
}
</style>
