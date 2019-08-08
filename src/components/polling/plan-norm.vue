<template>
  <div class="plan-norm">
    <div class="site-item" v-for="item in siteData" :key="item.position_id">
      <h3 class="site-name">{{item.position_name}}</h3>
      <div class="norm" v-if="item.template_id === 0">
        <div class="norm-top">
          <div class="norm-title red">未关联巡检标准</div>
          <div class="norm-operate">
            <el-button type="primary" @click="addClick(item.position_id)">关联</el-button>
          </div>
        </div>
      </div>
      <div class="norm" v-else>
        <div class="norm-top">
          <div class="norm-title">{{item.template_name}}</div>
          <div class="norm-operate">
            <i class="el-icon-edit blue" @click="comClick(item.template_id)"></i>
            <i class="el-icon-delete red" @click="delClick(item.position_id)"></i>
          </div>
        </div>
        <el-table class="list-table" :data="item.template.inss" border style="width: 100%; margin-top: 0;">
          <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
          <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
          <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
          <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
        </el-table>
      </div>
    </div>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="skipClick(1)">上一步</el-button>
      <el-button type="primary" @click="skipClick(3)">下一步</el-button>
    </div>
    <!-- 新增 -->
    <el-dialog title="关联标准" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model="temFilter" style="width: 40%; margin-bottom: 10px;"></el-input>
      <el-table class="select-table" :data="normList" style="width: 100%" max-height="360">
        <el-table-column label="" width="65">
          <template slot-scope="scope">
            <el-radio v-model="radioTemId" :label="scope.row.template_id">&nbsp;&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="template_name" label="标准名称"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="sendAddRequest">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑标准" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-input v-model="comForm.type"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="comForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="巡检标准" prop="temIds">
          <el-input v-model="comForm.temIds" v-show="false" style="width: 60%;"></el-input>
          <el-button type="primary" @click="temClick">选择巡检标准</el-button>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="comForm.temData" style="width: 100%" v-show="comForm.temData.length > 0">
        <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
        <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
        <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
        <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 巡检标准 -->
    <el-dialog title="选择标准" :visible.sync="temDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="temTree"
        ref="temTree"
        default-expand-all
        node-key="id"
        show-checkbox
        check-strictly
        :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="temDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectTemClick">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要解除该地址与标准模板的关联？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentSite'],
  data () {
    return {
      siteData: [],
      siteId: '',
      temId: '',
      formLabelWidth: '120px',
      addDialog: false,
      addDisabled: true,
      normList: [],
      onormList: [],
      temFilter: '',
      radioTemId: '',
      comDialog: false,
      comDisabled: false,
      comForm: {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      },
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入模板类型', trigger: 'blur' }
        ],
        temIds: [
          { required: true, message: '请选择巡检标准', trigger: 'input' }
        ]
      },
      temDialog: false,
      temTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      delDialog: false
    }
  },
  created () {
    // 获取地址数据
    this.getSiteData()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 获取地址数据
    getSiteData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_ids: this.parentSite.positions.join(',')
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsSetPositionsTemplate',
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
    /* 关联 */
    addClick (id) {
      this.siteId = id
      this.addDialog = true
      if (this.normList.length === 0) {
        this.getNormList()
      } else {
        this.temFilter = ''
        this.radioTemId = ''
      }
    },
    // 提交
    sendAddRequest () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.siteId,
        template_id: this.radioTemId
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addPositionTem',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          this.addDialog = false
          // 刷新地址数据
          this.getSiteData()
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
      this.temId = id
      this.comDialog = true
      this.comForm = {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      }
      this.getComItem()
    },
    getComItem () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: this.temId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 名称
          this.comForm.name = itemData.template_name
          // 类型
          this.comForm.type = itemData.template_type
          // 描述
          this.comForm.remark = itemData.describe
          // 模板id
          const temData = itemData.Ins
          let temIds = []
          temData.forEach(item => {
            temIds.push(item.ins_id)
          })
          temIds = temIds.join(',')
          this.comForm.temIds = temIds
          this.getTemContent(temIds)
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        template_id: this.temId,
        template_name: this.comForm.name,
        template_type: this.comForm.type,
        describe: this.comForm.remark,
        ins_ids: this.comForm.temIds
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/altTemplate',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetComForm('ruleComForm')
          // 刷新地址数据
          this.getSiteData()
          // 刷新标准列表
          this.getNormList()
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
      this.siteId = id
      this.delDialog = true
    },
    submitDelForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.siteId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/delPositionTem',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.delDialog = false
          // 刷新地址数据
          this.getSiteData()
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
    /* 获取标准模板 */
    getNormList () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        templateN_name: '',
        templateN_type: '',
        createN_time: '',
        createN_user: '',
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
          this.normList = res.data.data1.templates
          this.onormList = res.data.data1.templates
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
    /* 巡检标准 */
    temClick () {
      this.temDialog = true
      let temIds = this.comForm.temIds
      if (temIds) {
        temIds = temIds.split(',')
      } else {
        temIds = []
      }
      if (this.temTree.length === 0) {
        this.getTemData(temIds)
      } else {
        setTimeout(() => {
          this.$refs.temTree.setCheckedKeys(temIds)
        }, 100)
      }
    },
    // 获取标准树
    getTemData (ids) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temTree = res.data.data1
          temTree.forEach(item => {
            item.disabled = true
          })
          this.temTree = temTree
          this.$refs.temTree.setCheckedKeys(ids)
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
    // 选择标准
    selectTemClick () {
      let temIds = this.$refs.temTree.getCheckedKeys()
      temIds = temIds.join(',')
      if (!temIds) {
        this.$message({
          showClose: true,
          message: '请选择巡检标准',
          type: 'warning'
        })
        return
      }
      this.comForm.temIds = temIds
      this.getTemContent(temIds)
    },
    // 获取标准详情
    getTemContent (ids) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: 0,
        ins_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.comForm.temData = res.data.data1
          this.temDialog = false
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
    // 跳转
    skipClick (num) {
      this.$emit('parentActiveFun', num)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancelFun')
    }
  },
  watch: {
    temFilter: function (nowVal, oldVal) {
      this.normList = this.onormList.filter(item => (~item.template_name.indexOf(nowVal)))
    },
    radioTemId (val, oldVal) {
      if (val) {
        this.addDisabled = false
      } else {
        this.addDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.plan-norm{
  width: 80%;
  padding: 20px;
  margin: 0 auto;
  background: #ffffff;
  .site-item{
    .site-name{
      height: 35px;
      line-height: 35px;
    }
    .norm{
      margin-bottom: 20px;
      .norm-top{
        display: table;
        width: 100%;
        height: 45px;
        .norm-title{
          display: table-cell;
          vertical-align:middle;
        }
        .norm-operate{
          display: table-cell;
          vertical-align:middle;
          text-align: right;
          i{
            margin: 0 3px;
            font-size: 18px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .operate{
    margin-top: 30px;
    text-align: center;
    .el-button{
      margin: 0 20px;
    }
  }
}
</style>
