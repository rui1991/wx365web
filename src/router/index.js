import Vue from 'vue'
import Router from 'vue-router'

/* 登录 */
const Login = () => import(/* webpackChunkName: "group-login" */ '@/components/login')
// 密码登录
const Cipher = () => import(/* webpackChunkName: "group-login" */ '@/components/login/cipher')
// 验证码登录
const Authcode = () => import(/* webpackChunkName: "group-login" */ '@/components/login/authcode')

/* 展会环境监控管理 */
const Monitfull = () => import(/* webpackChunkName: "group-login" */ '@/components/monitfull')

/* 位置打卡记录汇总 */
const OldPosclockall = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/old-posclockall')

/* 找回密码 */
const Findpwd = () => import(/* webpackChunkName: "group-findpwd" */ '@/components/findpwd')

/* 主页面 */
const Main = () => import(/* webpackChunkName: "group-main" */ '@/components/main')

// 首页
const Home = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home')
// 首页概况
const HomeSurvey = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home-survey')
// 首页巡检巡查任务
const HomeTask = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home-task')
// 首页品质监控（人员/位置）
const HomeQuality = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home-quality')
// 首页点名管理
const HomeCallname = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home-callname')
// 首页固定岗管理
const HomeFixation = () => import(/* webpackChunkName: "group-home" */ '@/components/profile/home-fixation')
// 消息
const Message = () => import(/* webpackChunkName: "group-message" */ '@/components/profile/message')
// 日志管理
const Log = () => import(/* webpackChunkName: "group-log" */ '@/components/profile/log')

/* 企业配置 */
// 组织管理（黑卡）
const Oorgan = () => import(/* webpackChunkName: "group-organ" */ '@/components/company/oorgan')
// 组织管理（客户）
const Corgan = () => import(/* webpackChunkName: "group-organ" */ '@/components/company/corgan')
// 用户管理（黑卡）
const Ouser = () => import(/* webpackChunkName: "group-user" */ '@/components/company/ouser')
// 用户管理（客户）
const Cuser = () => import(/* webpackChunkName: "group-user" */ '@/components/company/cuser')
// 审批列表
const Approval = () => import(/* webpackChunkName: "group-approval" */ '@/components/company/approval')
// 考勤排班
const Shift = () => import(/* webpackChunkName: "group-Shift" */ '@/components/company/shift')
// 排班管理
const Schedul = () => import(/* webpackChunkName: "group-schedul" */ '@/components/company/schedul')

/* 基础配置 */
// 位置管理
const Position = () => import(/* webpackChunkName: "group-position" */ '@/components/basics/position')
// 地址管理
const Site = () => import(/* webpackChunkName: "group-site" */ '@/components/basics/site')

/* 品质过程管理 */
// 人员管理汇总
const Crewcollect = () => import(/* webpackChunkName: "group-loccollect" */ '@/components/quality/crewcollect')
// 人员管理汇总详情
const CrewcollectDet = () => import(/* webpackChunkName: "group-loccollect" */ '@/components/quality/crewcollect-det')
// 人员打卡率报表
const Crewclock = () => import(/* webpackChunkName: "group-crewclock" */ '@/components/quality/crewclock')
// 位置巡查覆盖率
const Poscover = () => import(/* webpackChunkName: "group-poscover" */ '@/components/quality/poscover')
// 位置打卡记录
const Posclock = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclock')
// 位置打卡记录汇总
const Posclockall = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclockall')
// 人员打卡记录详情
const Posclockdet = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclockdet')
// 轨迹记录总览
const Trackall = () => import(/* webpackChunkName: "group-trackall" */ '@/components/quality/trackall')
// 轨迹记录详情
const Trackdet = () => import(/* webpackChunkName: "group-trackdet" */ '@/components/quality/trackdet')

/* 巡检巡查 */
// 组管理
const Group = () => import(/* webpackChunkName: "group-group" */ '@/components/polling/group')
// 巡检计划管理
const Plan = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan')
const PlanAdd = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-add')
const PlanCom = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-com')
// 巡检任务
const Task = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task')
const TaskCom = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task-com')
// 巡检日历
const Calendar = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar')
// 巡检日历详情
const CalendarItem = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar-item')
// 标准维护管理
const Normoam = () => import(/* webpackChunkName: "group-norm" */ '@/components/polling/normoam')
// 巡检异常
const Abnormal = () => import(/* webpackChunkName: "group-abnormal" */ '@/components/polling/abnormal')
// 巡检异常
const Normexecute = () => import(/* webpackChunkName: "group-normexecute" */ '@/components/polling/normexecute')

/* 固定岗管理 */
// 固定岗打卡报表
const FixedpostRep = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/fixedpost/fixedpost-rep')
// 固定岗设置
const FixedpostSet = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/fixedpost/fixedpost-set')
// 固定岗打卡记录
const FixedpostLog = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/fixedpost/fixedpost-log')

