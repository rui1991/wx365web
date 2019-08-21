import Vue from 'vue'
import Router from 'vue-router'

/* 登录 */
const Login = () => import(/* webpackChunkName: "group-login" */ '@/components/login')
// 密码登录
const Cipher = () => import(/* webpackChunkName: "group-login" */ '@/components/login/cipher')
// 验证码登录
const Authcode = () => import(/* webpackChunkName: "group-login" */ '@/components/login/authcode')

/* 找回密码 */
const Findpwd = () => import(/* webpackChunkName: "group-findpwd" */ '@/components/findpwd')

/* 主页面 */
const Main = () => import(/* webpackChunkName: "group-main" */ '@/components/main')

// 首页
const Home = () => import(/* webpackChunkName: "group-main" */ '@/components/profile/home')
// 消息
const Message = () => import(/* webpackChunkName: "group-message" */ '@/components/profile/message')
// 日志管理
const Log = () => import(/* webpackChunkName: "group-log" */ '@/components/profile/log')

/* 系统配置 */
// 组织机构（黑卡）
const Oorgan = () => import(/* webpackChunkName: "group-organ" */ '@/components/company/oorgan')
// 组织机构（客户）
const Corgan = () => import(/* webpackChunkName: "group-organ" */ '@/components/company/corgan')

/* 企业管理 */
// 用户管理（黑卡）
const Ouser = () => import(/* webpackChunkName: "group-user" */ '@/components/company/ouser')
// 用户管理（客户）
const Cuser = () => import(/* webpackChunkName: "group-user" */ '@/components/company/cuser')
// 考勤排班
const Shift = () => import(/* webpackChunkName: "group-Shift" */ '@/components/company/shift')
// 排班管理 arrange
const Schedul = () => import(/* webpackChunkName: "group-scheduling" */ '@/components/company/schedul')
// 审批列表
const Salary = () => import(/* webpackChunkName: "group-approval" */ '@/components/company/salary')
// 审批列表
const Approval = () => import(/* webpackChunkName: "group-approval" */ '@/components/company/approval')

/* 基础配置 */
// 位置管理
const Position = () => import(/* webpackChunkName: "group-position" */ '@/components/basics/position')
// 地址管理
const Site = () => import(/* webpackChunkName: "group-site" */ '@/components/basics/site')
// 地图管理
const Posmap = () => import(/* webpackChunkName: "group-posmap" */ '@/components/basics/posmap')

/* 巡检管理 */
// 组管理
const Group = () => import(/* webpackChunkName: "group-group" */ '@/components/polling/group')
// 巡检计划管理
const Plan = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan')
const PlanAdd = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-add')
const PlanCom = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-com')
// 巡检任务
const Task = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task')
const TaskCom = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task-com')
// 固定岗管理
const Fixedpost = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/polling/fixedpost')
// 固定岗设置
const FixedpostSet = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/polling/fixedpost-set')
// 人员当班记录
const FixedpostLog = () => import(/* webpackChunkName: "group-fixedpost" */ '@/components/polling/fixedpost-log')
// 巡检日历
const Calendar = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar')
// 巡检日历详情
const CalendarItem = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar-item')
// 巡检标准维护
const Norm = () => import(/* webpackChunkName: "group-norm" */ '@/components/polling/norm')
// 巡检异常
const Abnormal = () => import(/* webpackChunkName: "group-abnormal" */ '@/components/polling/abnormal')
// 巡检异常历史记录
const AbnormalHistory = () => import(/* webpackChunkName: "group-abnormal" */ '@/components/polling/abnormal-history')

