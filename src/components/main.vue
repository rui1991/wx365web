<template>
  <div class="main">
    <el-container style="height: 100%">
      <el-header height="60px" class="main-header">
        <div class="main-header-title">
          <img src="../assets/images/logo.png" height="42" alt="">
          <h2 class="title">{{ companyName }}</h2>
        </div>
        <div class="main-header-nav">
          <div class="nav-item">
            <el-select v-model="nowProjectId" filterable placeholder="请选择项目" :disabled="proDisabled" @change="projectChange">
              <el-option
                v-for="item in allProject"
                :key="item.project_id"
                :label="item.project_name"
                :value="item.project_id">
              </el-option>
            </el-select>
          </div>
          <div class="nav-item" v-if="modAuthority.log">
            <router-link class="log" to="/main/log"><i class="iconfont iconlog" style="font-size: 32px;"></i></router-link>
          </div>
          <div class="nav-item">
            <router-link to="/main/message">
              <el-badge :value="unreadMesCount" :max="99" class="mes-hint">
                <i class="iconfont iconxiaoxi"></i>
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
                  <el-dropdown-item><a href="javascript:void(0);" @click="introDialog = true">个人资料</a></el-dropdown-item>
                  <el-dropdown-item><a href="javascript:void(0);" @click="pwdDialog = true">修改密码</a></el-dropdown-item>
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
              <i class="iconfont iconyemian-copy-copy-copy-copy"></i>
              <span slot="title" style="font-size: 18px;">首页</span>
            </el-menu-item>
            <el-submenu index="1" class="submenu-item" v-if="modAuthority.organ || modAuthority.user || modAuthority.approval">
              <template slot="title"><i class="iconfont iconqiye"></i>企业配置</template>
              <el-menu-item-group v-if="modAdminUid.indexOf(userId) !== -1">
                <el-menu-item index="/main/moduleAdmin">模块管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAdminUid.indexOf(userId) !== -1">
                <el-menu-item index="/main/role">角色管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.organ && companyId === 1">
                <el-menu-item index="/main/organBC">组织管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.organ && companyId !== 1">
                <el-menu-item index="/main/organKH">组织管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.user && companyId === 1">
                <el-menu-item index="/main/userBC">用户管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.user && companyId !== 1">
                <el-menu-item index="/main/userKH">用户管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.approval">
                <el-menu-item index="/main/approval">审批管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="2" class="submenu-item" v-if="modAuthority.position || modAuthority.site">
              <template slot="title"><i class="iconfont iconshezhi"></i>基础配置</template>
              <el-menu-item-group v-if="modAuthority.position">
                <el-menu-item index="/main/position">位置管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.site">
                <el-menu-item index="/main/site">地址管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="3" class="submenu-item" v-if="modAuthority.crewcollect || modAuthority.poscover || modAuthority.trackall || modAuthority.trackdet">
              <template slot="title"><i class="iconfont iconpinzhibaozhang"></i>品质过程管理</template>
              <el-menu-item-group v-if="modAuthority.crewcollect">
                <el-menu-item index="/main/crewcollect">人员管理汇总</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.poscover">
                <el-menu-item index="/main/poscover">位置巡查覆盖率</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.posclockall">
                <el-menu-item index="/main/posclockall">位置打卡汇总</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.trackall">
                <el-menu-item index="/main/trackall">轨迹记录总览</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.trackdet">
                <el-menu-item index="/main/trackdet">轨迹记录详情</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="4" class="submenu-item" v-if="modAuthority.group || modAuthority.plan || modAuthority.task || modAuthority.calendar || modAuthority.normoam || modAuthority.abnormal || modAuthority.normexecute">
              <template slot="title"><i class="iconfont iconxunjianguanli"></i>巡检巡查</template>
              <el-menu-item-group v-if="modAuthority.group">
                <el-menu-item index="/main/group">组管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.plan">
                <el-menu-item index="/main/plan">巡检计划管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.task">
                <el-menu-item index="/main/task">巡检任务</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.calendar">
                <el-menu-item index="/main/calendar">巡检日历</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.normoam">
                <el-menu-item index="/main/normoam">标准维护管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.abnormal">
                <el-menu-item index="/main/abnormal">异常检查项</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.normexecute">
                <el-menu-item index="/main/normexecute">巡检标准执行汇总</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="5" class="submenu-item" v-if="modAuthority.fixedpostRep || modAuthority.fixedpostLog">
              <template slot="title"><i class="iconfont iconguding"></i>固定岗管理</template>
              <el-menu-item-group v-if="modAuthority.fixedpostRep">
                <el-menu-item index="/main/fixedpost-rep">固定岗打卡报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.fixedpostLog">
                <el-menu-item index="/main/fixedpost-log">固定岗打卡记录</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="6" class="submenu-item" v-if="modAuthority.callnameSet || modAuthority.callnameRep || modAuthority.crewclockrate || modAuthority.crewclockdet">
              <template slot="title"><i class="iconfont icondianmin"></i>点名管理</template>
              <el-menu-item-group v-if="modAuthority.callnameSet">
                <el-menu-item index="/main/callname-set">点名设置</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.callnameRep">
                <el-menu-item index="/main/callname-rep">点名报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.crewclockrate">
                <el-menu-item index="/main/crewclockrate">人员打卡率报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.crewclockdet">
                <el-menu-item index="/main/crewclockdet">人员打卡详情</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="7" class="submenu-item" v-if="modAuthority.shift || modAuthority.schedul || modAuthority.nosalary || modAuthority.salary">
              <template slot="title"><i class="iconfont iconkaoqinguanli"></i>考勤管理</template>
              <el-menu-item-group v-if="modAuthority.shift">
                <el-menu-item index="/main/shift">编制排班</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.schedul">
                <el-menu-item index="/main/schedul">排班管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.nosalary">
                <el-menu-item index="/main/nosalary">无感考勤报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.salary">
                <el-menu-item index="/main/salary">设备考勤报表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="8" class="submenu-item" v-if="modAuthority.work || modAuthority.rule">
              <template slot="title"><i class="iconfont iconccgl-fahuodanguanli-5"></i>工单管理</template>
              <el-menu-item-group v-if="modAuthority.work">
                <el-menu-item index="/main/work">工单列表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.rule">
                <el-menu-item index="/main/rule">异常处理规则设置</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="9" class="submenu-item" v-if="modAuthority.envmonit || modAuthority.monitman || modAuthority.envalarm">
              <template slot="title"><i class="iconfont iconjianzhuanquan"></i>环境监控管理</template>
              <el-menu-item-group v-if="modAuthority.envmonit">
                <el-menu-item index="/main/envmonit">环境监控设置</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.monitman">
                <el-menu-item index="/main/monitman">环境监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.envalarm">
                <el-menu-item index="/main/envalarm">告警记录</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="10" class="submenu-item" v-if="modAuthority.hardfac">
              <template slot="title"><i class="iconfont iconshebeiguanli1"></i>设备管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/hardfac">硬件设备管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="11" class="submenu-item" v-if="modAuthority.comnorm || modAuthority.pronorm">
              <template slot="title"><i class="iconfont iconic_biaozhunkuguanli"></i>标准库管理</template>
              <el-menu-item-group v-if="planormUid.indexOf(userId) !== -1">
                <el-menu-item index="/main/planorm">平台标准维护</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.comnorm">
                <el-menu-item index="/main/comnorm">企业标准维护</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.pronorm">
                <el-menu-item index="/main/pronorm">项目标准维护</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="12" class="submenu-item" v-if="modAuthority.vehicleAdmin || modAuthority.vehicleMonit || modAuthority.bangleAdmin || modAuthority.bangleMonit || modAuthority.gpsAlarmlog">
              <template slot="title"><i class="iconfont icondingwei"></i>定位服务</template>
              <el-menu-item-group v-if="modAuthority.vehicleAdmin">
                <el-menu-item index="/main/vehicle-admin">车辆管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.vehicleMonit">
                <el-menu-item index="/main/vehicle-monit">车辆监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.bangleAdmin">
                <el-menu-item index="/main/bangle-admin">手环管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.bangleMonit">
                <el-menu-item index="/main/bangle-monit">手环监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.gpsAlarmlog">
                <el-menu-item index="/main/gps-alarmlog">告警记录</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="13" class="submenu-item" v-if="modAuthority.waterAdmin || modAuthority.waterMonit">
              <template slot="title"><i class="iconfont iconshuibiao"></i>水表数据管理</template>
              <el-menu-item-group v-if="modAuthority.waterAdmin">
                <el-menu-item index="/main/water-admin">抄表设备管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.waterMonit">
                <el-menu-item index="/main/water-monit">水表监控</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="14" class="submenu-item" v-if="modAuthority.reportTask || modAuthority.reportSite || modAuthority.reportStaff || modAuthority.reportWorkpro || modAuthority.reportWorksta">
              <template slot="title"><i class="iconfont iconbaobiaoguanli"></i>报表管理</template>
              <el-menu-item-group v-if="modAuthority.reportTask">
                <el-menu-item index="/main/report-task">巡检任务执行报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.reportSite">
                <el-menu-item index="/main/report-site">巡检地址信息报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.reportStaff">
                <el-menu-item index="/main/report-staff">个人巡检执行报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.reportWorkpro">
                <el-menu-item index="/main/report-workpro">项目工单报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.reportWorksta">
                <el-menu-item index="/main/report-worksta">员工工单报表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="15" class="submenu-item" v-if="modAuthority.event">
              <template slot="title"><i class="iconfont iconshijian"></i>事件管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/event">事件列表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="16" class="submenu-item" v-if="modAuthority.videoSetting || modAuthority.videoPlaza">
              <template slot="title"><i class="iconfont iconjiankong"></i>视频监控</template>
              <el-menu-item-group v-if="modAuthority.videoSetting">
                <el-menu-item index="/main/video-setting">视频监控设置</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="modAuthority.videoPlaza">
                <el-menu-item index="/main/video-plaza">视频广场</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="17" class="submenu-item" v-if="deviceUid.indexOf(userId) !== -1">
              <template slot="title"><i class="iconfont iconduijie"></i>硬件对接</template>
              <el-menu-item-group>
                <el-menu-item index="/main/hardcon">硬件管控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/cardcon">蓝牙数据查询</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/loracon">lora数据查询</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/mespush">推送设置</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="18" class="submenu-item" v-if="companyId === 1">
              <template slot="title"><i class="iconfont iconjiankong1"></i>数据监控</template>
              <el-menu-item-group>
                <el-menu-item index="/main/abnfacmon">异常设备监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/dataswgmon">数据网关心跳监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/loraswgmon">lora网关心跳监控</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/maintainlog">设备维修记录</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/maintainall">设备维修汇总</el-menu-item>
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
    <intro-module
      :parentDialog="introDialog"
      @parentClose="introClose">
    </intro-module>
    <!-- 修改密码 -->
    <pwd-module
      :parentDialog="pwdDialog"
      @parentClose="pwdClose">
    </pwd-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import initIcon from '../assets/images/head.png'
