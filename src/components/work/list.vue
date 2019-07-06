<template>
  <div class="work-list">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>工单管理</el-breadcrumb-item>
          <el-breadcrumb-item>工单列表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>工单名称</span>
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
          <div class="search-input">
            <div class="item">
              <span>工单来源</span>
              <el-select v-model="nowSearch.source" clearable style="width: 160px;" placeholder="请选择工单来源">
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>业务类别</span>
              <el-select v-model="nowSearch.sort" clearable style="width: 160px;" placeholder="请选择业务类别">
                <el-option v-for="item in sortOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="item">
              <span>执行人员</span>
              <el-select v-model="nowSearch.crews" style="width: 160px;" multiple collapse-tags placeholder="请选择执行人员">
                <el-option
                  v-for="item in crewOptions"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="downDisabled" @click="downWork">导出</el-button>
            </div>
          </div>
        </div>
        <el-tabs v-model="navActive" style="margin-top: 10px;" @tab-click="tabClick">
          <el-tab-pane label="我的工单" name="5"></el-tab-pane>
          <el-tab-pane label="待处理" name="0"></el-tab-pane>
          <el-tab-pane label="跟进中" name="1"></el-tab-pane>
          <el-tab-pane label="催单列表" name="6"></el-tab-pane>
          <el-tab-pane label="未完成" name="4"></el-tab-pane>
          <el-tab-pane label="超时工单" name="7"></el-tab-pane>
          <el-tab-pane label="结案关闭" name="8"></el-tab-pane>
          <el-tab-pane label="全部" name="9"></el-tab-pane>
        </el-tabs>
        <router-view :parentSearch="search" @parentDetails="checkDetails"></router-view>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增工单" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="工单名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="发生地址" prop="site">
          <el-input v-model="addForm.site"></el-input>
          <el-button type="primary" @click="siteClick">选择地址</el-button>
        </el-form-item>
        <el-form-item label="业务类别" prop="sort">
          <el-select style="width: 100%;" v-model="addForm.sort" clearable placeholder="请选择业务类别">
            <el-option
              v-for="item in sortOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="派单" prop="crew">
          <el-select style="width: 100%;" v-model="addForm.crew" clearable placeholder="请选择执行人员">
            <el-option
              v-for="item in crewOptions"
              :key="item.user_id"
              :label="item.user_name"
              :value="item.user_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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
    <el-dialog title="工单详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h4 class="form-title">工单详情</h4>
      <el-form :model="detForm" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece">
        <div class="two-form">
          <el-form-item class="item" label="工单名称">
            <el-input :disabled="true" v-model="detForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="流水号">
            <el-input :disabled="true" v-model="detForm.mark"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="所属项目">
            <el-input :disabled="true" v-model="detForm.project"></el-input>
          </el-form-item>
          <el-form-item class="item" label="发生位置">
            <el-input :disabled="true" v-model="detForm.site"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="业务类别">
            <el-input :disabled="true" v-model="detForm.sort"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单来源">
            <el-input :disabled="true" v-model="detForm.source"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="detForm.creaTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="detForm.cerName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="当前处理人">
            <el-input v-model="detForm.conductor" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item class="item" label="工单状态">
            <el-input v-model="detForm.state" :disabled="true"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="备注">
          <el-input type="textarea" v-model="detForm.remark" :disabled="true"></el-input>
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
        <el-table-column prop="type" width="100" label="操作类型"></el-table-column>
        <el-table-column prop="user_name" width="80" label="执行人"></el-table-column>
        <el-table-column label="执行时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.perform_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column width="100" label="图片">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="com" v-if="scope.row.photo" @click="checkImg(scope.row.photo)">查看</a>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 查看图片 -->
    <el-dialog title="日志图片" :visible.sync="imgDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div style="text-align: center; overflow-x: hidden;">
        <img :src="logImg" height="380" alt="">
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="imgDialog = false">关 闭</el-button>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'work',
  data () {
    return {
      search: {
        name: '',
        startDate: '',
        endDate: '',
        source: '',
        sort: '',
        crews: '0'
      },
      nowSearch: {
        name: '',
        startDate: '',
        endDate: '',
        source: '',
        sort: '',
        crews: []
      },
      sourceOptions: [
        {
          label: '巡检',
          value: '巡检'
        },
        {
          label: '维修报修',
          value: '维修报修'
        },
        {
          label: '第三方',
          value: '第三方'
        }
      ],
      sortOptions: [],
      crewOptions: [],
      formLabelWidth: '100px',
      addDialog: false,
      addForm: {
        name: '',
        site: '',
        sort: '',
        crew: '',
        remark: '',
        imgs: ''
      },
      addDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入工单名称', trigger: 'blur' }
        ]
      },
      detDialog: false,
      detForm: {
        name: '',
        mark: '',
        project: '',
        site: '',
        sort: '',
        source: '',
        creaTime: '',
        cerName: '',
        conductor: '',
        state: '',
        remark: '',
        images: [],
        logData: []
      },
      imgDialog: false,
      logImg: '',
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
      downDisabled: false
    }
  },
  created () {

  },
  mounted () {
    // 设置上传地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id' + this.userId
    // 获取业务类别
    this.getSortOptions()
    // 获取项目人员
    this.getCrewOptions()
    // 跳转路由
    this.skipChildRouter()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.shift
      }
    ),
    navActive: {
      get () {
        return this.$store.state.workNavActive
      },
      set (value) {
        this.$store.commit('setWorkNav', value)
      }
    }
  },
  methods: {
    // 获取业务类别
    getSortOptions () {
      let params = {
        company_id: this.nowClientId,
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
          let sortData = res.data.data1
          let sortOptions = []
          sortData.forEach(item => {
            sortOptions.push({
              name: item.name,
              id: item.id
            })
          })
          this.sortOptions = sortOptions
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
    // 初始化跳转
    skipChildRouter () {
      const type = this.navActive
      switch (type) {
        case '5':
          this.$router.push({ path: '/main/work/oneself' })
          break
        case '0':
          this.$router.push({ path: '/main/work/pending' })
          break
        case '1':
          this.$router.push({ path: '/main/work/follow' })
          break
        case '6':
          this.$router.push({ path: '/main/work/reminder' })
          break
        case '4':
          this.$router.push({ path: '/main/work/undone' })
          break
        case '7':
          this.$router.push({ path: '/main/work/overtime' })
          break
        case '8':
          this.$router.push({ path: '/main/work/finish' })
          break
        case '9':
          this.$router.push({ path: '/main/work/all' })
          break
      }
    },
    // 切换类型
    tabClick (data) {
      const type = data.name
      switch (type) {
        case '5':
          // 我的工单
          this.$router.push({ path: '/main/work/oneself' })
          break
        case '0':
          // 待处理
          this.$router.push({ path: '/main/work/pending' })
          break
        case '1':
          // 跟进中
          this.$router.push({ path: '/main/work/follow' })
          break
        case '6':
          // 催单列表
          this.$router.push({ path: '/main/work/reminder' })
          break
        case '4':
          // 未完成
          this.$router.push({ path: '/main/work/undone' })
          break
        case '7':
          // 超时工单
          this.$router.push({ path: '/main/work/overtime' })
          break
        case '8':
          // 结案关闭
          this.$router.push({ path: '/main/work/finish' })
          break
        case '9':
          // 全部
          this.$router.push({ path: '/main/work/all' })
          break
      }
    },
    // 搜索
    searchList () {
      let crews = this.nowSearch.crews
      if (crews.length > 0) {
        crews = crews.join(',')
      } else {
        crews = '0'
      }
      this.search = {
        name: this.nowSearch.name,
        startDate: this.nowSearch.startDate,
        endDate: this.nowSearch.endDate,
        source: this.nowSearch.source,
        sort: this.nowSearch.sort,
        crews: crews
      }
    },
    /* 新增 */
    addClick () {
      this.addDialog = true
      this.addForm = {
        name: '',
        site: '',
        sort: '',
        crew: '',
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
      const imgUrls = fileName.join('/')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        wo_name: this.addForm.name,
        address: this.addForm.site,
        business_type: this.addForm.sort,
        content: this.addForm.remark,
        wo_from: '维修报修',
        accept_user: this.addForm.crew,
        isd_id: '',
        attachment: imgUrls
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/addWo',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
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
        wo_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWoOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 创建时间
          const creaTime = this.$common.formatDate(itemData.create_time)
          const stateNum = itemData.wo_state
          // 工单状态
          let state = ''
          if (stateNum === 0) {
            state = '待处理'
          } else if (stateNum === 1) {
            state = '跟进中'
          } else if (stateNum === 2) {
            state = '结单'
          }
          // 图片
          let photo = itemData.photo || ''
          if (photo) {
            photo = photo.split(',')
          } else {
            photo = []
          }
          let images = []
          photo.forEach(item => {
            let imgItem = this.sysetApi() + '/showImage?state=10&filename=' + item
            images.push(imgItem)
          })
          // 日志
          let logData = itemData.wo_log || []
          this.detForm = {
            name: itemData.wo_name,
            mark: itemData.serial_number,
            project: itemData.project_name,
            site: itemData.address,
            sort: itemData.skills_name || '',
            source: itemData.wo_from,
            creaTime: creaTime,
            cerName: itemData.create_user_name,
            conductor: itemData.access_user_name || '',
            state: state,
            remark: itemData.content,
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
    // 查看日志图片
    checkImg (url) {
      this.imgDialog = true
      this.logImg = this.sysetApi() + '/showImage?state=10&filename=' + url
    },
    /* 地址 */
    siteClick () {
      this.siteDialog = true
      // 清空选中
      this.siteId = ''
      // 取消高亮
      this.siteHighlight = false
      // 获取数据
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
      // 保存id
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
    // 导出
    downWork () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        woN_name: this.search.name,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
        woN_from: this.search.source,
        businessN_type: this.search.sort,
        userN_id: this.search.crews,
        woN_state: this.navActive,
        type: this.navActive,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/wo/v2.1.02/pc/imp/woeximport?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.work-list{
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
    }
  }
}
</style>
