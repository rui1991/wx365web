<template>
  <div class="video-setting">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>视频监控</el-breadcrumb-item>
          <el-breadcrumb-item>视频监控设置</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="basics">
          <h4 class="title">IP与端口设置</h4>
          <div class="serve">
            <p class="txt">监控服务器地址</p>
            <el-input style="width: 240px; vertical-align:middle;" v-model.trim="basics.serve"></el-input>
            <div class="hint">
              <p>*请按照示例正确填写，如未填写或地址错误将无法获取视频信息</p>
              <p>示例：（http://szydak.eicp.net:10800）</p>
            </div>
          </div>
          <div class="login">
            <div class="item">
              <p class="txt">用户名</p>
              <el-input style="width: 160px;" v-model.trim="basics.userName"></el-input>
            </div>
            <div class="item">
              <p class="txt">密码</p>
              <el-input style="width: 160px;" v-model.trim="basics.userPwd"></el-input>
            </div>
            <div class="operate" v-if="authority.indexOf(207) !== -1">
              <el-button type="primary" :disabled="saveDisabled" @click="saveClick">保存</el-button>
            </div>
          </div>
        </div>
        <div class="search">
          <div class="operate">
            <!--<el-button type="primary" icon="el-icon-circle-plus-outline" @click="addClick">新增</el-button>-->
            <el-button type="primary" :disabled="downDisabled" @click="downFile" v-if="authority.indexOf(208) !== -1">导出</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="Name" label="摄像机名称"></el-table-column>
          <el-table-column prop="Channel" label="通道号"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span v-if="scope.row.Enable === 1">启用</span>
              <span v-else>禁用</span>
            </template>
          </el-table-column>
          <el-table-column prop="Protocol" label="接入类型"></el-table-column>
          <el-table-column prop="IP" label="摄像机IP"></el-table-column>
          <el-table-column prop="UserName" label="摄像机用户名"></el-table-column>
          <el-table-column prop="Password" label="摄像机密码"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <i class="el-icon-edit" @click="comClick(scope.row)" v-if="authority.indexOf(207) !== -1"></i>
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
    <!-- 编辑 -->
    <el-dialog title="通道配置" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="通道名称" prop="name">
          <el-input v-model.trim="comForm.name"></el-input>
        </el-form-item>
        <el-form-item label="通道号" prop="channel">
          <el-input :disabled="true" v-model="comForm.channel"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="state">
          <el-switch v-model="comForm.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </el-form-item>
        <el-form-item label="摄像机用户名" prop="uname">
          <el-input v-model.trim="comForm.uname"></el-input>
        </el-form-item>
        <el-form-item label="摄像机密码" prop="upwd">
          <el-input v-model.trim="comForm.upwd"></el-input>
        </el-form-item>
        <el-form-item label="摄像机接入类型" prop="type">
          <el-radio-group v-model="comForm.type">
            <el-radio label="RTSP"></el-radio>
            <el-radio label="ONVIF"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="RTSP地址" prop="rtsp">
          <el-input v-model.trim="comForm.rtsp"></el-input>
        </el-form-item>
        <el-form-item label="ONVIF地址" prop="onvif">
          <el-input v-model.trim="comForm.onvif"></el-input>
        </el-form-item>
        <el-form-item label="CDN推流地址" prop="onvif">
          <el-input v-model.trim="comForm.cdn"></el-input>
        </el-form-item>
        <el-form-item label="传输协议" prop="transmit">
          <el-radio-group v-model="comForm.transmit">
            <el-radio label="TCP"></el-radio>
            <el-radio label="UDP"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="按需直播" prop="need">
          <el-switch v-model="comForm.need" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </el-form-item>
        <el-form-item label="音频输入" prop="audio">
          <el-switch v-model="comForm.audio" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Md5 from 'js-md5'
