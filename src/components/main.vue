<template>
  <div class="main">
    <el-container style="height: 100%">
      <el-header class="main-header">
        <div class="left main-header-title">
          <img src="../assets/images/logo.png" height="42" alt="">
          <h2 class="title">{{ companyName }}</h2>
        </div>
        <div class="right main-header-nav">
          <div class="nav-item">
            <el-select v-model="nowProid" filterable placeholder="请选择项目" :disabled="proDisabled" @change="projectChange">
              <el-option
                v-for="item in allPros"
                :key="item.project_id"
                :label="item.project_name"
                :value="item.project_id">
              </el-option>
            </el-select>
          </div>
          <div class="nav-item" v-if="authority.log">
            <router-link class="log" to="/main/log"><i class="iconfont icon-log" style="font-size: 32px;"></i></router-link>
          </div>
          <div class="nav-item">
            <router-link to="/main/message">
              <el-badge :value="unreadMesCount" :max="99" class="mes-hint">
                <i class="iconfont icon-xiaoxi"></i>
              </el-badge>
            </router-link>
          </div>
          <div class="nav-item">
            <div class="user">
              <el-dropdown class="user-item user-img">
                <div class="el-dropdown-link img">
                  <img :src="iconUrl" alt="" />
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item><a href="javascript:void(0);" @click="clickDatum">个人资料</a></el-dropdown-item>
                  <el-dropdown-item><a href="javascript:void(0);" @click="comPwdClick">修改密码</a></el-dropdown-item>
                  <el-dropdown-item><a href="javascript:void(0);" @click="quitLogin">退出登录</a></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <div class="user-item">
                <p>{{ userName }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-container class="main-container" style="height: 100%">
        <el-aside width="240px" class="main-menu">
          <el-menu
            :unique-opened="true"
            :router="true"
            :default-active="menuActive"
            text-color="#fff"
            background-color="#2f4055"
            active-text-color="#fff">
            <el-menu-item index="/main/home" style="font-size: 0;">
              <i class="iconfont icon-yemian-copy-copy-copy-copy"></i>
              <span slot="title" style="font-size: 18px;">首页</span>
            </el-menu-item>
            <el-submenu index="1" class="submenu-item" v-if="authority.organ || authority.user || authority.shift || authority.approval">
              <template slot="title"><i class="iconfont icon-qiye"></i>企业管理</template>
              <el-menu-item-group v-if="authority.organ && companyId === 1">
                <el-menu-item index="/main/oorgan/empty">组织机构</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.organ && companyId !== 1">
                <el-menu-item index="/main/corgan/empty">组织机构</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.user && companyId === 1">
                <el-menu-item index="/main/ouser">用户列表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.user && companyId !== 1">
                <el-menu-item index="/main/cuser">用户列表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.shift">
                <el-menu-item index="/main/shift">编制排班</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.shift">
                <el-menu-item index="/main/scheduling">排班管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.approval">
                <el-menu-item index="/main/approval">审批列表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="2" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-shezhi"></i>基础配置</template>
              <el-menu-item-group>
                <el-menu-item index="/main/position">位置管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/posmap">地图管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="3" class="submenu-item">
              <template slot="title"><i class="iconfont icon-xunjianguanli"></i>巡检管理</template>
              <el-menu-item-group v-if="authority.site">
                <el-menu-item index="/main/site">地址管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/group">组管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/plan">巡检计划管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.task">
                <el-menu-item index="/main/task">巡检任务</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/fixedpost">固定岗管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/fixedpost-log">固定岗打卡记录</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/calendar">巡检日历</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.norm">
                <el-menu-item index="/main/norm">巡检标准维护</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.abnormal">
                <el-menu-item index="/main/abnormal">异常检查项</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="4" class="submenu-item">
              <template slot="title"><i class="iconfont icon-renyuanweizhi"></i>人员位置管理</template>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/loccollect">人员管理汇总</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/callname">点名管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/crewclock">人员打卡报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/clocklog">位置打卡记录</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/locman">轨迹记录总览</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/loclog">轨迹记录详情</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.plan">
                <el-menu-item index="/main/crewtrack">人员轨迹图</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="5" class="submenu-item">
              <template slot="title"><i class="iconfont icon-ccgl-fahuodanguanli-5"></i>工单管理</template>
              <el-menu-item-group v-if="authority.work">
                <el-menu-item index="/main/work">工单列表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.rule">
                <el-menu-item index="/main/rule">异常处理规则设置</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="6" class="submenu-item" v-if="authority.polcard">
              <template slot="title"><i class="iconfont icon-shebeiguanli1"></i>设备管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/hardfac">硬件设备管理</el-menu-item>
              </el-menu-item-group>
              <!--<el-menu-item-group>-->
                <!--<el-menu-item index="/main/polcard">巡检绑卡管理</el-menu-item>-->
              <!--</el-menu-item-group>-->
            </el-submenu>
            <el-submenu index="7" class="submenu-item" v-if="authority.polReport || authority.workReport">
              <template slot="title"><i class="iconfont icon-baobiaoguanli"></i>报表管理</template>
              <el-menu-item-group v-if="authority.polReport">
                <el-menu-item index="/main/report-task">巡检任务执行报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.polReport">
                <el-menu-item index="/main/report-site">巡检地址信息报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.polReport">
                <el-menu-item index="/main/report-staff">个人巡检执行报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.workReport">
                <el-menu-item index="/main/report-workpro">项目工单报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.workReport">
                <el-menu-item index="/main/report-worksta">员工工单报表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="8" class="submenu-item" v-if="authority.videoSetting || authority.videoPlaza">
              <template slot="title"><i class="iconfont icon-jiankong"></i>视频监控</template>
              <el-menu-item-group v-if="authority.videoSetting">
                <el-menu-item index="/main/video-setting">视频监控设置</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.videoPlaza">
                <el-menu-item index="/main/video-plaza">视频广场</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="9" class="submenu-item" v-if="authority.event">
              <template slot="title"><i class="iconfont icon-shijian"></i>事件管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/event">事件列表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main class="main-module">
          <!--<router-view />-->
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive"/>
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive"/>
        </el-main>
      </el-container>
    </el-container>
    <!-- 个人资料 -->
    <el-dialog title="个人资料" :visible.sync="datumDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="datumForm" :rules="rules" ref="ruleDatumForm" :label-width="formLabelWidth">
        <el-form-item label="用户姓名" prop="name">
          <el-input :disabled="true" v-model="datumForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input :disabled="true" v-model="datumForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input :disabled="true" v-model="datumForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="所属组织" prop="organize">
          <el-input :disabled="true" v-model="datumForm.orgName"></el-input>
        </el-form-item>
        <el-form-item label="授权范围" prop="projects">
          <el-input type="textarea" :rows="2" :disabled="true" v-model="datumForm.proNames"></el-input>
        </el-form-item>
        <el-form-item label="技能" prop="skills">
          <el-input type="textarea" :rows="2" :disabled="true" v-model="datumForm.skillNames"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="datumDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 修改密码 -->
    <el-dialog title="修改密码" :visible.sync="pwdDialog" :show-close="false" :close-on-click-modal="false" custom-class="small-dialog">
      <div v-if="showVerify">
        <el-form :model="pwdForm" :rules="pwdRules" ref="ruleOldForm" :label-width="formOldWidth">
          <el-form-item label="原密码" prop="old">
            <el-input type="password" v-model="pwdForm.old" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="operate">
          <el-button type="primary" class="operate-btn" @click="verifyOldPwd('ruleOldForm')">验证密码</el-button>
          <el-button class="operate-btn" @click="resetPwdForm('ruleOldForm')">取&nbsp;&nbsp;&nbsp;&nbsp;消</el-button>
        </div>
      </div>
      <div v-else>
        <el-form :model="pwdForm" :rules="pwdRules" ref="ruleNowForm" :label-width="formNowWidth">
          <el-form-item label="新密码" prop="now1">
            <el-input type="password" v-model="pwdForm.now1" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="再次输入新密码" prop="now2">
            <el-input type="password" v-model="pwdForm.now2" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="operate">
          <el-button type="primary" class="operate-btn" @click="verifyNowPwd('ruleNowForm')">修改密码</el-button>
          <el-button class="operate-btn" @click="resetPwdForm('ruleNowForm')">取&nbsp;&nbsp;&nbsp;&nbsp;消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import initIcon from '../assets/images/head.png'
export default{
  name: 'App',
  data () {
    let checkPwd = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]\w{5,17}$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('密码必须为6-18位字母或数字'))
        }
      } else {
        callback(new Error('请输入新密码'))
      }
    }
    let affirmPwd = (rule, value, callback) => {
      if (value) {
        const nowPwd = this.pwdForm.now1
        if (value === nowPwd) {
          callback()
        } else {
          callback(new Error('两次输入不同，请核对后再输入'))
        }
      } else {
        callback(new Error('请再次输入新密码'))
      }
    }
    return {
      menuActive: '',
      iconUrl: '',
      datumDialog: false,
      formLabelWidth: '100px',
      datumForm: {
        name: '',
        phone: '',
        roleName: '',
        orgName: '',
        proNames: '',
        skillNames: ''
      },
      rules: {

      },
      pwdDialog: false,
      formOldWidth: '100px',
      formNowWidth: '130px',
      showVerify: true,
      pwdForm: {
        old: '',
        now1: '',
        now2: ''
      },
      pwdRules: {
        old: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        now1: [
          { required: true, validator: checkPwd, trigger: 'blur' }
        ],
        now2: [
          { required: true, validator: affirmPwd, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.menuActive = this.$route.path
  },
  mounted () {
    // 头像
    let iconUrl = this.userPhoto
    if (iconUrl) {
      iconUrl = this.sysetApi() + '/showImage?state=0&filename=' + iconUrl
    } else {
      iconUrl = initIcon
    }
    this.iconUrl = iconUrl
    // 未读消息数
    this.getMesUnread()
  },
  computed: {
    ...mapState(
      {
        companyName: state => state.info.companyName,
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        userName: state => state.info.userName,
        userPhone: state => state.info.userPhone,
        userPhoto: state => state.info.userPhoto,
        allPros: state => state.info.allPros,
        authority: state => state.authority,
        proDisabled: state => state.proDisabled,
        unreadMesCount: state => state.unreadMesCount
      }
    ),
    nowProid: {
      get () {
        return this.$store.state.nowProid
      },
      set (value) {
        this.$store.commit('nowProChange', value)
      }
    }
  },
  methods: {
    // 保存项目id
    projectChange (value) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: value
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/switchProject',
        data: params
      }).then((res) => {
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 个人资料 */
    clickDatum () {
      this.datumDialog = true
      this.datumForm = {
        name: '',
        phone: '',
        roleName: '',
        orgName: '',
        proNames: '',
        skillNames: ''
      }
      this.getPersonDatum()
    },
    // 获取个人资料
    getPersonDatum () {
      let params = {
        userN_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUserOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 授权范围
          const accredits = itemData.userOgzs
          let accreditName = []
          accredits.forEach(item => {
            accreditName.push(item.organize_name)
          })
          accreditName = accreditName.join('、')
          // 技能
          const skills = itemData.userSkls
          let parSkillName = []
          skills.forEach(item => {
            parSkillName.push(item.parent_name)
          })
          parSkillName = parSkillName.join('、')
          this.datumForm = {
            name: itemData.user_name,
            phone: itemData.user_phone,
            roleName: itemData.role_name,
            orgName: itemData.organize_name,
            proNames: accreditName,
            skillNames: parSkillName
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
    // 重置表单
    resetDatumForm (formName) {
      this.$refs[formName].resetFields()
      this.datumDialog = false
    },
    // 验证表单
    submitDatumForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendDatumRequest()
        } else {
          return false
        }
      })
    },
    // 提交
    sendDatumRequest () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        userN_id: this.userId,
        user_name: this.datumForm.name,
        user_phone: this.datumForm.phone,
        user_sex: this.datumForm.sex,
        birthday: this.datumForm.birthday,
        native_place: this.datumForm.native,
        id_card: this.datumForm.identity,
        role_id: this.datumForm.roleId,
        ogz_id: this.datumForm.orgId,
        project_ids: this.datumForm.proIds,
        skills_id: this.datumForm.skillIds
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/alterUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetDatumForm('ruleDatumForm')
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
    /* 修改密码 */
    comPwdClick () {
      this.pwdDialog = true
      this.showVerify = true
      this.pwdForm = {
        old: '',
        now1: '',
        now2: ''
      }
    },
    // 重置表单
    resetPwdForm (formName) {
      this.$refs[formName].resetFields()
      this.pwdDialog = false
    },
    // 验证表单
    verifyOldPwd (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendOldVerify()
        } else {
          return false
        }
      })
    },
    // 提交旧密码验证
    sendOldVerify () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        login_pass: this.pwdForm.old
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/judgePWD',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.showVerify = false
        } else {
          this.$message({
            showClose: true,
            message: '您输入的原密码有误，请重新输入',
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
    // 验证表单
    verifyNowPwd (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendComPwd()
        } else {
          return false
        }
      })
    },
    // 提交密码修改
    sendComPwd () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        user_phone: this.userPhone,
        login_pass: this.pwdForm.now1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/updateUserPass',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 成功提示
          this.$message({
            showClose: true,
            message: '密码修改成功',
            type: 'success'
          })
          // 重置表单
          this.pwdDialog = false
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
    /* 消息 */
    getMesUnread () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/findNrMyMessageTotal',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1[0]
          // 工作通知
          const workCount = itemData.workNrTotal || 0
          // e掌巡管理助手
          const helperCount = itemData.manageNrTotal || 0
          // e掌巡管理小秘书
          const clerkCount = itemData.secretaryNrTotal || 0
          // 总未读数
          const allCount = workCount + helperCount + clerkCount
          this.$store.commit('setUnreadMesCount', allCount)
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
    // 跳转消息
    messageClick () {
      // 跳转
      this.$router.push({ path: '/main/message' })
    },
    /* 退出登录 */
    quitLogin () {
      sessionStorage.removeItem('wxWebToken')
      this.$router.push({ path: '/login/cipher' })
    }
  },
  watch: {
    nowProid (newVal, oldVal) {
      // 刷新页面
      this.$router.go(0)
    }
  }
}
</script>