/* 点名管理 */
// 点名设置
const CallnameSet = () => import(/* webpackChunkName: "group-callname" */ '@/components/callname/callname-set')
// 点名管理
const CallnameRep = () => import(/* webpackChunkName: "group-callname" */ '@/components/callname/callname-rep')

/* 考勤管理 */
// 无感考勤报表
const Nosalary = () => import(/* webpackChunkName: "group-salary" */ '@/components/attend/nosalary')
// 设备考勤报表
const Salary = () => import(/* webpackChunkName: "group-salary" */ '@/components/attend/salary')

/* 工单管理 */
// 工单列表管理
const Work = () => import(/* webpackChunkName: "group-work" */ '@/components/work/work')
// 异常处理规则设置
const Rule = () => import(/* webpackChunkName: "group-rule" */ '@/components/work/rule')

/* 环境监控管理 */
// 环境监控设置
const Envmonit = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envmonit')
// 环境监控传感器
const Envccd = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envccd')
// 环境监控传感器历史记录
const EnvccdLog = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envccd-log')
// 环境监控网关
const Envswg = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envswg')
// 告警记录
const Envalarm = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envalarm')
// 告警设置
const EnvalarmSet = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/envalarm-set')
// 环境监控管理
const Monitman = () => import(/* webpackChunkName: "group-envmonit" */ '@/components/envmon/monitman')

/* 设备管理 */
// 硬件设备管理
const Hardfac = () => import(/* webpackChunkName: "group-hardfac" */ '@/components/facility/hardfac')

/* 报表管理 */
// 巡检任务执行报表
const ReportTask = () => import(/* webpackChunkName: "group-report" */ '@/components/report/task')
// 巡检地址信息报表
const ReportSite = () => import(/* webpackChunkName: "group-report" */ '@/components/report/site')
// 个人巡检执行报表
const ReportStaff = () => import(/* webpackChunkName: "group-report" */ '@/components/report/staff')
// 项目工单报表
const ReportWorkpro = () => import(/* webpackChunkName: "group-report" */ '@/components/report/workpro')
// 员工工单报表
const ReportWorksta = () => import(/* webpackChunkName: "group-report" */ '@/components/report/worksta')

/* 视频监控 */
// 视频监控设置
const VideoSetting = () => import(/* webpackChunkName: "group-video" */ '@/components/video/setting')
// 视频广场
const VideoPlaza = () => import(/* webpackChunkName: "group-video" */ '@/components/video/plaza')
// 视频直播
const VideoLiveroom = () => import(/* webpackChunkName: "group-video" */ '@/components/video/liveroom')

/* 事件管理 */
// 事件列表
const Event = () => import(/* webpackChunkName: "group-event" */ '@/components/event/event')

/* 标准维护 */
// 平台标准维护
const Planorm = () => import(/* webpackChunkName: "group-norm" */ '@/components/norm/planorm')
// 企业标准维护
const Comnorm = () => import(/* webpackChunkName: "group-norm" */ '@/components/norm/comnorm')
// 项目标准维护
const Pronorm = () => import(/* webpackChunkName: "group-norm" */ '@/components/norm/pronorm')
// 标准检查项
const Normitem = () => import(/* webpackChunkName: "group-norm" */ '@/components/norm/normitem')

/* 硬件对接 */
// 硬件管控
const Hardcon = () => import(/* webpackChunkName: "group-external" */ '@/components/external/hardcon')
// 打卡数据查询
const Cardcon = () => import(/* webpackChunkName: "group-external" */ '@/components/external/cardcon')
// lora数据查询
const Loracon = () => import(/* webpackChunkName: "group-external" */ '@/components/external/loracon')

Vue.use(Router)

