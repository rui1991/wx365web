import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  info: {
    companyId: '',
    companyName: '',
    userId: '',
    userName: '',
    roleId: '',
    userPhone: '',
    userPhoto: '',
    allPros: [],
    allProid: ''
  },
  authority: {
    organ: false,
    log: false,
    user: false,
    shift: false,
    scheduling: false,
    approval: false,
    site: false,
    plan: false,
    task: false,
    calendar: false,
    norm: false,
    abnormal: false,
    work: false,
    rule: false,
    polcard: false,
    polReport: false,
    workReport: false,
    videoSetting: false,
    videoPlaza: false,
    event: false
  },
  autDet: {
    organ: [],
    user: [],
    crew: [],
    shift: [],
    scheduling: [],
    approval: [],
    site: [],
    plan: [],
    task: [],
    calendar: [],
    norm: [],
    abnormal: [],
    work: [],
    rule: [],
    polcard: [],
    event: []
  },
  nowProid: '',
  nowProname: '',
  nowOrgid: '',
  nowClientId: '',
  proDisabled: false,
  org: {
    orgId: '',
    orgName: '',
    orgType: '',
    baseId: ''
  },
  orgConfName: 'comclient',
  workNavActive: '5',
  unreadMesCount: '',
  reportArg: {
    orgId: '',
    proId: '',
    orgType: '',
    startDate: '',
    endDate: ''
  },
  clockNavActive: 1
}

const getters = {

}

const mutations = {
  // 保存用户基本信息
  setLoginInfo (state, infos) {
    state.info = infos
  },
  // 保存当前项目
  setNowProject (state, project) {
    state.nowProid = project.nowProid
    state.nowProname = project.nowProname
    state.nowOrgid = project.nowOrgid
    state.nowClientId = project.nowClientId
  },
  // 保存项目是否禁用
  setProDisabled (state, value) {
    state.proDisabled = value
  },
  // 保存模块权限
  setModAuthority (state, auts) {
    state.authority = auts
  },
  // 保存权限详情
  setDetAuthority (state, auts) {
    state.autDet = auts
  },
  // 存储当前项目
  nowProChange (state, id) {
    const allPros = state.info.allPros
    const proItem = allPros.find((item) => {
      return item.project_id === id
    })
    state.nowProid = id
    state.nowProname = proItem.project_name
    state.nowOrgid = proItem.organize_id
    state.nowClientId = proItem.company_id
  },
  // 保存未读消息总数
  setUnreadMesCount (state, count) {
    state.unreadMesCount = count || ''
  },
  // 保存机构参数
  setOrgArgs (state, count) {
    state.org.orgId = count.orgId
    state.org.orgName = count.orgName
    state.org.orgType = count.orgType
    state.org.baseId = count.baseId
  },
  // 保存企业配置导航
  setOrgConfName (state, name) {
    state.orgConfName = name
  },
  // 保存工单导航
  setWorkNav (state, name) {
    state.workNavActive = name
  },
  // 保存报表组织
  setReportOrg (state, data) {
    state.reportArg.orgId = data.id
    state.reportArg.proId = data.proId
    state.reportArg.orgType = data.type
  },
  // 保存报表时间
  setReportDate (state, data) {
    state.reportArg.startDate = data.startDate
    state.reportArg.endDate = data.endDate
  },
  // 位置打卡记录
  setClockNav (state, name) {
    state.clockNavActive = name
  }
}

const actions = {
  // 初始化组织机构参数
  initOrgArgs (context, str) {
    context.commit('setOrgArgs', {
      org: {
        orgId: '',
        orgName: '',
        orgType: '',
        baseId: ''
      }
    })
  }
}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})

export default store
