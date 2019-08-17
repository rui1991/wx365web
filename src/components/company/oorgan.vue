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
              <a href="javascript:;" class="blue" @click="modType = 1" v-show="addShow">新建机构</a>
            </div>
          </div>
          <el-tree
            style="padding: 5px;"
            :data="orgData"
            ref="tree"
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
          <!-- 新增类型 -->
          <type-module
            v-show="modType === 1"
            :parentOrgType= "orgType"
            :parentModType = "modType"
            @parentUpType="setAddType">
          </type-module>
          <!-- 新增企业 -->
          <add-module1
            v-show="modType === 2"
            :parentOrgId = "orgId"
            :parentAddType = "addType"
            :parentModType = "modType"
            @parentUpdata="addUpdata1"
            @parentCancel="addCancel1">
          </add-module1>
          <!-- 设置企业 -->
          <set-module
            v-show="modType === 3"
            :parentOrgId = "orgId"
            :parentOrgType = "orgType"
            :parentBaseId = "baseId"
            :parentModType = "modType"
            @parentUpdata="parentRefresh">
          </set-module>
          <!-- 新增组织 -->
          <add-module2
            v-show="modType === 4"
            :parentOrgId = "orgId"
            :parentOrgName = "orgName"
            :parentAddType = "addType"
            :parentModType = "modType"
            @parentUpdata="addUpdata2"
            @parentCancel="addCancel2">
          </add-module2>
          <!-- 编辑组织 -->
          <com-module
            v-show="modType === 5"
            :parentOrgId = "orgId"
            :parentOrgType = "orgType"
            :parentBaseId = "baseId"
            :parentModType = "modType"
            @parentUpdata="parentRefresh">
          </com-module>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增类型组件
import typeModule from '@/components/company/organ-type'
// 引入新增企业组件
import addModule1 from '@/components/company/oorgan-add'
// 引入设置企业组件
import setModule from '@/components/company/oorgan-set'
// 引入新增组织组件
import addModule2 from '@/components/company/organ-add'
// 引入编辑组织组件
import comModule from '@/components/company/organ-com'
export default{
  data () {
    return {
      orgData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      orgId: 0,
      orgType: -1,
      orgName: '',
      baseId: 0,
      modType: 0,
      addType: 0,
      addShow: false
    }
  },
  created () {

  },
  mounted () {
    // 获取机构树
    this.getOrganTree()
  },
  components: {
    typeModule,
    addModule1,
    setModule,
    addModule2,
    comModule
  },
  computed: {
    ...mapState(
      {
        userId: state => state.info.userId
      }
    )
  },
  methods: {
    /*
    *  parentModType参数说明：
    *  1: 新增类型
    *  2：新增企业
    *  3：设置（企业、分公司、模块配置）
    *  4：新增组织（分公司、项目、部门）
    *  5：编辑组织（项目、部门）
    *  3-1：设置企业
    *  3-2：设置分公司
    *  3-3：模块配置
    * */
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
          this.orgData = orgData
          if (b) {
            this.$refs.tree.setCheckedKeys([this.orgId])
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
        this.$refs.tree.setCheckedKeys([data.id])
        // 机构类型
        this.orgType = data.organize_type
        // id
        this.orgId = data.id
        // name
        this.orgName = data.name
        // baseId
        this.baseId = data.base_id
      } else {
        if (this.orgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.tree.setCheckedKeys([data.id])
      // 机构类型
      this.orgType = data.organize_type
      // id
      this.orgId = data.id
      // name
      this.orgName = data.name
      // baseId
      this.baseId = data.base_id
    },
    /* 新增类型 */
    setAddType (type) {
      this.addType = type
      if (type === 1) {
        this.modType = 2
      } else {
        this.modType = 4
      }
    },
    /* 新增企业 */
    addUpdata1 () {
      // 刷新树
      this.getOrganTree(true)
      // 设置显示模块
      this.modType = 0
    },
    addCancel1 () {
      // 设置显示模块
      this.modType = 0
    },
    /* 新增组织 */
    addUpdata2 () {
      // 刷新树
      this.getOrganTree(true)
      // 设置显示模块
      const type = this.orgType
      if (type === 1 || type === 2) {
        this.modType = 3
      } else {
        this.modType = 5
      }
    },
    addCancel2 () {
      // 设置显示模块
      const type = this.orgType
      if (type === 1 || type === 2) {
        this.modType = 3
      } else {
        this.modType = 5
      }
    },
    // 刷新树
    parentRefresh () {
      this.getOrganTree(true)
    }
  },
  watch: {
    orgId (val, oldVal) {
      const type = this.orgType
      if (type === 0) {
        this.modType = 0
      } else if (type === 1 || type === 2) {
        this.modType = 3
      } else {
        this.modType = 5
      }
    },
    orgType (val, oldVal) {
      if (val === 4) {
        this.addShow = false
      } else {
        this.addShow = true
      }
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
