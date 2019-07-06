<template>
  <div class="work-oneself">
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column label="工单名称">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.wo_id)">{{ scope.row.wo_name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="wo_from" label="工单来源"></el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="创建人"></el-table-column>
      <el-table-column label="派单时间">
        <template slot-scope="scope">
          <span>{{ scope.row.dispatch_time | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工单状态">
        <template slot-scope="scope">
          <span v-if="scope.row.wo_state === 0">待处理</span>
          <span v-else-if="scope.row.wo_state === 1">跟进中</span>
          <span v-else-if="scope.row.wo_state === 2">结单</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <a href="javascript:void(0);" class="operate com" @click="clickAddLog(scope.row.wo_id)">追加日志</a>
          <a href="javascript:void(0);" class="operate com" @click="clickFinish(scope.row.wo_id)" v-if="scope.row.wo_state === 1">结单</a>
          <span class="operate forbid" v-else-if="scope.row.wo_state === 2">已结单</span>
          <a href="javascript:void(0);" class="operate com" @click="clickReturn(scope.row.wo_id)" v-if="scope.row.wo_state === 1">退单</a>
          <span class="operate forbid" v-else-if="scope.row.wo_state === 2">退单</span>
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
    <!-- 追加日志 -->
    <el-dialog title="追加日志" :visible.sync="logDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="logForm" :rules="logRules" ref="ruleLogForm" :label-width="formLabelWidth">
        <el-form-item label="添加消息" prop="content">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="logForm.content"></el-input>
        </el-form-item>
      </el-form>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :multiple="false"
        :file-list="fileList"
        list-type="picture">
        <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip" style="padding-left: 100px; color: red;">只能上传jpg/png文件，大小不超过2048kb，且只能上传一张！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetLogForm('ruleLogForm')">取 消</el-button>
        <el-button type="primary" :disabled="logDisabled" @click="submitLogForm('ruleLogForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 退单 -->
    <el-dialog title="退单" :visible.sync="quitDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="quitForm" :rules="quitRules" ref="ruleQuitForm" :label-width="formLabelWidth">
        <el-form-item label="退单原因" prop="content">
          <el-input type="textarea" v-model.trim="quitForm.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetQuitForm('ruleQuitForm')">取 消</el-button>
        <el-button type="primary" :disabled="quitDisabled" @click="submitQuitForm('ruleQuitForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'workOneself',
  props: ['parentSearch'],
  data () {
    return {
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      logDialog: false,
      logForm: {
        content: ''
      },
      logDisabled: false,
      logRules: {
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      },
      formLabelWidth: '100px',
      reqUrl: '',
      fileList: [],
      quitDialog: false,
      quitForm: {
        content: ''
      },
      quitDisabled: false,
      quitRules: {
        content: [
          { required: true, message: '请输入退单原因', trigger: 'blur' }
        ]
      },
      itemId: ''
    }
  },
  created () {

  },
  mounted () {
    // 设置上传图片地址
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
        userName: state => state.info.userName,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        projectN_id: this.nowProid,
        woN_name: this.parentSearch.name,
        startN_date: this.parentSearch.startDate,
        endN_date: this.parentSearch.endDate,
        woN_from: this.parentSearch.source,
        businessN_type: this.parentSearch.sort,
        userN_id: this.parentSearch.crews,
        // woN_state: 5,
        type: 5,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/v2.1.02/all/sel/selWoSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.woos
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
    // 查看详情
    checkDetails (id) {
      this.$emit('parentDetails', id)
    },
    /* 追加日志 */
    clickAddLog (id) {
      this.itemId = id
      this.logDialog = true
      this.logForm = {
        content: ''
      }
      this.fileList = []
    },
    // 验证表单
    submitLogForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendLogRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetLogForm (formName) {
      this.$refs[formName].resetFields()
      this.logDialog = false
    },
    // 提交
    sendLogRequest () {
      const fileList = this.fileList
      let imgUrl = ''
      if (fileList.length > 0) {
        imgUrl = fileList[0].response
      }
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        wo_id: this.itemId,
        user_name: this.userName,
        follow_content: this.logForm.content,
        follow_attachment: imgUrl
      }
      params = this.$qs.stringify(params)
      this.logDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/addWoFollow',
        data: params
      }).then((res) => {
        this.logDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetLogForm('ruleLogForm')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.logDisabled = false
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
    handleError (err, file, fileList) {
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
    // 结单
    clickFinish (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        wo_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/updateWoClose',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '结单成功',
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
    },
    /* 退单 */
    clickReturn (id) {
      this.itemId = id
      this.quitDialog = true
      this.quitForm = {
        content: ''
      }
    },
    // 验证表单
    submitQuitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendQuitRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetQuitForm (formName) {
      this.$refs[formName].resetFields()
      this.quitDialog = false
    },
    // 提交
    sendQuitRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        wo_id: this.itemId,
        reason: this.quitForm.content
      }
      params = this.$qs.stringify(params)
      this.quitDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/backWO',
        data: params
      }).then((res) => {
        this.quitDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetQuitForm('ruleQuitForm')
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
        this.quitDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    parentSearch (newVal, oldVal) {
      this.nowPage = 1
      this.getListData()
    }
  }
}
</script>

<style lang="less" scoped>
.work-oneself{
  .paging{
    margin-top: 20px;
  }
}
</style>
