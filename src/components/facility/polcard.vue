<template>
  <div class="polcard">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item>巡检绑卡管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
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
              <el-button type="primary" @click="addClick" v-if="authority.add">新增</el-button>
            </div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>卡号</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.card"></el-input>
            </div>
            <div class="operate">
              <!--<el-button type="primary" icon="el-icon-download" :disabled="downDisabled" @click="downFile">导出</el-button>-->
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" label="姓名"></el-table-column>
          <el-table-column prop="user_phone" label="联系电话"></el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.card_bind_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="卡号">
            <template slot-scope="scope">
              <span>{{ scope.row.card_mac | filterMac }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="untieClick(scope.row.user_id)" v-if="authority.untie">解绑</a>
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
    <el-dialog title="新增绑卡" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="人员" prop="crew">
          <el-select style="width: 100%;" v-model="addForm.crew" filterable placeholder="请选择人员">
            <el-option
              v-for="item in crewOptions"
              :key="item.user_id"
              :label="item.user_name"
              :value="item.user_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卡片" prop="card">
          <el-select style="width: 100%;" v-model="addForm.card" filterable placeholder="请选择卡片">
            <el-option
              v-for="item in cardOptions"
              :key="item.id"
              :label="item.dname"
              :value="item.mac">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 解绑 -->
    <el-dialog title="提示" :visible.sync="untieDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要解绑该用户？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="untieDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="untieDisabled" @click="submitUntieForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog title="导入绑卡" :visible.sync="upDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
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
        <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑绑卡资料</p>
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
  name: 'polcard',
  data () {
    return {
      authority: {
        add: true,
        untie: true
      },
      search: {
        name: '',
        phone: '',
        card: ''
      },
      nowSearch: {
        name: '',
        phone: '',
        card: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      addForm: {
        crew: '',
        card: ''
      },
      addDisabled: false,
      rules: {
        crew: [
          { required: true, message: '请选择人员', trigger: 'change' }
        ],
        card: [
          { required: true, message: '请选择卡片mac', trigger: 'change' }
        ]
      },
      formLabelWidth: '100px',
      crewOptions: [],
      cardOptions: [],
      itemId: '',
      downDisabled: false,
      untieDialog: false,
      untieDisabled: false,
      upDialog: false,
      reqUrl: '',
      reqHead: {
        token: sessionStorage.getItem('wxWebToken'),
        user_id: sessionStorage.getItem('wxWebUserId')
      },
      fileList: []
    }
  },
  created () {
    // 获取列表
    this.getListData()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(21) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(22) === -1 ? this.authority.untie = false : this.authority.untie = true
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid,
        autDet: state => state.autDet.polcard
      }
    )
  },
  methods: {
    /* 搜索 */
    searchList () {
      let mac = this.nowSearch.card
      mac = this.formatMacStr(mac)
      this.search = {
        name: this.nowSearch.name,
        phone: this.nowSearch.phone,
        card: mac
      }
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
        user_name: this.search.name,
        user_phone: this.search.phone,
        card_mac: this.search.card,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/findUserBind',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.userBinds
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
        crew: '',
        card: ''
      }
      if (this.crewOptions.length === 0) {
        // 获取项目人员
        this.getCrewOptions()
      }
      if (this.cardOptions.length === 0) {
        // 获取卡片Mac
        this.getCardOptions()
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
      let card = this.addForm.card
      card = card.replace(/:/g, '')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        bind_user: this.addForm.crew,
        card_mac: card
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/setCardBind',
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
    // 获取卡片mac列表
    getCardOptions () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        mac: '',
        dtype: 'cjk',
        dname: '',
        device_state: '',
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareList',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let cardData = res.data.data1.hardware
          this.cardOptions = cardData
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
    /* 解绑 */
    untieClick (id) {
      this.itemId = id
      this.untieDialog = true
    },
    submitUntieForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        bind_user: this.itemId
      }
      params = this.$qs.stringify(params)
      this.untieDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/releaseBind',
        data: params
      }).then((res) => {
        this.untieDisabled = false
        if (res.data.result === 'Sucess') {
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
    // 格式化Mac地址
    formatMacStr (str) {
      const mac = str.replace(/:/g, '')
      let value = mac.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    /* 导入 */
    upClick () {
      this.upDialog = true
      let params = {
        state: 15,
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
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
        // 刷新树
        this.getSiteTree()
        // 刷新列表
        this.getListData()
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范且MAC地址是否重复！',
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
    // 下载模板
    downTemplate () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        filename: 'Collecter.xls'
      }
      params = this.$qs.stringify(params)
      window.location.href = this.sysetApi() + '/download?filepath=/data/wx365/ExcelIn/&' + params
    },
    /* 导出 */
    downFile () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_name: this.search.name,
        user_phone: this.search.phone,
        card_mac: this.search.card
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/?' + params
    }
  },
  filters: {
    filterMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  }
}
</script>

<style lang="less" scoped>
.polcard{
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
              width: 56px;
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