// 引入个人资料组件
import introModule from '@/components/profile/main-intro'
// 引入修改密码组件
import pwdModule from '@/components/profile/main-pwd'
export default{
  name: 'index',
  data () {
    return {
      menuActive: '',
      iconUrl: '',
      introDialog: false,
      pwdDialog: false,
      nowProjectId: 0
    }
  },
  created () {
    this.nowProjectId = this.projectId
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
  components: {
    introModule,
    pwdModule
  },
  computed: {
    ...mapState('user', [
      'companyName',
      'companyId',
      'roleId',
      'userId',
      'userName',
      'userPhoto',
      'modAdminUid',
      'planormUid',
      'deviceUid',
      'modAuthority'
    ]),
    ...mapState('other', [
      'allProject',
      'projectId',
      'proDisabled',
      'unreadMesCount'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setNowProject',
      'setUnreadMes'
    ]),
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
        // 保存用户当前项目
        const nowProject = this.allProject.find(item => {
          return item.project_id === value
        })
        let project = {
          id: nowProject.project_id,
          name: nowProject.project_name,
          orgId: nowProject.organize_id,
          companyId: nowProject.company_id
        }
        this.setNowProject(project)
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 个人资料 */
    introClose () {
      this.introDialog = false
    },
    /* 修改密码 */
    pwdClose () {
      this.pwdDialog = false
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
          this.setUnreadMes(allCount)
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
    projectId (newVal, oldVal) {
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
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
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
      overflow-y: auto;
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
            content: "\e791";
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
        padding-bottom: 0;
        background: #f0f3f4;
      }
    }
  }
</style>
