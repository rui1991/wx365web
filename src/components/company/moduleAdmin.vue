<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>企业配置</el-breadcrumb-item>
        <el-breadcrumb-item>模块管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <div class="aside-header">
          <p class="title">功能模块</p>
          <div class="operate">
            <a href="javascript:;" class="blue" @click="modType = 1">新增</a>
            <a href="javascript:;" class="red" v-show="moduleId !== 0" @click="delDialog = true">删除</a>
            <a href="javascript:;" class="blue refresh" @click="refreshClick"><i class="el-icon-refresh"></i></a>
          </div>
        </div>
        <div class="tree-mod">
          <el-input
            placeholder="输入关键字进行过滤"
            clearable
            v-model="filterText">
          </el-input>
          <el-tree
            :data="treeData"
            ref="tree"
            show-checkbox
            check-strictly
            check-on-click-node
            node-key="id"
            :filter-node-method="filterNode"
            @check-change="modCheckChange"
            :props="defaultProps">
          </el-tree>
        </div>
      </div>
      <div class="module-main">
        <!-- 新增模块 -->
        <add-module
          v-show="modType === 1"
          :parentModType = "modType"
          :parentFuId = "moduleId"
          :parentFuPath = "modulePath"
          @parentUpdata="addUpdata"
          @parentCancel="addCancel">
        </add-module>
        <!-- 编辑模块 -->
        <com-module
          v-show="modType === 2"
          :parentFuId = "moduleParentId"
          :parentId = "moduleId"
          :parentName = "moduleName"
          :parentFuPath = "moduleParentPath"
          @parentUpdata="comUpdata">
        </com-module>
        <!-- 删除模块 -->
        <del-module
          :parentDialog="delDialog"
          :parentId="moduleId"
          @parentUpdata="delUpdata"
          @parentCancel="delCancel">
        </del-module>
      </div>
    </div>
  </div>
</template>

<script>
/*
* 说明：
*  modType参数说明
*  0
*  1：新增
*  2：编辑
* */
import { mapState } from 'vuex'
// 引入新增模块组件
import addModule from '@/components/company/moduleAdmin-add'
// 引入新增模块组件
import comModule from '@/components/company/moduleAdmin-com'
// 引入删除模块组件
import delModule from '@/components/company/moduleAdmin-del'
export default{
  name: 'moduleAdmin',
  data () {
    return {
      treeData: [],
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      moduleId: 0,
      moduleName: '',
      modulePath: '',
      moduleParentId: 0,
      moduleParentPath: '',
      modType: 0,
      delDialog: false
    }
  },
  created () {
    if (this.modAdminUid.indexOf(this.userId) === -1) {
      this.$router.go(-1)
      return
    }
    // 获取模块树
    this.getModuleTree()
  },
  mounted () {

  },
  components: {
    addModule,
    comModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId',
      'modAdminUid'
    ])
  },
  methods: {
    // 获取模块树
    getModuleTree (b = false) {
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selFunTree'
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let treeData = res.data.data1 || []
          this.treeData = treeData
          if (b) {
            this.$refs.tree.setCheckedKeys([this.moduleId])
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
    // 触发页面显示配置的筛选
    filterNode (value, data, node) {
      // 如果什么都没填就直接返回
      if (!value) return true
      // 如果传入的value和data中的label相同说明是匹配到了
      if (data.name.indexOf(value) !== -1) return true
      // 否则要去判断它是不是选中节点的子节点
      return this.checkBelongNode(value, data, node)
    },
    // 判断传入的节点是不是选中节点的子节点
    checkBelongNode (value, data, node) {
      const level = node.level
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) return false
      // 先取当前节点的父节点
      let parentData = node.parent
      // 遍历当前节点的父节点
      let index = 0
      while (index < level - 1) {
        // 如果匹配到直接返回
        if (parentData.data.name.indexOf(value) !== -1) {
          return true
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent
        index++
      }
      // 没匹配到返回false
      return false
    },
    // 点击机构树
    modCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.organizeId = data.id
        this.$refs.tree.setCheckedKeys([data.id])
        // id
        this.moduleId = data.id
        // 名称
        this.moduleName = data.name
        // 全路径
        const allPath = data.mac || ''
        this.modulePath = allPath
        // 父id
        this.moduleParentId = data.parent_id
        // 父级全路径
        const index = allPath.lastIndexOf('>')
        if (index === -1) {
          this.moduleParentPath = ''
        } else {
          this.moduleParentPath = allPath.substring(0, index)
        }
        // 切换到编辑模块
        this.modType = 2
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    /* 新增模块 */
    addUpdata () {
      if (this.moduleId === 0) {
        // 刷新树
        this.getModuleTree(false)
        this.modType = 0
      } else {
        // 刷新树
        this.getModuleTree(true)
        this.modType = 2
      }
    },
    addCancel () {
      if (this.moduleId === 0) {
        this.modType = 0
      } else {
        this.modType = 2
      }
    },
    /* 编辑模块 */
    comUpdata () {
      if (this.moduleId === 0) {
        // 刷新树
        this.getModuleTree(false)
        this.modType = 0
      } else {
        // 刷新树
        this.getModuleTree(true)
        this.modType = 2
      }
    },
    /* 删除模块 */
    delUpdata () {
      this.delDialog = false
      // 初始化
      // 刷新树
      this.getModuleTree(false)
      this.modType = 0
      this.moduleId = 0
      this.moduleName = ''
      this.modulePath = ''
      this.moduleParentPath = ''
    },
    delCancel () {
      this.delDialog = false
    },
    // 初始化
    refreshClick () {
      // 刷新树
      this.$refs.tree.setCheckedKeys([])
      this.modType = 0
      this.moduleId = 0
      this.moduleName = ''
      this.modulePath = ''
      this.moduleParentPath = ''
    }
  },
  watch: {
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-row.css';
  .module-aside {
    padding-top: 40px;
    position: relative;
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
      .operate{
        a{
          margin-left: 5px;
        }
        .refresh{
          font-size: 18px;
        }
      }
    }
    .tree-mod{
      height: 100%;
      padding: 5px;
      overflow: auto;
    }
  }
  .module-main{
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #cccccc;
  }
</style>
