<template>
  <div class="code">
    <div class="item">
      <div class="item-content">
        <span class="iconfont iconshoujihao"></span>
        <div class="item-input">
          <input type="text" class="input" v-model.trim="phone" placeholder="请输手机号码">
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item-content">
        <span class="iconfont iconyanzhengma"></span>
        <div class="item-input" style="margin-right: 120px;">
          <input type="text" class="input" v-model.trim="authCode" placeholder="">
        </div>
        <el-button type="primary" :disabled="codeDisabled" v-text="codeBtnText" @click="verifyPhone"></el-button>
      </div>
    </div>
    <div class="other">
      <router-link :to="{ name: 'cipher'}" class="switch">切换至密码登录<i class="el-icon-d-arrow-right"></i></router-link>
    </div>
    <div class="login-btn">
      <el-button @click="verifyLogin">登  录</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default{
  name: 'authcode',
  data () {
    return {
      phone: '',
      authCode: '',
      saveCode: {authCode: '', phone: ''},
      codeDisabled: true,
      codeBtnText: '获取验证码',
      timer: null,
      proData: []
    }
  },
  created () {

  },
  methods: {
    ...mapActions('user', [
      'setUserInfo',
      'setModAuthority',
      'setDetAuthority'
    ]),
    ...mapActions('other', [
      'setAllProject',
      'setNowProject',
      'setOrganTree',
      'setOrganData'
    ]),
    // 校验手机号码格式
    verifyPhone () {
      let phone = this.phone
      if (!phone) {
        this.$message({
          showClose: true,
          message: '请输入手机号码!',
          type: 'warning'
        })
        return
      }
      if (this.$common.checkPhone(phone)) {
        this.getVerifyCode()
      } else {
        this.$message({
          showClose: true,
          message: '手机号码格式有误!',
          type: 'warning'
        })
      }
    },
    // 获取验证码
    getVerifyCode () {
      let params = { user_phone: this.phone }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/obtainPhoneCode',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 保存code
          this.saveCode = {
            authCode: res.data.data1.code,
            phone: res.data.data1.user_phone
          }
          // 设置按钮
          this.codeDisabled = true
          let count = 60
          this.timer = setInterval(() => {
            count--
            if (count > 0) {
              let codeBtnText = '还剩余' + count + '秒'
              this.codeBtnText = codeBtnText
            } else {
              this.codeBtnText = '获取验证码'
              this.codeDisabled = false
              clearInterval(this.timer)
            }
          }, 1000)
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
    // 登录验证
    verifyLogin () {
      // 验证手机
      let phone = this.phone
      if (phone) {
        if (!this.$common.checkPhone(phone)) {
          this.$message({
            showClose: true,
            message: '手机号码格式有误!',
            type: 'warning'
          })
          return
        }
      } else {
        this.$message({
          showClose: true,
          message: '请输入手机号码!',
          type: 'warning'
        })
        return
      }
      // 验证验证码
      let authCode = this.authCode
      if (!authCode) {
        this.$message({
          showClose: true,
          message: '请输入验证码!',
          type: 'warning'
        })
        return
      }
      let saveCode = this.saveCode.authCode
      let savePhone = this.saveCode.phone
      if (saveCode) {
        if (phone === savePhone && authCode === saveCode) {
          this.loginSkip()
        } else {
          this.$message({
            showClose: true,
            message: '验证码错误请重新输入！',
            type: 'warning'
          })
        }
      } else {
        this.$message({
          showClose: true,
          message: '请先获取验证码!',
          type: 'warning'
        })
      }
    },
    // 登录跳转
    loginSkip () {
      let params = { type: 1, user_phone: this.phone }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.3/login',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 存储登录返回数据
          const loginData = res.data.data1
          // 存储本次登录需要用到的数据
          // 存储Token
          let token = loginData.user.token
          sessionStorage.setItem('wxWebToken', token)
          // 存储公司ID
          let companyId = loginData.user.company_id
          // 存储公司名称
          let companyName = loginData.user.company_name
          // 存储用户ID
          let userId = loginData.user.user_id
          // 存储用户名称
          let userName = loginData.user.user_name
          // 存储用户角色id
          let roleId = loginData.user.role_id
          // 存储用户部门id
          let sectorId = loginData.user.ogz_id
          // 存储用户号码
          let userPhone = loginData.user.user_phone
          // 存储用户头像
          let userPhoto = loginData.user.head_picture || ''
          // 存储用户全部项目
          const allProject = loginData.projects
          // 判断是否有项目
          if (allProject.length === 0) {
            this.$message({
              showClose: true,
              message: '您还未分配项目，请联系管理员分配项目！',
              type: 'warning'
            })
            return
          }
          // 保存用户基本信息
          const info = {
            companyId,
            companyName,
            userId,
            userName,
            roleId,
            sectorId,
            userPhone,
            userPhoto
          }
          this.setUserInfo(info)
          // 保存所有项目
          this.setAllProject(allProject)
          // 保存用户当前项目
          let project = {}
          let nowProid = loginData.user.last_project || ''
          if (nowProid) {
            nowProid = Number.parseInt(nowProid)
            const nowProject = allProject.find(item => {
              return item.project_id === nowProid
            })
            if (nowProject) {
              project = {
                id: nowProid,
                name: nowProject.project_name,
                orgId: nowProject.organize_id,
                companyId: nowProject.company_id
              }
            } else {
              project = {
                id: nowProject[0].project_id,
                name: nowProject[0].project_name,
                orgId: nowProject[0].organize_id,
                companyId: nowProject[0].company_id
              }
            }
          }
          this.setNowProject(project)
          /* 存储权限 */
          const userAuts = loginData.permissions
          // 模块权限
          let modAuthority = {
            home: false,
            log: false,
            organ: false,
            user: false,
            approval: false,
            position: false,
            site: false,
            crewcollect: false,
            poscover: false,
            posclockall: false,
            trackall: false,
            trackdet: false,
            group: false,
            plan: false,
            task: false,
            calendar: false,
            normoam: false,
            abnormal: false,
            normexecute: false,
            fixedpostRep: false,
            fixedpostLog: false,
            callnameSet: false,
            callnameRep: false,
            crewclockrate: false,
            crewclockdet: false,
            shift: false,
            schedul: false,
            nosalary: false,
            salary: false,
            work: false,
            rule: false,
            envmonit: false,
            envccd: false,
            envswg: false,
            monitman: false,
            envalarm: false,
            hardfac: false,
            comnorm: false,
            pronorm: false,
            vehicleAdmin: false,
            vehicleMonit: false,
            bangleAdmin: false,
            bangleMonit: false,
            gpsAlarmlog: false,
            waterAdmin: false,
            waterMonit: false,
            reportTask: false,
            reportSite: false,
            reportStaff: false,
            reportWorkpro: false,
            reportWorksta: false,
            event: false,
            videoSetting: false,
            videoPlaza: false
          }
          // 权限详情
          let detAuthority = {
            home: [],
            organ: [],
            user: [],
            approval: [],
            position: [],
            site: [],
            crewcollect: [],
            poscover: [],
            posclockall: [],
            trackall: [],
            trackdet: [],
            group: [],
            plan: [],
            task: [],
            calendar: [],
            normoam: [],
            abnormal: [],
            normexecute: [],
            fixedpostRep: [],
            fixedpostLog: [],
            callnameSet: [],
            callnameRep: [],
            crewclockrate: [],
            crewclockdet: [],
            shift: [],
            schedul: [],
            nosalary: [],
            salary: [],
            work: [],
            rule: [],
            envccd: [],
            envswg: [],
            monitman: [],
            envalarm: [],
            hardfac: [],
            comnorm: [],
            pronorm: [],
            vehicleAdmin: [],
            vehicleMonit: [],
            bangleAdmin: [],
            bangleMonit: [],
            gpsAlarmlog: [],
            waterAdmin: [],
            waterMonit: [],
            reportTask: [],
            reportSite: [],
            reportStaff: [],
            reportWorkpro: [],
            reportWorksta: [],
            event: [],
            videoSetting: [],
            videoPlaza: []
          }
          userAuts.forEach(item => {
            if (item.function_id === 2 || item.function_id === 3 || item.function_id === 4 || item.function_id === 5 || item.function_id === 6 || item.function_id === 7) { // 首页
              modAuthority.home = true
              detAuthority.home.push(item.function_id)
            } else if (item.function_id === 224) { // 日志管理
              modAuthority.log = true
            } else if (item.function_id === 10 || item.function_id === 11 || item.function_id === 12 || item.function_id === 16) { // 组织管理
              modAuthority.organ = true
              detAuthority.organ.push(item.function_id)
            } else if (item.function_id === 14 || item.function_id === 15 || item.function_id === 17 || item.function_id === 18 || item.function_id === 19 || item.function_id === 20) { // 用户管理
              modAuthority.user = true
              detAuthority.user.push(item.function_id)
            } else if (item.function_id === 23 || item.function_id === 24 || item.function_id === 25) { // 审批管理
              modAuthority.approval = true
              detAuthority.approval.push(item.function_id)
            } else if (item.function_id === 28 || item.function_id === 29 || item.function_id === 30) { // 位置管理
              modAuthority.position = true
              detAuthority.position.push(item.function_id)
            } else if (item.function_id === 32 || item.function_id === 33 || item.function_id === 34 || item.function_id === 35 || item.function_id === 36 || item.function_id === 37) { // 地址管理
              modAuthority.site = true
              detAuthority.site.push(item.function_id)
            } else if (item.function_id === 40) { // 人员管理汇总
              modAuthority.crewcollect = true
              detAuthority.crewcollect.push(item.function_id)
            } else if (item.function_id === 42) { // 位置巡查覆盖率
              modAuthority.poscover = true
              detAuthority.poscover.push(item.function_id)
            } else if (item.function_id === 44) { // 位置打卡汇总
              modAuthority.posclockall = true
              detAuthority.posclockall.push(item.function_id)
            } else if (item.function_id === 46) { // 轨迹记录总览
              modAuthority.trackall = true
              detAuthority.trackall.push(item.function_id)
            } else if (item.function_id === 49 || item.function_id === 52) { // 轨迹记录详情
              modAuthority.trackdet = true
              detAuthority.trackdet.push(item.function_id)
            } else if (item.function_id === 54 || item.function_id === 55 || item.function_id === 56 || item.function_id === 57) { // 组管理
              modAuthority.group = true
              detAuthority.group.push(item.function_id)
            } else if (item.function_id === 58 || item.function_id === 59 || item.function_id === 60 || item.function_id === 61) { // 巡检计划管理
              modAuthority.plan = true
              detAuthority.plan.push(item.function_id)
            } else if (item.function_id === 63 || item.function_id === 64 || item.function_id === 65 || item.function_id === 66 || item.function_id === 67 || item.function_id === 68 || item.function_id === 69) { // 巡检任务
              modAuthority.task = true
              detAuthority.task.push(item.function_id)
            } else if (item.function_id === 71 || item.function_id === 216) { // 巡检日历
              modAuthority.calendar = true
              detAuthority.calendar.push(item.function_id)
            } else if (item.function_id === 73 || item.function_id === 74 || item.function_id === 75 || item.function_id === 76) { // 标准维护管理
              modAuthority.normoam = true
              detAuthority.normoam.push(item.function_id)
            } else if (item.function_id === 78) { // 异常检查项
              modAuthority.abnormal = true
              detAuthority.abnormal.push(item.function_id)
            } else if (item.function_id === 80) { // 巡检标准执行汇总
              modAuthority.normexecute = true
              detAuthority.normexecute.push(item.function_id)
            } else if (item.function_id === 83 || item.function_id === 84 || item.function_id === 85 || item.function_id === 86) { // 固定岗打卡报表
              modAuthority.fixedpostRep = true
              detAuthority.fixedpostRep.push(item.function_id)
            } else if (item.function_id === 88) { // 固定岗打卡记录
              modAuthority.fixedpostLog = true
              detAuthority.fixedpostLog.push(item.function_id)
            } else if (item.function_id === 91 || item.function_id === 92 || item.function_id === 93 || item.function_id === 94) { // 点名设置
              modAuthority.callnameSet = true
              detAuthority.callnameSet.push(item.function_id)
            } else if (item.function_id === 96 || item.function_id === 97) { // 点名报表
              modAuthority.callnameRep = true
              detAuthority.callnameRep.push(item.function_id)
            } else if (item.function_id === 99) { // 人员打卡率报表
              modAuthority.crewclockrate = true
              detAuthority.crewclockrate.push(item.function_id)
            } else if (item.function_id === 101 || item.function_id === 102) { // 人员打卡详情
              modAuthority.crewclockdet = true
              detAuthority.crewclockdet.push(item.function_id)
            } else if (item.function_id === 105 || item.function_id === 106 || item.function_id === 107 || item.function_id === 108) { // 编制排班
              modAuthority.shift = true
              detAuthority.shift.push(item.function_id)
            } else if (item.function_id === 110 || item.function_id === 112 || item.function_id === 113) { // 排班管理
              modAuthority.schedul = true
              detAuthority.schedul.push(item.function_id)
            } else if (item.function_id === 115 || item.function_id === 116) { // 无感考勤报表
              modAuthority.nosalary = true
              detAuthority.nosalary.push(item.function_id)
            } else if (item.function_id === 118) { // 设备考勤报表
              modAuthority.salary = true
              detAuthority.salary.push(item.function_id)
            } else if (item.function_id === 121 || item.function_id === 122 || item.function_id === 123 || item.function_id === 126 || item.function_id === 127 || item.function_id === 128) { // 工单列表
              modAuthority.work = true
              detAuthority.work.push(item.function_id)
            } else if (item.function_id === 130 || item.function_id === 131) { // 异常处理规则设置
              modAuthority.rule = true
              detAuthority.rule.push(item.function_id)
            } else if (item.function_id === 135 || item.function_id === 136 || item.function_id === 137 || item.function_id === 138 || item.function_id === 139) { // 环境监控设置 => 环境监控传感器
              modAuthority.envmonit = true
              modAuthority.envccd = true
              detAuthority.envccd.push(item.function_id)
            } else if (item.function_id === 141 || item.function_id === 142 || item.function_id === 143 || item.function_id === 144) { // 环境监控设置 => 环境监控网关
              modAuthority.envmonit = true
              modAuthority.envswg = true
              detAuthority.envswg.push(item.function_id)
            } else if (item.function_id === 146) { // 环境监控
              modAuthority.monitman = true
              detAuthority.monitman.push(item.function_id)
            } else if (item.function_id === 148 || item.function_id === 149) { // 告警记录
              modAuthority.envalarm = true
              detAuthority.envalarm.push(item.function_id)
            } else if (item.function_id === 152 || item.function_id === 153 || item.function_id === 154 || item.function_id === 225 || item.function_id === 226) { // 硬件设备管理
              modAuthority.hardfac = true
              detAuthority.hardfac.push(item.function_id)
            } else if (item.function_id === 168 || item.function_id === 169) { // 企业标准维护
              modAuthority.comnorm = true
              detAuthority.comnorm.push(item.function_id)
            } else if (item.function_id === 171 || item.function_id === 172) { // 项目标准维护
              modAuthority.pronorm = true
              detAuthority.pronorm.push(item.function_id)
            } else if (item.function_id === 175 || item.function_id === 176 || item.function_id === 177 || item.function_id === 178 || item.function_id === 179 || item.function_id === 180) { // 手环管理
              modAuthority.vehicleAdmin = true
              detAuthority.vehicleAdmin.push(item.function_id)
            } else if (item.function_id === 182 || item.function_id === 183) { // 车辆监控
              modAuthority.vehicleMonit = true
              detAuthority.vehicleMonit.push(item.function_id)
            } else if (item.function_id === 185 || item.function_id === 186 || item.function_id === 187 || item.function_id === 188 || item.function_id === 189 || item.function_id === 190) { // 车辆管理
              modAuthority.bangleAdmin = true
              detAuthority.bangleAdmin.push(item.function_id)
            } else if (item.function_id === 192 || item.function_id === 193) { // 手环监控
              modAuthority.bangleMonit = true
              detAuthority.bangleMonit.push(item.function_id)
            } else if (item.function_id === 195) { // 告警记录
              modAuthority.gpsAlarmlog = true
              detAuthority.gpsAlarmlog.push(item.function_id)
            } else if (item.function_id === 198 || item.function_id === 199 || item.function_id === 200 || item.function_id === 201 || item.function_id === 202) { // 抄表设备管理
              modAuthority.waterAdmin = true
              detAuthority.waterAdmin.push(item.function_id)
            } else if (item.function_id === 204) { // 水表监控
              modAuthority.waterMonit = true
              detAuthority.waterMonit.push(item.function_id)
            } else if (item.function_id === 157) { // 巡检任务执行报表
              modAuthority.reportTask = true
              detAuthority.reportTask.push(item.function_id)
            } else if (item.function_id === 159) { // 巡检地址信息报表
              modAuthority.reportSite = true
              detAuthority.reportSite.push(item.function_id)
            } else if (item.function_id === 161) { // 个人巡检执行报表
              modAuthority.reportStaff = true
              detAuthority.reportStaff.push(item.function_id)
            } else if (item.function_id === 163) { // 项目工单报表
              modAuthority.reportWorkpro = true
              detAuthority.reportWorkpro.push(item.function_id)
            } else if (item.function_id === 165) { // 员工工单报表
              modAuthority.reportWorksta = true
              detAuthority.reportWorksta.push(item.function_id)
            } else if (item.function_id === 214 || item.function_id === 215) { // 事件列表
              modAuthority.event = true
              detAuthority.event.push(item.function_id)
            } else if (item.function_id === 207 || item.function_id === 208 || item.function_id === 209) { // 视频监控设置
              modAuthority.videoSetting = true
              detAuthority.videoSetting.push(item.function_id)
            } else if (item.function_id === 211 || item.function_id === 212) { // 视频广场
              modAuthority.videoPlaza = true
              detAuthority.videoPlaza.push(item.function_id)
            }
          })
          // 存储权限
          this.setModAuthority(modAuthority)
          this.setDetAuthority(detAuthority)
          // 保存机构树
          const orgTree = loginData.trees
          // 处理公司部门
          let orgData1 = this.disCompanyDep(JSON.parse(JSON.stringify(orgTree)))
          this.setOrganTree(orgData1)
          // 处理部门
          let orgData2 = this.recOrganData(JSON.parse(JSON.stringify(orgTree)))
          this.setOrganData(orgData2)
          // 路由跳转
          this.$router.push({ path: '/main/home' })
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
    // 初始化处理部门
    recOrganData (data) {
      data.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.recOrganData(item.children)
        }
      })
      return data
    },
    // 初始化处理企业分公司部门
    disCompanyDep  (data) {
      data.forEach((item, index, array) => {
        if (item.children) {
          this.recCompanyDep(item.children, item.organize_type)
        }
      })
      return data
    },
    recCompanyDep  (data, type) {
      data.forEach((item, index, array) => {
        if (type === 0 || type === 1 || type === 2) {
          if (item.organize_type === 4) {
            item.disabled = true
          }
        }
        if (item.children) {
          this.recCompanyDep(item.children, item.organize_type)
        }
      })
    }
  },
  watch: {
    phone (newVal, oldVal) {
      if (newVal) {
        this.codeDisabled = false
      } else {
        this.codeDisabled = true
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>

<style lang="less" scoped>
  .code{
    .item{
      padding-bottom: 30px;
      .item-content{
        position: relative;
        height: 40px;
        .iconfont{
          position: absolute;
          width: 60px;
          height: 100%;
          left: 0;
          top: 0;
          background: #4fa5f2;
          border-radius: 6px;
          line-height: 40px;
          text-align: center;
          font-size: 24px;
          color: #ffffff;
        }
        .item-input{
          height: 100%;
          padding-left: 60px;
          background: #eaeef2;
          border-radius: 6px;
          .input{
            display: block;
            width: 100%;
            height: 100%;
            padding-left: 6px;
            font-size: 14px;
            color: #272727;
            border: none;
            background: transparent;
            -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          }
        }
        .el-button{
          position: absolute;
          right: 0;
          top: 0;
          height: 40px;
          font-size: 14px;
        }
      }
    }
    .other{
      height: 60px;
      color: #272727;
      font-size: 14px;
      text-align: right;
    }
    .login-btn{
      height: 40px;
      .el-button{
        display: block;
        width: 100%;
        height: 100%;
        background: #4fa5f2;
        color: #ffffff;
        font-size: 16px;
        border: none;
        border-radius: 20px;
      }
    }
  }
</style>