export default{
  name: 'videoSetting',
  data () {
    return {
      basics: {
        serve: '',
        userName: '',
        userPwd: ''
      },
      basicsConfig: {
        serve: '',
        userName: '',
        userPwd: ''
      },
      allData: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      videoToken: '',
      comDialog: false,
      comForm: {
        name: '',
        channel: '',
        state: '',
        uname: '',
        upwd: '',
        type: '',
        rtsp: '',
        onvif: '',
        cdn: '',
        transmit: '',
        need: '',
        audio: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入通道名称', trigger: 'blur' }
        ],
        channel: [
          { required: true, message: '请输入通道号', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '请选择是否启用', trigger: 'change' }
        ]
      },
      formLabelWidth: '120px',
      saveDisabled: false,
      downDisabled: false
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 获取IP与端口
    this.getServerIp()
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.videoSetting,
      authority: state => state.detAuthority.videoSetting
    }),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    // 获取IP与端口
    getServerIp () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        page: 1,
        limit1: 1,
        conditions: ''
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/selMntip',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          if (res.data.data1.mntList.length === 0) {
            return
          }
          this.basics = {
            serve: res.data.data1.mntList[0].mntip,
            userName: res.data.data1.mntList[0].login_name,
            userPwd: res.data.data1.mntList[0].login_pwd
          }
          this.basicsConfig = this.basics
          this.getVideoToken()
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
    // 获取token
    getVideoToken () {
      let userPwd = this.basicsConfig.userPwd
      userPwd = Md5(userPwd)
      this.$axios({
        method: 'get',
        url: this.basicsConfig.serve + '/api/v1/login?username=' + this.basicsConfig.userName + '&password=' + userPwd
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          const videoToken = res.data.EasyDarwin.Body.Token
          this.videoToken = videoToken
          this.getListData()
        } else {
          this.$message({
            showClose: true,
            message: '视频服务器登录失败',
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
    // 获取列表
    getListData () {
      let params = {
        mnturl: this.basicsConfig.serve + '/api/v1/getchannelsconfig',
        token: this.videoToken
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/sendURL',
        data: params
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          this.total = res.data.EasyDarwin.Body.ChannelCount
          // 全部数据
          const allData = res.data.EasyDarwin.Body.Channels
          this.allData = allData
          // 表格数据
          const tableData = allData.slice(0, this.limit)
          this.tableData = tableData
        } else {
          this.$message({
            showClose: true,
            message: '服务器连接失败！',
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
      // 更新列表数据
      const start = page * this.limit - this.limit
      const end = page * this.limit
      const tableData = this.allData.slice(start, end)
      this.tableData = tableData
    },
    /* 设置IP与端口 */
    saveClick () {
      // 服务地址
      const serve = this.basics.serve
      if (!serve) {
        this.$message({
          showClose: true,
          message: '监控服务器地址不能为空',
          type: 'warning'
        })
        return
      }
      // 用户名
      let userName = this.basics.userName
      if (!userName) {
        this.$message({
          showClose: true,
          message: '用户名不能为空',
          type: 'warning'
        })
        return
      }
      // 密码
      let userPwd = this.basics.userPwd
      if (!userPwd) {
        this.$message({
          showClose: true,
          message: '密码不能为空',
          type: 'warning'
        })
        return
      }
      this.verifyServerIp()
    },
    // 校验
    verifyServerIp () {
      let serve = this.basics.serve
      if (serve.indexOf('http://') === -1) {
        serve = 'http://' + serve
      }
      let userPwd = this.basics.userPwd
      userPwd = Md5(userPwd)
      this.$axios({
        method: 'get',
        url: serve + '/api/v1/login?username=' + this.basics.userName + '&password=' + userPwd
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          const videoToken = res.data.EasyDarwin.Body.Token
          this.videoToken = videoToken
          // 提交保存
          this.sendServerIp()
        } else {
          this.$message({
            showClose: true,
            message: '视频服务器登录校验失败',
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
    // 提交
    sendServerIp () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        mntip: this.basics.serve,
        login_name: this.basics.userName,
        login_pwd: this.basics.userPwd
      }
      params = this.$qs.stringify(params)
      this.saveDisabled = true
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/addMntip',
        data: params
      }).then((res) => {
        this.saveDisabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '服务地址设置成功',
            type: 'success'
          })
          this.basicsConfig = this.basics
          // 刷新列表
          this.getListData()
        } else {
          this.$message({
            showClose: true,
            message: '服务器连接失败！',
            type: 'error'
          })
        }
      }).catch(() => {
        this.saveDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 新增 */
    // addClick () {
    //
    // },
    /* 编辑 */
    comClick (data) {
      this.comDialog = true
      // 是否开启
      const Enable = data.Enable
      let state = false
      if (Enable === 1) {
        state = true
      }
      // 按需直播
      const OnDemand = data.OnDemand
      let need = false
      if (OnDemand === 1) {
        need = true
      }
      // 开启音频
      const Audio = data.Audio
      let audio = false
      if (Audio === 1) {
        audio = true
      }
      this.comForm = {
        name: data.Name,
        channel: data.Channel,
        state: state,
        uname: data.UserName,
        upwd: data.Password,
        type: data.Protocol,
        rtsp: data.Rtsp,
        onvif: data.Onvif,
        cdn: data.Cdn,
        transmit: data.Transport,
        need: need,
        audio: audio
      }
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
      // 是否开启
      const state = this.comForm.state
      let Enable = ''
      if (state) {
        Enable = 1
      } else {
        Enable = 0
      }
      // 按需直播
      const need = this.comForm.need
      let OnDemand = ''
      if (need) {
        OnDemand = 1
      } else {
        OnDemand = 0
      }
      // 开启音频
      const audio = this.comForm.audio
      let audioImport = ''
      if (audio) {
        audioImport = 1
      } else {
        audioImport = 0
      }
      let urlData = {
        Channel: this.comForm.channel,
        Name: this.comForm.name,
        Enable: Enable,
        UserName: this.comForm.uname,
        Password: this.comForm.upwd,
        Protocol: this.comForm.type,
        RTSP: this.comForm.rtsp,
        ONVIF: this.comForm.onvif,
        Cdn: this.comForm.cdn,
        Transport: this.comForm.transmit,
        OnDemand: OnDemand,
        Audio: audioImport,
        Record: -1
      }
      urlData = this.$qs.stringify(urlData)
      let params = {
        mnturl: this.basicsConfig.serve + '/api/v1/setchannelconfig?' + urlData,
        token: this.videoToken
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.videoApi() + '/mnt/sendURL',
        data: params
      }).then((res) => {
        if (res.data.EasyDarwin.Header.ErrorNum === '200') {
          this.$message({
            showClose: true,
            message: '通道配置成功',
            type: 'success'
          })
          this.comDialog = false
          // 刷新列表
          this.getListData()
        } else {
          this.$message({
            showClose: true,
            message: '服务器连接失败！',
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
    /* 导出 */
    downFile () {
      let params = {
        mnturl: this.basicsConfig.serve + '/api/v1/getchannelsconfig',
        token: this.videoToken
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.videoApi() + '/mnt/monitoringEO?' + params
    }
  }
}
</script>

<style lang="less" scoped>
.video-setting{
  height: 100%;
  padding-bottom: 20px;
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
      .basics{
        .title{
          line-height: 35px;
          font-weight: 600;
          color: #333;
        }
        .serve{
          margin: 6px 0;
          font-size: 0;
          .txt{
            display: inline-block;
            vertical-align:middle;
            width: 120px;
            line-height: 34px;
            font-size: 14px;
          }
          .hint{
            display: inline-block;
            vertical-align:middle;
            padding-left: 30px;
            p{
              font-size: 12px;
            }
          }
        }
        .login{
          display: table;
          width: 100%;
          height: 50px;
          .item{
            display: table-cell;
            vertical-align:middle;
            width: 280px;
            font-size: 0;
            .txt{
              display: inline-block;
              margin-right: 5px;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align:middle;
            text-align: right;
          }
        }
      }
      .search{
        display: table;
        width: 100%;
        height: 60px;
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
