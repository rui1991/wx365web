<template>
  <div class="shift">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业管理</el-breadcrumb-item>
          <el-breadcrumb-item>编制排班</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="operate">
            <el-button type="primary" v-if="authority.add" @click="addClick">新增</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="work_name" label="班次名称"></el-table-column>
          <el-table-column prop="start_time" label="开始时间"></el-table-column>
          <el-table-column prop="end_time" label="结束时间"></el-table-column>
          <el-table-column prop="user_name" label="创建人"></el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.create_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)"  v-if="authority.com">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.work_id)" v-if="authority.del">删除</a>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增班次" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item class="one-form" label="班次名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <div class="two-form">
          <el-form-item class="item" label="开始时间" prop="startTime">
            <el-time-picker
              style="width: 200px"
              arrow-control
              v-model="addForm.startTime"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="请选择开始时间">
            </el-time-picker>
          </el-form-item>
          <el-form-item class="item" label="结束时间" prop="endTime">
            <el-time-picker
              style="width: 200px"
              arrow-control
              v-model="addForm.endTime"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="请选择结束时间">
            </el-time-picker>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑班次" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item class="one-form" label="班次名称" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <div class="two-form">
          <el-form-item class="item" label="开始时间" prop="startTime">
            <el-time-picker
              style="width: 200px"
              arrow-control
              v-model="comForm.startTime"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="请选择开始时间">
            </el-time-picker>
          </el-form-item>
          <el-form-item class="item" label="结束时间" prop="endTime">
            <el-time-picker
              style="width: 200px"
              arrow-control
              v-model="comForm.endTime"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="请选择结束时间">
            </el-time-picker>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该班次？</p>
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
  name: 'shift',
  data () {
    return {
      authority: {
        add: true,
        com: true,
        del: true
      },
      tableData: [],
      formLabelWidth: '100px',
      addDialog: false,
      addForm: {
        name: '',
        startTime: '',
        endTime: ''
      },
      addDisabled: false,
      comDialog: false,
      comForm: {
        name: '',
        startTime: '',
        endTime: ''
      },
      comDisabled: false,
      rules: {
        name: [
          { required: true, message: '请输入班次名称', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ]
      },
      delDialog: false,
      delDisabled: false,
      itemId: ''
    }
  },
  created () {
    // 获取列表
    this.getListData()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(187) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(188) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(189) === -1 ? this.authority.del = false : this.authority.del = true
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        autDet: state => state.autDet.shift
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
        url: this.sysetApi() + '/attendance/findScheduling',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1
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
    /* 新增 */
    addClick () {
      this.addDialog = true
      this.addForm = {
        name: '',
        startTime: '',
        endTime: ''
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        work_name: this.addForm.name,
        start_time: this.addForm.startTime,
        end_time: this.addForm.endTime
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/addScheduling',
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
      this.itemId = data.work_id
      this.comForm = {
        name: data.work_name,
        startTime: data.start_time,
        endTime: data.end_time
      }
      this.comDialog = true
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        work_id: this.itemId,
        work_name: this.comForm.name,
        start_time: this.comForm.startTime,
        end_time: this.comForm.endTime
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/alterScheduling',
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
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        work_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/attendance/delScheduling',
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
    }
  }
}
</script>

<style lang="less" scoped>
.shift{
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
</style>
