<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>企业配置</el-breadcrumb-item>
        <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="operate">
          <el-button type="primary" @click="addDialog = true">新增</el-button>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="role_id" width="80" label="ID"></el-table-column>
        <el-table-column prop="role_name" label="角色名称"></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time | formatDate('yyyy-mm-dd') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="创建人"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="operate blue" @click="comClick(scope.row.role_id)">编辑</a>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentId="itemId"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/company/role-add'
// 引入编辑组件
import comModule from '@/components/company/role-com'
export default{
  name: 'role',
  data () {
    return {
      tableData: [],
      addDialog: false,
      comDialog: false,
      itemId: ''
    }
  },
  created () {
    if (this.modAdminUid.indexOf(this.userId) === -1) {
      this.$router.go(-1)
      return
    }
    // 获取列表数据
    this.getListData()
  },
  mounted () {

  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId',
      'modAdminUid'
    ])
  },
  components: {
    addModule,
    comModule
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selRole',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1 || []
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
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
