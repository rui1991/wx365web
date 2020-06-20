<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>企业配置</el-breadcrumb-item>
        <el-breadcrumb-item>组织管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <div class="aside-header">
          <p class="title">组织机构</p>
          <div class="operate">
            <a href="javascript:;" class="blue" @click="modType = 2" v-show="addShow">新建组织</a>
          </div>
        </div>
        <tree-module
          :parentTreeState="treeState"
          @parentUpOrg="updateTree">
        </tree-module>
      </div>
      <div class="module-main">
        <!-- 编辑企业 -->
        <comqy-module
          v-if="modType === 1"
          :parentOrgId = "organId"
          :parentOrgType = "organType"
          :parentBaseId = "baseId"
          @parentUpdata="treeRefresh">
        </comqy-module>
        <!-- 新增类型 -->
        <type-module
          v-else-if="modType === 2"
          :parentOrgType= "organType"
          @parentUpType="setAddType">
        </type-module>
        <!-- 新增组织 -->
        <add-module
          v-else-if="modType === 3"
          :parentOrgId = "organId"
          :parentOrgName = "organName"
          :parentAddType = "addType"
          @parentUpdata="addUpdata"
          @parentCancel="addCancel">
        </add-module>
        <!-- 编辑组织 -->
        <com-module
          v-else-if="modType === 4"
          :parentOrgId = "organId"
          :parentOrgType = "organType"
          :parentBaseId = "baseId"
          @parentUpdata="treeRefresh">
        </com-module>
      </div>
    </div>
  </div>
</template>

<script>
/*
* 说明：
*  客户组织管理模块
*  modType参数说明：
*   1: 编辑企业
*   2：新增类型
*   3：新增组织（分公司、项目、部门）
*   4：编辑组织（分公司、项目、部门）
*  1: 新增类型
*  2：新增企业
*  3：设置（企业、分公司、模块配置）
*     3-1：设置企业
*     3-2：设置分公司
*     3-3：模块配置
*  4：新增组织（分公司、项目、部门）
*  5：编辑组织（项目、部门）
*  6:编辑企业
*
* organize_type参数说明：
*   0：黑卡
*   1：企业
*   2：分公司
*   3：项目
*   4：部门
* */
// 引入组织树组件
import treeModule from '@/components/company/organ-tree'
// 引入编辑企业组件
import comqyModule from '@/components/company/organ-comqy'
// 引入新增类型组件
import typeModule from '@/components/company/organ-type'
// 引入新增组织组件
import addModule from '@/components/company/organ-add'
// 引入编辑组织组件
import comModule from '@/components/company/organ-com'
export default{
  name: 'organKH',
  data () {
    return {
      treeState: false,
      organId: 0,
      organName: '',
      organType: -1,
      baseId: 0,
      modType: 0,
      addType: 0,
      addShow: false
    }
  },
  created () {

  },
  mounted () {

  },
  components: {
    treeModule,
    comqyModule,
    typeModule,
    addModule,
    comModule
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
    /* 新增类型 */
    setAddType (type) {
      this.addType = type
      this.modType = 3
    },
    /* 新增组织 */
    addUpdata () {
      // 刷新树
      this.treeRefresh(true)
      // 设置显示模块
      const type = this.organType
      if (type === 1) {
        this.modType = 1
      } else {
        this.modType = 4
      }
    },
    addCancel () {
      // 设置显示模块
      const type = this.organType
      if (type === 1) {
        this.modType = 1
      } else {
        this.modType = 4
      }
    },
    // 刷新树
    treeRefresh () {
      this.treeState = !this.treeState
    }
  },
  watch: {
    organId (val, oldVal) {
      const type = this.organType
      if (type === 1) {
        this.modType = 1
      } else {
        this.modType = 4
      }
    },
    organType (val, oldVal) {
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
  .module-container{
    height: 100%;
    padding-top: 65px;
    padding-bottom: 20px;
    position: relative;
    .module-header{
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
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
      display: flex;
      background: #ffffff;
      .module-aside{
        width: 280px;
        height: 100%;
        padding-top: 45px;
        position: relative;
        border-radius: 6px;
        border: 1px solid #cccccc;
        overflow: auto;
        .aside-header{
          width: 100%;
          height: 40px;
          padding: 0 10px;
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f1f1f1;
        }
      }
      .module-main{
        height: 100%;
        padding: 20px;
        margin-left: 20px;
        flex-grow: 1;
        border-radius: 6px;
        border: 1px solid #cccccc;
        overflow: auto;
      }
    }
  }
</style>
