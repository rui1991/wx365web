<template>
  <div class="organ">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业管理</el-breadcrumb-item>
          <el-breadcrumb-item>组织机构</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <div class="tree-top">
            <p class="title">组织机构</p>
            <div class="operate">
              <router-link to="/main/oorgan/addtype" class="blue" v-show="addShow">新建机构</router-link>
            </div>
          </div>
          <el-tree
            style="padding: 5px;"
            :data="orgTree"
            ref="orgTree"
            show-checkbox
            check-strictly
            node-key="id"
            :default-expanded-keys="[1]"
            @check-change="orgCheckChange"
            @node-click="orgNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <router-view @parentRefresh="refreshTree"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  data () {
    return {
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      addShow: false
    }
  },
  created () {
    // 初始化参数
    this.$store.dispatch('initOrgArgs')
    // 路由跳转到空白页面
    this.$router.push({ path: '/main/oorgan/empty' })
  },
  mounted () {
    // 获取机构树
    this.getOrganTree()
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        userId: state => state.info.userId,
        orgId: state => state.org.orgId
      }
    )
  },
  methods: {
    // 获取机构树
    getOrganTree (b = false) {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let orgData = res.data.data1
          this.orgTree = orgData
          if (b) {
            this.$refs.orgTree.setCheckedKeys([this.orgId])
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
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) {
          return
        }
        this.$refs.orgTree.setCheckedKeys([data.id])
        // 机构类型
        const type = data.organize_type
        // 机构参数
        const org = {
          orgId: data.id,
          orgName: data.name,
          orgType: type,
          baseId: data.base_id
        }
        this.$store.commit('setOrgArgs', org)
        if (type === 0) {
          this.addShow = true
          this.$router.push({ path: '/main/oorgan/empty' })
        } else if (type === 1) {
          this.addShow = true
          this.$store.commit('setOrgConfName', 'comclient')
          this.$router.push({ path: '/main/oorgan/conffirm/comclient' })
        } else if (type === 2) {
          this.addShow = true
          this.$store.commit('setOrgConfName', 'comclient')
          this.$router.push({ path: '/main/oorgan/conffirm/comorg' })
        } else if (type === 4) {
          this.addShow = false
          this.$router.push({ path: '/main/oorgan/comorg' })
        } else {
          this.addShow = true
          this.$router.push({ path: '/main/oorgan/comorg' })
        }
      } else {
        if (this.orgId === data.id) {
          this.$refs.orgTree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.orgTree.setCheckedKeys([data.id])
      // 机构类型
      const type = data.organize_type
      // 机构参数
      const org = {
        orgId: data.id,
        orgName: data.name,
        orgType: type,
        baseId: data.base_id
      }
      this.$store.commit('setOrgArgs', org)
      if (type === 0) {
        this.addShow = true
        this.$router.push({ path: '/main/oorgan/empty' })
      } else if (type === 1) {
        this.addShow = true
        this.$store.commit('setOrgConfName', 'comclient')
        this.$router.push({ path: '/main/oorgan/conffirm/comclient' })
      } else if (type === 2) {
        this.addShow = true
        this.$store.commit('setOrgConfName', 'comclient')
        this.$router.push({ path: '/main/oorgan/conffirm/comorg' })
      } else if (type === 4) {
        this.addShow = false
        this.$router.push({ path: '/main/oorgan/comorg' })
      } else {
        this.addShow = true
        this.$router.push({ path: '/main/oorgan/comorg' })
      }
    },
    // 刷新树
    refreshTree () {
      this.getOrganTree(true)
    }
  }
}
</script>

<style lang="less" scoped>
  .organ{
    height: 100%;
    .module-container{
      height: 100%;
      padding: 0;
      .module-header{
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 20px;
        .el-breadcrumb{
          padding-top: 15px;
          padding-left: 20px;
          padding-bottom: 15px;
          background: #ffffff;
        }
      }
      .module-content{
        height: 100%;
        padding: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          border-radius: 6px;
          border: 1px solid #cccccc;
          .tree-top{
            display: table;
            width: 100%;
            height: 40px;
            padding: 0 10px;
            background: #f1f1f1;
            .title{
              display: table-cell;
              vertical-align:middle;
              font-size: 14px;
            }
            .operate{
              display: table-cell;
              vertical-align:middle;
              text-align: right;
              a{
                margin-left: 20px;
              }
            }
          }
        }
        .module-main{
          margin-left: 20px;
          border-radius: 6px;
          border: 1px solid #cccccc;
        }
      }
    }
  }
</style>
