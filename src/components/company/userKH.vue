<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>企业配置</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <tree-module
          :parentTreeState="true"
          @parentUpOrg="updateTree">
        </tree-module>
      </div>
      <div class="module-main">
        <div class="main-search main-search-multi">
          <div class="search-row">
            <div class="item">
              <span>搜索用户</span>
              <el-input style="width: 200px;" placeholder="请输入姓名或MAC" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addDialog = true" v-if="authority.indexOf(14) !== -1">新增</el-button>
            </div>
          </div>
          <div class="search-row">
            <div class="item">
              <span>联系电话</span>
              <el-input style="width: 200px;" v-model.trim="nowSearch.phone"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="upDisabled" @click="upClick" v-if="authority.indexOf(14) !== -1">导入</el-button>
              <el-button type="primary" :disabled="downDisabled" @click="downFile" v-if="authority.indexOf(19) !== -1">导出</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_id" label="用户ID"></el-table-column>
          <el-table-column label="用户姓名">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row.user_id)">{{ scope.row.user_name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="user_phone" label="联系电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column prop="ogz_name" label="所属部门"></el-table-column>
          <el-table-column label="卡片mac地址" width="230">
            <template slot-scope="scope">
              <span>{{ scope.row.card_mac | formatMac }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="178">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="bindClick(scope.row.user_id, scope.row.project_id)" v-if="authority.indexOf(18) !== -1 && scope.row.project_id && !scope.row.card_mac">绑卡</a>
              <a href="javascript:void(0);" class="operate del" @click="untieClick(scope.row.user_id, scope.row.project_id, scope.row.card_mac)" v-if="authority.indexOf(18) !== -1 && scope.row.project_id && scope.row.card_mac">解绑</a>
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.user_id)" v-if="authority.indexOf(15) !== -1">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.user_id)" v-if="authority.indexOf(17) !== -1 && roleId !== 502">删除</a>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page="nowPage"
          layout="sizes, prev, pager, next, total"
          :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
          :page-size="limit"
          @size-change="handleSizeChange"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </div>
      <!-- 新增 -->
      <add-module
        :parentDialog="addDialog"
        :parentType="2"
        :parentRoles="roleOptions"
        :parentOrgId="organId"
        :parentComId="companyId"
        @parentUpdata="addUpdata"
        @parentCancel="addCancel">
      </add-module>
      <!-- 详情 -->
      <det-module
        :parentDialog="detDialog"
        :parentId="itemId"
        @parentClose="detClose">
      </det-module>
      <!-- 编辑 -->
      <com-module
        :parentDialog="comDialog"
        :parentType="2"
        :parentRoles="roleOptions"
        :parentOrgId="organId"
        :parentComId="companyId"
        :parentId="itemId"
        @parentUpdata="comUpdata"
        @parentCancel="comCancel">
      </com-module>
      <!-- 绑卡 -->
      <bind-module
        :parentDialog="bindDialog"
        :parentId="itemId"
        :parentComId="companyId"
        :parentPro="proId"
        @parentUpdata="bindUpdata"
        @parentCancel="bindCancel">
      </bind-module>
      <!-- 解绑 -->
      <untie-module
        :parentDialog="untieDialog"
        :parentId="itemId"
        :parentComId="companyId"
        :parentPro="proId"
        :parentMac="cardMac"
        @parentUpdata="untieUpdata"
        @parentCancel="untieCancel">
      </untie-module>
      <!-- 删除 -->
      <del-module
        :parentDialog="delDialog"
        :parentId="itemId"
        @parentUpdata="delUpdata"
        @parentCancel="delCancel">
      </del-module>
      <!-- 导入 -->
      <up-module
        :parentDialog="upDialog"
        :parentOrgId="organId"
        :parentOrgName="organName"
        :parentOrgType="organType"
        :parentOrgBase="baseId"
        @parentUpdata="upUpdata"
        @parentClose="upClose">
      </up-module>
    </div>
  </div>
</template>