<style lang="less">
  .main{
    height: 100%;
    .main-header {
      height: 60px;
      padding: 0 20px;
      background: #4e97d8;
      color: #fff;
      .main-header-title{
        font-size: 0;
        img{
          vertical-align: middle;
        }
        .title{
          display: inline-block;
          vertical-align: middle;
          margin-left: 5px;
          line-height: 60px;
          font-size: 24px;
        }
      }
      .main-header-nav{
        font-size: 0;
        .bd-right{
          border-right: 1px solid #ffffff;
        }
        .nav-item{
          vertical-align: middle;
          display: inline-block;
          padding: 0 10px;
          height: 60px;
          line-height: 60px;
          .mes-hint{
            text-align: center;
            line-height: 40px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            .iconfont{
              color: #ffffff;
              font-size: 32px;
            }
          }
          .user{
            .user-item{
              display: inline-block;
              vertical-align: middle;
              p{
                padding-left: 10px;
                line-height: 24PX;
                font-size: 14px;
                color: #ffffff;
              }
              &.user-img{
                .img{
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  overflow: hidden;
                  background: #ffffff;
                  img{
                    width: 38px;
                    height: 38px;
                  }
                }
              }
            }

          }
          .log{
            .iconfont{
              font-size: 24px;
              color: #ffffff;
            }
          }
        }
      }
      .nav-date{
        .txt{
          font-size: 12px;
        }
      }
    }
    .main-container{
      .main-menu{
        height: 100%;
        padding-bottom: 20px;
        background-color: #2f4055;
        .el-menu{
          border-right: none;
          .iconfont{
            color: #ffffff;
            font-size: 24px;
            margin-right: 10px;
          }
          .el-submenu__icon-arrow{
            font-size: 18px;
            color: #ffffff;
          }
          .el-submenu__title{
            font-size: 18px;
            background-color: #2f4055 !important;
          }
          .el-menu-item-group .el-menu-item-group__title{
            padding: 0;
          }
          .submenu-item .el-menu-item {
            background-color: #253344 !important;
          }
          .el-menu-item.is-active{
            background: #1d2c3e !important;
          }
          .el-icon-arrow-down:before {
            content: "\E60E";
          }
          .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow{
            transform: rotateZ(90deg);
          }
        }
      }
      .main-module {
        height: 100%;
        padding-top: 0;
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 20px;
        background: #f0f3f4;
      }
    }
    .small-dialog{
      .operate{
        text-align: center;
      }
    }
  }
</style>
