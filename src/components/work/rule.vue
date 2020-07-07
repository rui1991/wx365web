<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>工单管理</el-breadcrumb-item>
        <el-breadcrumb-item>异常处理规则设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <el-row :gutter="40" style="margin-left: 0; margin-right: 0;">
        <el-col :span="12">
          <div class="grid-content bg-purple warning">
            <div class="warning-title">
              <h3 class="title-text"><i class="iconfont icon-gaojing"></i>通知与告警</h3>
              <div class="operate">
                <el-button type="primary" @click="addWarning">添加</el-button>
              </div>
            </div>
            <p class="warning-hint">最多可添加5个指定联系人</p>
            <el-table class="list-table" :data="linkmanData" border style="width: 100%;">
              <el-table-column type="index" width="50" label="序号"></el-table-column>
              <el-table-column prop="user_name" label="姓名"></el-table-column>
              <el-table-column prop="user_phone" label="联系方式"></el-table-column>
              <el-table-column prop="role_name" label="角色"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <i class="el-icon-delete" style="font-size: 18px; color: #fe4c51; cursor: pointer;" @click="delClick(scope.row.wp_id)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content bg-purple rule-set">
            <div class="rule-title">
              <h3 class="title-text"><i class="iconfont icon-shezhi"></i>规则设置</h3>
            </div>
            <div class="rule-item top-radius">
              <div class="item-title clearfix">
                <h4 class="title left">自动派单规则设置</h4>
                <div class="set right">
                  <a href="javascript:void(0);" class="blue" v-show="sendWhether" @click="sendState = true">设置</a>
                  <a href="javascript:void(0);" class="blue" v-show="!sendWhether" @click="sendState = true">未设置</a>
                </div>
              </div>
              <div class="item-content">
                <div class="item-content-show" v-show="!sendState">
                  <div class="show-det" v-show="sendWhether">
                    <h5 class="title">按用户技能分配</h5>
                    <p class="text">根据工单业务类别，分配至拥有该技能的人员</p>
                  </div>
                  <p class="hint" v-show="!sendWhether">未设置自动派单规则</p>
                </div>
                <div class="item-content-set" v-show="sendState">
                  <div class="set-det">
                    <h5 class="title"><el-checkbox style="margin-right: 10px;" v-model="skillSelect">按用户技能分配</el-checkbox></h5>
                    <p class="text">根据工单业务类别，分配至拥有该技能的人员</p>
                  </div>
                  <div class="operate">
                    <el-button type="primary" :disabled="sendDisabled" @click="clickSend">保 存</el-button>
                    <el-button @click="cancelSend">取 消</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="rule-item">
              <div class="item-title clearfix">
                <h4 class="title left">响应超时规则设置</h4>
                <div class="set right">
                  <a href="javascript:void(0);" class="blue" v-show="responseWhether" @click="responseState = true">设置</a>
                  <a href="javascript:void(0);" class="blue" v-show="!responseWhether" @click="responseState = true">未设置</a>
                </div>
              </div>
              <div class="item-content">
                <div class="item-content-show" v-show="!responseState">
                  <p class="text" v-show="responseWhether">生成工单后，第一次跟进处理时间不超过{{responseTime}}分钟</p>
                  <p class="hint" v-show="!responseWhether">未设置响应超时规则</p>
                </div>
                <div class="item-content-set" v-show="responseState">
                  <div class="set-det">
                    <h5 class="title"><el-checkbox style="margin-right: 10px;" v-model="responseSelect">设置响应超时</el-checkbox></h5>
                    <div class="time">
                      <span class="txt">生成工单后，第一次跟进处理时间</span>
                      <el-input style="width: 180px;" placeholder="时间" type="number" value="0" v-model.number="responseTime">
                        <template slot="append">分钟</template>
                      </el-input>
                    </div>
                  </div>
                  <div class="operate">
                    <el-button type="primary" :disabled="resDisabled" @click="clickResponse">保 存</el-button>
                    <el-button @click="cancelResponse">取 消</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="rule-item bottom-radius">
              <div class="item-title clearfix">
                <h4 class="title left">处理超时规则设置</h4>
                <div class="set right">
                  <a href="javascript:void(0);" class="blue" v-show="disposeWhether" @click="disposeState = true">设置</a>
                  <a href="javascript:void(0);" class="blue" v-show="!disposeWhether" @click="disposeState = true">未设置</a>
                </div>
              </div>
              <div class="item-content">
                <div class="item-content-show" v-show="!disposeState">
                  <p class="text" v-show="disposeWhether">生成工单后，第一次跟进处理时间不超过{{disposeTime}}分钟</p>
                  <p class="hint" v-show="!disposeWhether">未设置处理超时规则</p>
                </div>
                <div class="item-content-set" v-show="disposeState">
                  <div class="set-det">
                    <h5 class="title"><el-checkbox style="margin-right: 10px;" v-model="responseSelect">设置处理超时</el-checkbox></h5>
                    <div class="time">
                      <span class="txt">接收/派发工单后，第一次处理不超过</span>
                      <el-input style="width: 180px;" placeholder="时间" type="number" value="0" v-model.number="disposeTime">
                        <template slot="append">分钟</template>
                      </el-input>
                    </div>
                  </div>
                  <div class="operate">
                    <el-button type="primary" :disabled="disDisabled" @click="clickDispose">保 存</el-button>
                    <el-button @click="cancelDispose">取 消</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model.trim="crewfilter"></el-input>
      <el-table class="select-table" :data="crewData" @selection-change="handleSelectionChange" style="width: 100%" max-height="360">
        <el-table-column type="selection" width="55" :selectable="checkSelectable"></el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column prop="user_phone" label="联系方式"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="cerwDisabled" @click="selectCrew">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该告警联系人？</p>
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
  name: 'rule',
  data () {
    return {
      linkmanData: [],
      crewDialog: false,
      crewData: [],
      ocrewData: [],
      crewfilter: '',
      multipleSelection: [],
      linkmanId: '',
      cerwDisabled: true,
      delDialog: false,
      delDisabled: false,
      sendId: 0,
      sendState: false,
      sendWhether: false,
      skillSelect: false,
      oskillSelect: false,
      responseId: 0,
      responseState: false,
      responseWhether: false,
      responseSelect: false,
      oresponseSelect: false,
      responseTime: 0,
      oresponseTime: 0,
      disposeId: 0,
      disposeState: false,
      disposeWhether: false,
      disposeSelect: false,
      odisposeSelect: false,
      disposeTime: 0,
      odisposeTime: 0,
      sendDisabled: false,
      resDisabled: false,
      disDisabled: false
    }
  },
  created () {
    // 获取告警人
    this.getWarning()
    // 获取自动派单规则
    this.getSendRule()
    // 获取响应超时规则
    this.getResponseRule()
    // 获取处理超时设置
    this.getDisposeRule()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    /* 设置告警人 */
    getWarning () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWorkPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.linkmanData = res.data.data1
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
    addWarning () {
      if (this.crewData.length === 0) {
        this.getCrewOptions()
      }
      this.crewDialog = true
    },
    // 获取项目人员
    getCrewOptions () {
      let params = {
        organize_id: this.projectOrgId,
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
          this.crewData = res.data.data1.users
          this.ocrewData = res.data.data1.users
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
    checkSelectable (row, index) {
      let state = true
      let uid = row.user_id
      this.linkmanData.forEach(item => {
        if (item.wp_user === uid) {
          state = false
        }
      })
      return state
    },
    // 获取选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    selectCrew () {
      const selectLength = this.multipleSelection.length
      if (selectLength === 0) {
        this.$message({
          showClose: true,
          message: '请选择联系人',
          type: 'warning'
        })
      } else {
        const oldLength = this.linkmanData.length
        const allLength = selectLength + oldLength
        if (allLength > 5) {
          this.$message({
            showClose: true,
            message: '联系人最多可添加5个',
            type: 'warning'
          })
        } else {
          this.addWarningSend()
        }
      }
    },
    addWarningSend () {
      const selectCrew = this.multipleSelection
      let uids = []
      selectCrew.forEach(item => {
        uids.push(item.user_id)
      })
      uids = uids.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        user_ids: uids
      }
      params = this.$qs.stringify(params)
      this.cerwDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/addWorkPush',
        data: params
      }).then((res) => {
        this.cerwDisabled = false
        if (res.data.result === 'Sucess') {
          this.crewDialog = false
          // 获取告警人
          this.getWarning()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.cerwDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 删除
    delClick (id) {
      this.linkmanId = id
      this.delDialog = true
    },
    submitDelForm () {
      let uid = this.linkmanId
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        wp_id: uid
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/delWorkPush',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          this.delDialog = false
          // 获取告警人
          this.getWarning()
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
    /* 自动派单规则设置 */
    getSendRule () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWorkAutoSend',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const mydata = res.data.data1
          if (mydata) {
            this.sendState = false
            this.sendId = mydata.was_id
            const skill = mydata.with_skill
            if (skill === 0) {
              this.sendWhether = true
              this.skillSelect = true
              this.oskillSelect = true
            } else {
              this.sendWhether = false
              this.skillSelect = false
              this.oskillSelect = false
            }
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
    // 保存
    clickSend () {
      if (this.oskillSelect === this.skillSelect) {
        this.sendState = false
      } else {
        this.setSendRule()
      }
    },
    // 取消
    cancelSend () {
      this.skillSelect = this.oskillSelect
      this.sendState = false
    },
    setSendRule () {
      let skillState = 0
      if (!this.skillSelect) {
        skillState = 1
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        with_skill: skillState,
        with_role: skillState,
        was_id: this.sendId
      }
      params = this.$qs.stringify(params)
      this.sendDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/alterWorkAutoSend',
        data: params
      }).then((res) => {
        this.sendDisabled = false
        if (res.data.result === 'Sucess') {
          this.getSendRule()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.sendDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 响应超时设置 */
    getResponseRule () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        rd_type: 'r'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWorkOuttime',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const mydata = res.data.data1
          if (mydata) {
            this.responseState = false
            this.responseId = mydata.wot_id
            this.responseTime = mydata.rd_time || 0
            this.oresponseTime = mydata.rd_time || 0
            const state = mydata.wot_state
            if (state === 0) {
              this.responseWhether = true
              this.responseSelect = true
              this.oresponseSelect = true
            } else {
              this.responseWhether = false
              this.responseSelect = false
              this.oresponseSelect = false
            }
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
    // 保存
    clickResponse () {
      if (this.responseSelect === this.oresponseSelect && this.responseTime === this.oresponseTime) {
        this.responseState = false
      } else {
        this.setSendResponse()
      }
    },
    // 取消
    cancelResponse () {
      this.responseSelect = this.oresponseSelect
      this.responseTime = this.oresponseTime
      this.responseState = false
    },
    setSendResponse () {
      let state = 0
      if (!this.responseSelect) {
        state = 1
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        rd_type: 'r',
        wot_id: this.responseId,
        rd_time: this.responseTime || 0,
        wot_state: state
      }
      params = this.$qs.stringify(params)
      this.resDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/alterWorkOuttime',
        data: params
      }).then((res) => {
        this.resDisabled = false
        if (res.data.result === 'Sucess') {
          this.getResponseRule()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.resDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 处理超时设置 */
    getDisposeRule () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        rd_type: 'd'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/selWorkOuttime',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const mydata = res.data.data1
          if (mydata) {
            this.disposeState = false
            this.disposeId = mydata.wot_id
            this.disposeTime = mydata.rd_time || 0
            this.odisposeTime = mydata.rd_time || 0
            const state = mydata.wot_state
            if (state === 0) {
              this.disposeWhether = true
              this.disposeSelect = true
              this.odisposeSelect = true
            } else {
              this.disposeWhether = false
              this.disposeSelect = false
              this.odisposeSelect = false
            }
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
    // 保存
    clickDispose () {
      if (this.disposeSelect === this.odisposeSelect && this.disposeTime === this.odisposeTime) {
        this.disposeState = false
      } else {
        this.setSendDispose()
      }
    },
    // 取消
    cancelDispose () {
      this.disposeSelect = this.odisposeSelect
      this.disposeTime = this.odisposeTime
      this.disposeState = false
    },
    setSendDispose () {
      let state = 0
      if (!this.disposeSelect) {
        state = 1
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        rd_type: 'd',
        wot_id: this.disposeId,
        rd_time: this.disposeTime || 0,
        wot_state: state
      }
      params = this.$qs.stringify(params)
      this.disDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/alterWorkOuttime',
        data: params
      }).then((res) => {
        this.disDisabled = false
        if (res.data.result === 'Sucess') {
          this.getDisposeRule()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.disDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    crewfilter (nowVal, oldVal) {
      this.crewData = this.ocrewData.filter(item => (~item.user_name.indexOf(nowVal)))
    },
    multipleSelection (val, oldVal) {
      if (val.length > 0) {
        this.cerwDisabled = false
      } else {
        this.cerwDisabled = true
      }
    },
    responseTime (nowVal, oldVal) {
      if (!nowVal) {
        return
      }
      let num = Number(nowVal)
      if (num < 0) {
        this.responseTime = 0
      }
    },
    disposeTime (nowVal, oldVal) {
      if (!nowVal) {
        return
      }
      let num = Number(nowVal)
      if (num < 0) {
        this.disposeTime = 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .module-main{
    .warning{
      .warning-title{
        display: table;
        width: 100%;
        height: 60px;
        .title-text{
          display: table-cell;
          vertical-align: middle;
          font-size: 18px;
          color: #272727;
          i{
            margin-right: 10px;
            font-size: 24px;
            color: #fb7720;
          }
        }
        .operate{
          display: table-cell;
          vertical-align: middle;
          text-align: right;
        }
      }
      .warning-hint{
        color: #fe4c51;
      }
    }
    .rule-set{
      .rule-title{
        display: table;
        width: 100%;
        height: 60px;
        .title-text{
          display: table-cell;
          vertical-align: middle;
          font-size: 18px;
          color: #272727;
          i{
            margin-right: 10px;
            font-size: 24px;
            color: #4e97d8;
          }
        }
      }
      .rule-item{
        padding: 10px;
        border: 1px solid #e6e6e6;
        .item-title{
          height: 45px;
          .title{
            line-height: 45px;
            font-size: 16px;
            color: #272727;
          }
          .set{
            line-height: 45px;
            font-size: 16px;
          }
        }
        .item-content{
          .title{
            height: 35px;
            line-height: 35px;
            font-size: 14px;
            color: #272727;
          }
          .text{
            height: 35px;
            line-height: 35px;
            font-size: 14px;
            color: #666666;
          }
          .time{
            height: 35px;
            line-height: 35px;
            font-size: 14px;
            .txt{
              margin-right: 10px;
            }
          }
          .hint{
            height: 35px;
            line-height: 35px;
            text-align: center;
            font-size: 14px;
            color: #fe4c51;
          }
          .operate{
            padding-top: 20px;
            padding-bottom: 10px;
            text-align: center;
            button{
              margin: 0 20px;
            }
          }
        }
      }
      .top-radius{
        border-radius: 6px 6px 0 0;
        border-bottom: none;
      }
      .bottom-radius{
        border-radius: 0 0 6px 6px;
        border-top: none;
      }
    }
  }
</style>
