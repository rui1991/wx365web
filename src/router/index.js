import Vue from 'vue'
import Router from 'vue-router'

/* 登录 */
import Login from '@/components/login'
// 密码登录
import Cipher from '@/components/login/cipher'
// 验证码登录
import Authcode from '@/components/login/authcode'

/* 找回密码 */
import Findpwd from '@/components/findpwd'

/* 主页面 */
import Main from '@/components/main'

// 首页
import Home from '@/components/profile/home'
// 消息
import Message from '@/components/profile/message'
// 日志管理
import Log from '@/components/profile/log'

/* 系统配置 */
// 组织机构（黑卡）
import Oorgan from '@/components/company/oorgan'
// 组织机构（客户）
import Corgan from '@/components/company/corgan'
// 空模块
import Empty from '@/components/company/org/empty'
// 新增企业
import Addclient from '@/components/company/org/addclient'
// 企业配置
import Conffirm from '@/components/company/org/conffirm'
// 编辑企业（黑卡）
import Comclient from '@/components/company/org/comclient'
// 模块配置
import Confmod from '@/components/company/org/confmod'
// 角色管理
import Role from '@/components/company/org/role'
// 编辑企业（客户）
import Comfirm from '@/components/company/org/comfirm'
// 新增类型
import Addtype from '@/components/company/org/addtype'
// 新增机构
import Addorg from '@/components/company/org/addorg'
// 编辑机构
import Comorg from '@/components/company/org/comorg'

/* 企业管理 */
// 用户管理（黑卡）
import Ouser from '@/components/company/ouser'
// 用户管理（客户）
import Cuser from '@/components/company/cuser'
// 考勤排班
import Shift from '@/components/company/shift'
// 排班管理
import Scheduling from '@/components/company/scheduling'
// 审批列表
import Approval from '@/components/company/approval'

/* 基础配置 */
// 位置管理
import Position from '@/components/basics/position'
// 地址管理
import Site from '@/components/polling/site'
// 地图管理
import Posmap from '@/components/basics/posmap'

/* 巡检管理 */
// 组管理
import Group from '@/components/polling/group'
// 巡检计划管理
import Plan from '@/components/polling/plan'
import PlanAdd from '@/components/polling/plan-add'
import PlanCom from '@/components/polling/plan-com'
// 巡检任务
import Task from '@/components/polling/task'
import TaskCom from '@/components/polling/task-com'
// 固定岗管理
import Fixedpost from '@/components/polling/fixedpost'
// 固定岗设置
import FixedpostSet from '@/components/polling/fixedpost-set'
// 人员当班记录
import FixedpostLog from '@/components/polling/fixedpost-log'
// 巡检日历
import Calendar from '@/components/polling/calendar'
// 巡检日历详情
import CalendarItem from '@/components/polling/calendar-item'
// 巡检标准维护
import Norm from '@/components/polling/norm'
// 巡检异常
import Abnormal from '@/components/polling/abnormal'
// 巡检异常历史记录
import AbnormalHistory from '@/components/polling/abnormal-history'

/* 人员位置管理 */
// 人员定位管理
import Locman from '@/components/perloc/locman'
// 人员位置记录
import Loclog from '@/components/perloc/loclog'
// 人员轨迹图
import Crewtrack from '@/components/perloc/crewtrack'
// 点名管理
import Callname from '@/components/perloc/callname'
// 点名设置
import CallnameSet from '@/components/perloc/callname-set'
// 人员打点报表
import Crewclock from '@/components/perloc/crewclock'
// 位置打卡记录
import Clocklog from '@/components/perloc/clocklog'
// 汇总
import Clockall from '@/components/perloc/clockall'
// 详情
import Clockmark from '@/components/perloc/clockmark'
// 人员管理汇总统计
import Loccollect from '@/components/perloc/loccollect'
// 人员管理汇总统计
import LoccollectDet from '@/components/perloc/loccollect-det'

/* 工单管理 */
// 工单列表管理
import WorkList from '@/components/work/list'
// 我的工单
import WorkOneself from '@/components/work/oneself'
// 待处理
import WorkPending from '@/components/work/pending'
// 跟进中
import WorkFollow from '@/components/work/follow'
// 催单列表
import WorkReminder from '@/components/work/reminder'
// 未完成
import WorkUndone from '@/components/work/undone'
// 超时工单
import WorkOvertime from '@/components/work/overtime'
// 结案关闭
import WorkFinish from '@/components/work/finish'
// 全部
import WorkAll from '@/components/work/all'
// 异常处理规则设置
import Rule from '@/components/work/rule'

/* 设备管理 */
// 硬件设备管理
import Hardfac from '@/components/facility/hardfac'
// 设备管理导入详情
import FacupRecord from '@/components/facility/facup-record'
// 巡检绑卡管理
import Polcard from '@/components/facility/polcard'

/* 报表管理 */
// 巡检任务执行报表
import ReportTask from '@/components/report/task'
// 巡检地址信息报表
import ReportSite from '@/components/report/site'
// 个人巡检执行报表
import ReportStaff from '@/components/report/staff'
// 项目工单报表
import ReportWorkpro from '@/components/report/workpro'
// 员工工单报表
import ReportWorksta from '@/components/report/worksta'

/* 视频监控 */
// 视频监控设置
import VideoSetting from '@/components/video/setting'
// 视频广场
import VideoPlaza from '@/components/video/plaza'
// 视频直播
import VideoLiveroom from '@/components/video/liveroom'

/* 事件管理 */
// 事件列表
import EventList from '@/components/event/list'

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
          },
          children: [
            {
              path: 'empty',
              name: 'oempty',
              component: Empty,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'addclient',
              name: 'addclient',
              component: Addclient,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'conffirm',
              name: 'conffirm',
              component: Conffirm,
              meta: {
                keepAlive: false
              },
              children: [
                {
                  path: 'comclient',
                  name: 'comclient',
                  component: Comclient,
                  meta: {
                    keepAlive: false
                  }
                },
                {
                  path: 'comorg',
                  name: 'comfiliale',
                  component: Comorg,
                  meta: {
                    keepAlive: false
                  }
                },
                {
                  path: 'confmod',
                  name: 'confmod',
                  component: Confmod,
                  meta: {
                    keepAlive: false
                  }
                },
                {
                  path: 'role',
                  name: 'role',
                  component: Role,
                  meta: {
                    keepAlive: false
                  }
                }
              ]
            },
            {
              path: 'addtype',
              name: 'oaddtype',
              component: Addtype,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'addorg',
              name: 'oaddorg',
              component: Addorg,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'comorg',
              name: 'ocomorg',
              component: Comorg,
              meta: {
                keepAlive: false
              }
            }
          ]
        },
        {
          path: 'corgan',
          name: 'corgan',
          component: Corgan,
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'empty',
              name: 'cempty',
              component: Empty,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'comfirm',
              name: 'comfirm',
              component: Comfirm,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'addtype',
              name: 'caddtype',
              component: Addtype,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'addorg',
              name: 'caddorg',
              component: Addorg,
              meta: {
                keepAlive: false
              }
            },
            {
              path: 'comorg',
              name: 'ccomorg',
              component: Comorg,
              meta: {
                keepAlive: false
              }
            }
          ]
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
          path: 'scheduling',
          name: 'scheduling',
          component: Scheduling,
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
          path: 'facup-record',
          name: 'facupRecord',
          component: FacupRecord,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'polcard',
          name: 'polcard',
          component: Polcard,
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