export default new Router({
  linkActiveClass: 'link-active',
  routes: [
    {
      path: '/',
      redirect: '/login/cipher'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      redirect: '/login/cipher',
      children: [
        {
          path: 'cipher',
          name: 'cipher',
          component: Cipher
        },
        {
          path: 'authcode',
          name: 'authcode',
          component: Authcode
        }
      ]
    },
    {
      path: '/findpwd',
      name: 'findpwd',
      component: Findpwd
    },
    {
      path: '/monitfull',
      name: 'monitfull',
      component: Monitfull
    },
    {
      path: '/old-posclockall',
      name: 'oldPosclockall',
      component: OldPosclockall
    },
    {
      path: '/main',
      name: 'main',
      component: Main,
      redirect: '/main/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: Home,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'home-survey',
          name: 'homeSurvey',
          component: HomeSurvey,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'home-task',
          name: 'homeTask',
          component: HomeTask,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'home-quality',
          name: 'homeQuality',
          component: HomeQuality,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'home-callname',
          name: 'homeCallname',
          component: HomeCallname,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'home-fixation',
          name: 'homeFixation',
          component: HomeFixation,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'message',
          name: 'message',
          component: Message,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'oorgan',
          name: 'oorgan',
          component: Oorgan,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'corgan',
          name: 'corgan',
          component: Corgan,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'log',
          name: 'log',
          component: Log,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'ouser',
          name: 'ouser',
          component: Ouser,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'cuser',
          name: 'cuser',
          component: Cuser,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'approval',
          name: 'approval',
          component: Approval,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'shift',
          name: 'shift',
          component: Shift,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'schedul',
          name: 'schedul',
          component: Schedul,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'position',
          name: 'position',
          component: Position,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'site',
          name: 'site',
          component: Site,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'crewcollect',
          name: 'crewcollect',
          component: Crewcollect,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'crewcollect-det',
          name: 'crewcollectDet',
          component: CrewcollectDet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'crewclock',
          name: 'crewclock',
          component: Crewclock,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'poscover',
          name: 'poscover',
          component: Poscover,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'posclock',
          name: 'posclock',
          component: Posclock,
          // redirect: '/main/posclock/posclockall',
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'posclockall',
              name: 'posclockall',
              component: Posclockall,
              meta: {
                keepAlive: true
              }
            },
            {
              path: 'posclockdet',
              name: 'posclockdet',
              component: Posclockdet,
              meta: {
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'trackall',
          name: 'trackall',
          component: Trackall,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'trackdet',
          name: 'trackdet',
          component: Trackdet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'group',
          name: 'group',
          component: Group,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan',
          name: 'plan',
          component: Plan,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan-add',
          name: 'planAdd',
          component: PlanAdd,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan-com',
          name: 'planCom',
          component: PlanCom,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'task',
          name: 'task',
          component: Task,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'task-com',
          name: 'taskCom',
          component: TaskCom,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: Calendar,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'calendar-item',
          name: 'calendarItem',
          component: CalendarItem,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'normoam',
          name: 'normoam',
          component: Normoam,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'abnormal',
          name: 'abnormal',
          component: Abnormal,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'normexecute',
          name: 'normexecute',
          component: Normexecute,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'fixedpost-rep',
          name: 'fixedpostRep',
          component: FixedpostRep,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'fixedpost-set',
          name: 'fixedpostSet',
          component: FixedpostSet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'fixedpost-log',
          name: 'fixedpostLog',
          component: FixedpostLog,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'callname-set',
          name: 'callnameSet',
          component: CallnameSet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'callname-rep',
          name: 'callnameRep',
          component: CallnameRep,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'nosalary',
          name: 'nosalary',
          component: Nosalary,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'salary',
          name: 'salary',
          component: Salary,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'work',
          name: 'work',
          component: Work,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'rule',
          name: 'rule',
          component: Rule,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'envmonit',
          name: 'envmonit',
          component: Envmonit,
          redirect: '/main/envmonit/envccd',
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'envccd',
              name: 'envccd',
              component: Envccd,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'envswg',
              name: 'envswg',
              component: Envswg,
              meta: {
                keepAlive: false
              }
            }
          ]
        },
        {
          path: 'monitman',
          name: 'monitman',
          component: Monitman,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'envccd-log',
          name: 'envccdLog',
          component: EnvccdLog,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'envalarm',
          name: 'envalarm',
          component: Envalarm,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'envalarm-set',
          name: 'envalarmSet',
          component: EnvalarmSet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'hardfac',
          name: 'hardfac',
          component: Hardfac,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-task',
          name: 'reportTask',
          component: ReportTask,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-site',
          name: 'reportSite',
          component: ReportSite,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-staff',
          name: 'reportStaff',
          component: ReportStaff,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-workpro',
          name: 'reportWorkpro',
          component: ReportWorkpro,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-worksta',
          name: 'reportWorksta',
          component: ReportWorksta,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'video-setting',
          name: 'videoSetting',
          component: VideoSetting,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'video-plaza',
          name: 'videoPlaza',
          component: VideoPlaza,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'video-liveroom',
          name: 'videoLiveroom',
          component: VideoLiveroom,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'event',
          name: 'event',
          component: Event,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'planorm',
          name: 'planorm',
          component: Planorm,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'comnorm',
          name: 'comnorm',
          component: Comnorm,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'pronorm',
          name: 'pronorm',
          component: Pronorm,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'normitem',
          name: 'normitem',
          component: Normitem,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'hardcon',
          name: 'hardcon',
          component: Hardcon,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'cardcon',
          name: 'cardcon',
          component: Cardcon,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'loracon',
          name: 'loracon',
          component: Loracon,
          meta: {
            keepAlive: false
          }
        }
      ]
    }
  ]
})
