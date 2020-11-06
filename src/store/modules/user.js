/* 用户信息 */
const state = {
  companyId: '',
  companyName: '',
  userId: '',
  userName: '',
  roleId: '',
  sectorId: '',
  userPhone: '',
  userPhoto: '',
  modAdminUid: [1, 2, 816, 830, 3442],
  planormUid: [1, 3442],
  deviceUid: [1, 2, 816, 830, 3442],
  modAuthority: {
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
  },
  detAuthority: {
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
}

const getters = {

}

const mutations = {
  // 保存基本信息
  SET_USER_INFO (state, obj) {
    state.companyId = obj.companyId
    state.companyName = obj.companyName
    state.userId = obj.userId
    state.userName = obj.userName
    state.roleId = obj.roleId
    state.sectorId = obj.sectorId
    state.userPhone = obj.userPhone
    state.userPhoto = obj.userPhoto
  },
  // 保存模块权限
  SET_MOD_AUTHORITY (state, obj) {
    state.modAuthority = obj
  },
  // 保存权限详情
  SET_DET_AUTHORITY (state, obj) {
    state.detAuthority = obj
  }
}

const actions = {
  // 保存基本信息
  setUserInfo ({ commit }, value) {
    commit('SET_USER_INFO', value)
  },
  // 保存模块权限
  setModAuthority ({ commit }, value) {
    commit('SET_MOD_AUTHORITY', value)
  },
  // 保存权限详情
  setDetAuthority ({ commit }, value) {
    commit('SET_DET_AUTHORITY', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
