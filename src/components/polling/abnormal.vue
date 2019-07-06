<template>
  <div class="abnormal">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item>异常检查项</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>巡检地址</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.site"></el-input>
            </div>
            <div class="item">
              <span>执行时间</span>
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
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>执行人员</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
            <div class="item">
              <span>工单状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择工单状态">
                <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="巡检地址">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row.isd_id)">{{ scope.row.position_name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="ins_name" label="检查项"></el-table-column>
          <el-table-column label="执行人">
            <template slot-scope="scope">
              <span v-if="scope.row.user_name">{{ scope.row.user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行时间">
            <template slot-scope="scope">
              <span>{{ scope.row.modification_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行结果"  width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.task_state === 0">未巡查</span>
              <span v-else-if="scope.row.task_state === 1">正常</span>
              <span v-else-if="scope.row.task_state === 2">异常</span>
            </template>
          </el-table-column>
          <el-table-column label="检查备注" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.note">{{ scope.row.note }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="工单状态"  width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.wo_state === 0">待处理</span>
              <span v-else-if="scope.row.wo_state === 1">跟进中</span>
              <span v-else-if="scope.row.wo_state === 2">结单</span>
              <span v-else>未生成</span>
            </template>
          </el-table-column>
          <el-table-column label="当前处理人">
            <template slot-scope="scope">
              <span v-if="scope.row.accept_user_name">{{ scope.row.accept_user_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="addWork(scope.row)" v-if="scope.row.wo_state === undefined && authority.add">提单</a>
              <span class="operate forbid" v-else-if="scope.row.wo_state !== undefined && authority.add">提单</span>
              <a href="javascript:void(0);" class="operate com" @click="checkHistory(scope.row)" v-if="authority.history">历史记录</a>
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
    <el-dialog title="新增工单" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="工单名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="发生地址" prop="site">
          <el-input v-model.trim="addForm.site" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="业务类别" prop="sort">
          <el-select v-model="addForm.sort" style="width: 100%;" clearable placeholder="请选择业务类别">
            <el-option
              v-for="item in sortOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
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
        multiple
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
    <el-dialog title="详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h5 class="form-title">异常详情</h5>
      <el-form :model="detForm" :label-width="formDetWidth" style="border-bottom: 1px solid #cecece;">
        <div class="two-form">
          <el-form-item class="item" label="项目名称">
            <el-input :disabled="true" v-model="detForm.proName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行时间">
            <el-input :disabled="true" v-model="detForm.exeTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="巡检地址">
            <el-input :disabled="true" v-model="detForm.site"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行人">
            <el-input :disabled="true" v-model="detForm.executor"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="检查项">
            <el-input :disabled="true" v-model="detForm.checkItem"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行结果">
            <el-input :disabled="true" v-model="detForm.exeResult"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="检查要求">
          <el-input type="textarea" :disabled="true" v-model="detForm.exaContent"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="备注">
          <el-input type="textarea" :disabled="true" v-model="detForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <h5 class="form-title">工单详情</h5>
      <el-form :model="detForm" :label-width="formDetWidth" style="border-bottom: 1px solid #cecece; margin-bottom: 20px;">
        <div class="two-form">
          <el-form-item class="item" label="标题">
            <el-input :disabled="true" v-model="detForm.workTitle"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="detForm.crePerson"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="detForm.creTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="当前处理人">
            <el-input :disabled="true" v-model="detForm.nowPerson"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="最后处理时间">
            <el-input :disabled="true" v-model="detForm.lastTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="完成状态">
            <el-input :disabled="true" v-model="detForm.finishState"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-table class="select-table" :data="detForm.logData" style="width: 100%;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="type" width="100" label="操作类型"></el-table-column>
        <el-table-column prop="perform_user_name" width="80" label="执行人"></el-table-column>
        <el-table-column label="执行时间">
          <template slot-scope="scope">
            <span>{{ scope.row.perform_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明"></el-table-column>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'abnormal',
  data () {
    return {
      authority: {
        add: true,
        history: true
      },
      search: {
        site: '',
        startDate: '',
        endDate: '',
        crew: '',
        state: ''
      },
      nowSearch: {
        site: '',
        startDate: '',
        endDate: '',
        crew: '',
        state: ''
      },
      stateOptions: [
        {
          label: '未生成',
          value: 9
        },
        {
          label: '待处理',
          value: 0
        },
        {
          label: '跟进中',
          value: 1
        },
        {
          label: '结单',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      formLabelWidth: '100px',
      addDialog: false,
      addForm: {
        name: '',
        site: '',
        sort: '',
        remark: '',
        imgs: ''
      },
      addDisabled: false,
      sortOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入工单名称', trigger: 'blur' }
        ]
      },
      itemId: '',
      reqUrl: '',
      imgLimit: 9,
      fileList: [],
      formDetWidth: '100px',
      detDialog: false,
      detForm: {
        proName: '',
        exeTime: '',
        site: '',
        executor: '',
        checkItem: '',
        exeResult: '',
        exaContent: '',
        remark: '',
        workTitle: '',
        crePerson: '',
        creTime: '',
        nowPerson: '',
        lastTime: '',
        finishState: '',
        logData: []
      },
      imgDialog: false,
      logImg: ''
    }
  },
  created () {
    // 设置上传地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id' + this.userId
    // 获取列表数据
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        autDet: state => state.autDet.abnormal
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
      // 权限
      let autDet = this.autDet
      autDet.indexOf(47) === -1 ? this.authority.add = false : this.authority.add = true
      autDet.indexOf(181) === -1 ? this.authority.history = false : this.authority.history = true
    },
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        positionN_name: this.search.site,
        startN_date: this.search.startDate,
        endN_date: this.search.endDate,
        userN_name: this.search.crew,
        woN_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsAbnormalSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insAB
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
    /* 查看详情 */
    checkDetails (id) {
      this.detDialog = true
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        isd_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsAbnormalOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 项目名称
          const proName = itemData.abMap.project_name
          // 执行时间
          const exeTime = this.$common.formatDate(itemData.abMap.modification_time)
          // 巡检地址
          const site = itemData.abMap.position_name
          // 执行人
          const executor = itemData.abMap.user_name || ''
          // 检查项
          const checkItem = itemData.abMap.ins_name || ''
          // 执行结果
          const resultState = itemData.abMap.task_state
          let exeResult = ''
          if (resultState === 0) {
            exeResult = '未巡查'
          } else if (resultState === 1) {
            exeResult = '正常'
          } else if (resultState === 2) {
            exeResult = '异常'
          }
          // 检查内容及要求
          const exaContent = itemData.abMap.check_content || ''
          // 备注
          const remark = itemData.abMap.note || ''
          // 标题
          const workTitle = itemData.woMap.wo_name || ''
          // 创建人
          const crePerson = itemData.woMap.create_user_name || ''
          // 创建时间
          const creTime = this.$common.formatDate(itemData.woMap.create_time)
          // 处理人
          const nowPerson = itemData.woMap.accept_user_name || ''
          // 最后处理时间
          const lastTime = itemData.woMap.last_time
          // 完成状态
          const finishNum = itemData.woMap.wo_state || ''
          let finishState = ''
          if (finishNum === 0) {
            finishState = '待处理'
          } else if (finishNum === 1) {
            finishState = '处理中'
          } else if (finishNum === 2) {
            finishState = '已完成'
          }
          // 日志
          let logData = itemData.woMap.wo_log || []
          this.detForm = {
            proName: proName,
            exeTime: exeTime,
            site: site,
            executor: executor,
            checkItem: checkItem,
            exeResult: exeResult,
            exaContent: exaContent,
            remark: remark,
            workTitle: workTitle,
            crePerson: crePerson,
            creTime: creTime,
            nowPerson: nowPerson,
            lastTime: lastTime,
            finishState: finishState,
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
    /* 提单 */
    addWork (data) {
      let siteId = data.position_id
      this.itemId = data.isd_id
      this.addDialog = true
      this.addForm = {
        name: '',
        site: '',
        sort: '',
        remark: ''
      }
      this.fileList = []
      if (this.sortOptions.length === 0) {
        // 获取业务类别
        this.getSortOptions()
      }
      // 获取全路径
      this.getAllPath(siteId)
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
        wo_from: '巡检',
        accept_user: '',
        isd_id: this.itemId,
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
          let allPath = res.data.data1.all_address
          this.addForm.site = allPath
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
    // 查看历史记录
    checkHistory (data) {
    // :to="{ name: 'abnormalHistory', params:{pos: scope.row.position_id, tem: scope.row.ins_id}}
      this.$router.push({
        name: 'abnormalHistory',
        query: {
          pos: data.position_id,
          tem: data.ins_id
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.abnormal{
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
      .show-table{
        margin-top: 10px;
        border-radius: 4px;
        border: 1px solid #cecece;
      }
    }
  }
}
</style>