<script>
/*
* 客户用户模块
* */
import { mapState } from 'vuex'
// 引入组织树组件
import treeModule from '@/components/company/organ-tree'
// 引入新增组件
import addModule from '@/components/company/user-add'
// 引入详情组件
import detModule from '@/components/company/user-det'
// 引入编辑组件
import comModule from '@/components/company/user-com'
// 引入绑卡组件
import bindModule from '@/components/company/user-bind'
// 引入解绑组件
import untieModule from '@/components/company/user-untie'
// 引入删除组件
import delModule from '@/components/company/user-del'
// 引入导入组件
import upModule from '@/components/company/user-up'
export default{
  name: 'userKH',
  data () {
    return {
      search: {
        name: '',
        phone: ''
      },
      nowSearch: {
        name: '',
        phone: ''
      },
      organType: '',
      organId: 0,
      organName: '',
      baseId: 0,
      roleOptions: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: 0,
      proId: 0,
      cardMac: '',
      addDialog: false,
      detDialog: false,
      comDialog: false,
      bindDialog: false,
      untieDialog: false,
      delDialog: false,
      upDialog: false,
      upDisabled: true,
      downDisabled: true
    }
  },
  created () {
    if (!this.modVisit) {
      this.$router.go(-1)
      return
    }
    // 获取角色
    this.getRoleOptions()
  },
  components: {
    treeModule,
    addModule,
    detModule,
    comModule,
    bindModule,
    untieModule,
    delModule,
    upModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId',
      'roleId'
    ]),
    ...mapState('user', {
      modVisit: state => state.modAuthority.user,
      authority: state => state.detAuthority.user
    })
  },
  methods: {
    /* 组织树 */
    updateTree (data) {
      // 机构类型
      this.organType = data.type
      // id
      this.organId = data.id
      // 名称
      this.organName = data.name
      // baseId
      this.baseId = data.baseId
    },
    // 初始化查询
    initSelect () {
      // 清空搜索框
      this.search = {
        name: '',
        phone: ''
      }
      this.nowSearch = {
        name: '',
        phone: ''
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      if (!this.organId) return
      let name = this.search.name
      name = name.replace(/:/g, '')
      let params = {
        organize_id: this.organId,
        user_name: name,
        user_phone: this.search.phone,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.users
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            this.getListData()
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
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 选择角色 */
    getRoleOptions () {
      let params = {
        company_id: this.companyId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.3/selComRole',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const roleData = res.data.data1
          this.roleOptions = roleData
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
    /* 新增 */
    addUpdata () {
      this.addDialog = false
      // 更新列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 编辑 */
    comClick (id) {
      this.itemId = id
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 更新列表
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 绑卡 */
    bindClick (id, proid) {
      this.itemId = id
      this.proId = proid
      this.bindDialog = true
    },
    bindUpdata () {
      this.bindDialog = false
      // 更新列表
      this.getListData()
    },
    bindCancel () {
      this.bindDialog = false
    },
    /* 解绑 */
    untieClick (id, proid, mac) {
      this.itemId = id
      this.proId = proid
      this.cardMac = mac
      this.untieDialog = true
    },
    untieUpdata () {
      this.untieDialog = false
      // 更新列表
      this.getListData()
    },
    untieCancel () {
      this.untieDialog = false
    },
    /* 删除 */
    delClick (id) {
      this.itemId = id
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      // 更新列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    },
    /* 导入 */
    upClick () {
      this.upDialog = true
    },
    upUpdata () {
      this.upDialog = false
      // 更新列表
      this.getListData()
    },
    upClose () {
      this.upDialog = false
    },
    /* 导出 */
    downFile () {
      let params = {
        user_id: this.userId,
        organize_id: this.organId,
        user_name: this.search.name,
        user_phone: this.search.phone
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.2/userEO?' + params
    }
  },
  watch: {
    organId (val, oldVal) {
      this.initSelect()
      if (val) {
        this.upDisabled = false
        this.downDisabled = false
      } else {
        this.upDisabled = true
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-row.css';
</style>
