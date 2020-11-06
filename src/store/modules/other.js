/* 其它信息 */
const state = {
  allProject: [],
  projectId: 0,
  projectName: '',
  projectOrgId: 0,
  companyId: 0,
  proDisabled: false,
  unreadMesCount: 0,
  orgTree: [],
  orgData: [],
  posclockNav: 1,
  normOrgan: {
    type: 0,
    companyId: 0,
    projectId: 0
  },
  normTree: {
    id: 0,
    depth: 0,
    type: 0,
    path: ''
  },
  normData: {
    id: 0,
    parid: 0,
    type: 0,
    depth: 0,
    path: 0,
    typeid: ''
  }
}

const getters = {

}

const mutations = {
  // 设置所有项目
  SET_ALL_PROJECT (state, arr) {
    state.allProject = arr
  },
  // 设置当前项目
  SET_NOW_PROJECT (state, obj) {
    state.projectId = obj.id
    state.projectName = obj.name
    state.projectOrgId = obj.orgId
    state.companyId = obj.companyId
  },
  // 设置全局项目可选状态
  SET_PRO_DISABLED (state, boo) {
    state.proDisabled = boo
  },
  // 设置未读消息数
  SET_UNREAD_MES (state, num) {
    state.unreadMesCount = num || ''
  },
  // 设置机构树
  SET_ORGAN_TREE (state, arr) {
    state.orgTree = arr
  },
  // 设置机构树
  SET_ORGAN_DATA (state, arr) {
    state.orgData = arr
  },
  // 设置标准组织
  SET_NORM_ORGAN (state, obj) {
    // 组织类型
    state.normOrgan = {
      type: obj.type,
      companyId: obj.comid,
      projectId: obj.proid
    }
  },
  // 设置标准树
  SET_NORM_TREE (state, obj) {
    // id：id; depth: 第几层；type:标准类型; 1.设备标准类，2：巡检标准类；path：路径；
    state.normTree = {
      id: obj.id,
      depth: obj.depth,
      type: obj.type,
      path: obj.path
    }
  },
  // 设置标准数据
  SET_NORM_DATA (state, obj) {
    // id:sdt_id; parid: parent_id; type:标准类型; 1.设备标准类，2：巡检标准类；
    // depth: 第几层； path：路径； typeid：sdt_type
    state.normData = {
      id: obj.id,
      parid: obj.parid,
      type: obj.type,
      depth: obj.depth,
      path: obj.path,
      typeid: obj.typeid
    }
  }
}

const actions = {
  // 设置所有项目
  setAllProject ({ commit }, value) {
    commit('SET_ALL_PROJECT', value)
  },
  // 设置当前项目
  setNowProject ({ commit }, value) {
    commit('SET_NOW_PROJECT', value)
  },
  // 设置全局项目可选状态
  setProDisabled ({ commit }, value) {
    commit('SET_PRO_DISABLED', value)
  },
  // 设置未读消息数
  setUnreadMes ({ commit }, value) {
    commit('SET_UNREAD_MES', value)
  },
  // 设置机构树
  setOrganTree ({ commit }, value) {
    commit('SET_ORGAN_TREE', value)
  },
  // 设置机构树
  setOrganData ({ commit }, value) {
    commit('SET_ORGAN_DATA', value)
  },
  // 设置标准组织
  setNormOrgan ({ commit }, value) {
    commit('SET_NORM_ORGAN', value)
  },
  // 设置标准树
  setNormTree ({ commit }, value) {
    commit('SET_NORM_TREE', value)
  },
  // 设置标准数据
  setNormData ({ commit }, value) {
    commit('SET_NORM_DATA', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