/* 人员位置管理 */
// 人员管理汇总
const Loccollect = () => import(/* webpackChunkName: "group-loccollect" */ '@/components/perloc/loccollect')
// 点名管理
const Callname = () => import(/* webpackChunkName: "group-callname" */ '@/components/perloc/callname')
// 点名设置
const CallnameSet = () => import(/* webpackChunkName: "group-callname" */ '@/components/perloc/callname-set')
// 人员打卡报表
const Crewclock = () => import(/* webpackChunkName: "group-crewclock" */ '@/components/perloc/crewclock')
// 位置打卡记录
const Clocklog = () => import(/* webpackChunkName: "group-clocklog" */ '@/components/perloc/clocklog')
// 位置打卡记录汇总
const Clockall = () => import(/* webpackChunkName: "group-clocklog" */ '@/components/perloc/clockall')
// 人员打卡记录详情
const Clockmark = () => import(/* webpackChunkName: "group-clocklog" */ '@/components/perloc/clockmark')
// 轨迹记录总览
const Locman = () => import(/* webpackChunkName: "group-locman" */ '@/components/perloc/locman')
// 轨迹记录详情
const Loclog = () => import(/* webpackChunkName: "group-loclog" */ '@/components/perloc/loclog')
// 人员轨迹图
const Crewtrack = () => import(/* webpackChunkName: "group-crewtrack" */ '@/components/perloc/crewtrack')
// 人员管理汇总详情
const LoccollectDet = () => import(/* webpackChunkName: "group-loccollect" */ '@/components/perloc/loccollect-det')

/* 工单管理 */
// 工单列表管理
const WorkList = () => import(/* webpackChunkName: "group-work" */ '@/components/work/list')
// 我的工单
const WorkOneself = () => import(/* webpackChunkName: "group-work" */ '@/components/work/oneself')
// 待处理
const WorkPending = () => import(/* webpackChunkName: "group-work" */ '@/components/work/pending')
// 跟进中
const WorkFollow = () => import(/* webpackChunkName: "group-work" */ '@/components/work/follow')
// 催单列表
const WorkReminder = () => import(/* webpackChunkName: "group-work" */ '@/components/work/reminder')
// 未完成
const WorkUndone = () => import(/* webpackChunkName: "group-work" */ '@/components/work/undone')
// 超时工单
const WorkOvertime = () => import(/* webpackChunkName: "group-work" */ '@/components/work/overtime')
// 结案关闭
const WorkFinish = () => import(/* webpackChunkName: "group-work" */ '@/components/work/finish')
// 全部
const WorkAll = () => import(/* webpackChunkName: "group-work" */ '@/components/work/all')
// 异常处理规则设置
const Rule = () => import(/* webpackChunkName: "group-rule" */ '@/components/work/rule')

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
const EventList = () => import(/* webpackChunkName: "group-event" */ '@/components/event/list')

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
          path: 'salary',
          name: 'salary',
          component: Salary,
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
          path: 'posmap',
          name: 'posmap',
          component: Posmap,
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
          path: 'fixedpost',
          name: 'fixedpost',
          component: Fixedpost,
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
          path: 'norm',
          name: 'norm',
          component: Norm,
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
          path: 'abnormal-history',
          name: 'abnormalHistory',
          component: AbnormalHistory,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'loccollect',
          name: 'loccollect',
          component: Loccollect,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'loccollect-det',
          name: 'loccollectDet',
          component: LoccollectDet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'callname',
          name: 'callname',
          component: Callname,
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
          path: 'crewclock',
          name: 'crewclock',
          component: Crewclock,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'clocklog',
          name: 'clocklog',
          component: Clocklog,
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'clockall',
              name: 'clockall',
              component: Clockall,
              meta: {
                keepAlive: true
              }
            },
            {
              path: 'clockmark',
              name: 'clockmark',
              component: Clockmark,
              meta: {
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'locman',
          name: 'locman',
          component: Locman,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'loclog',
          name: 'loclog',
          component: Loclog,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'crewtrack',
          name: 'crewtrack',
          component: Crewtrack,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'work',
          name: 'work',
          component: WorkList,
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'oneself',
              name: 'workOneself',
              component: WorkOneself
            },
            {
              path: 'pending',
              name: 'workPending',
              component: WorkPending
            },
            {
              path: 'follow',
              name: 'workFollow',
              component: WorkFollow
            },
            {
              path: 'reminder',
              name: 'workReminder',
              component: WorkReminder
            },
            {
              path: 'undone',
              name: 'workUndone',
              component: WorkUndone
            },
            {
              path: 'overtime',
              name: 'workOvertime',
              component: WorkOvertime
            },
            {
              path: 'finish',
              name: 'workFinish',
              component: WorkFinish
            },
            {
              path: 'all',
              name: 'workAll',
              component: WorkAll
            }
          ]
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
          component: EventList,
          meta: {
            keepAlive: true
          }
        }
      ]
    }
  ]
})
