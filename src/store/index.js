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
    sectorId: '',
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
  unreadMesCount: '',
  reportArg: {
    orgId: '',
    proId: '',
    orgType: '',
    startDate: '',
    endDate: ''
  }
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
  }
}

const actions = {

}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})

export default store
