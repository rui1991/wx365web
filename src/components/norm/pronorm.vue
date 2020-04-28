<template>
  <div class="pronorm">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>标准维护</el-breadcrumb-item>
          <el-breadcrumb-item>项目标准维护</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            :data="treeData"
            ref="tree"
            show-checkbox
            default-expand-all
            check-strictly
            check-on-click-node
            node-key="id"
            :props="defaultProps"
            @check-change="checkChange">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <el-button type="primary" :disabled="impDisabled" @click="importPlatform(0)">引入平台标准库</el-button>
            <el-button type="primary" :disabled="impDisabled" @click="importPlatform(1)">引入企业标准库</el-button>
            <el-button type="primary" :disabled="addDisabled" @click="addDialog = true">新增</el-button>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="sdt_name" label="标准名称"></el-table-column>
            <el-table-column prop="path" label="标准分类路径"></el-table-column>
            <el-table-column prop="csize" width="120" label="检查项数量"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)">编辑</a>
                <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row)">删除</a>
                <a href="javascript:void(0);" class="operate com" @click="skipClick(scope.row)" v-if="scope.row.depth === 3">检查项</a>
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
        </el-main>
      </el-container>
    </el-container>
    <!-- 新增标准 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑标准 -->
    <com-module
      :parentDialog="comDialog"
      :parentForm="comForm"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 删除标准 -->
    <del-module
      :parentDialog="delDialog"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
    <!-- 标准库 -->
    <library-module
      :parentDialog="libraryDialog"
      :parentType="libraryType"
      @parentUpdata="libraryUpdata"
      @parentCancel="libraryCancel">
    </library-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入新增标准组件
import addModule from '@/components/norm/normpath-add'
// 引入编辑标准组件
import comModule from '@/components/norm/normpath-com'
// 引入删除标准组件
import delModule from '@/components/norm/normpath-del'
// 引入标准库组件
import libraryModule from '@/components/norm/norm-library'
export default{
  name: 'pronorm',
  data () {
    return {
      orgType: 2,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
      id: 0,
      depth: 0,
      total: 0,
      nowPage: 1,
      limit: 10,
      addDisabled: true,
      addDialog: false,
      comDialog: false,
      comForm: {
        id: 0,
        name: '',
        remark: ''
      },
      delDialog: false,
      impDisabled: true,
      libraryDialog: false,
      libraryType: 0
    }
  },
  created () {
    // 获取标准树
    this.getNormData()
  },
  mounted () {
    // 保存组织
    let obj = {
      type: this.orgType,
      comid: this.companyId,
      proid: this.projectId
    }
    this.setNormOrgan(obj)
  },
  components: {
    addModule,
    comModule,
    delModule,
    libraryModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    /*
    * 数据说明：
    * ascription_type：Number  组织类型； 0：平台，1：企业， 2：项目
    * company_id：Number  所属企业ID
    * project_id：Number  所属项目ID
    * sdt_type：Number  标准树id
    * 树形  =>  列表
    * id   =>  sdt_type
    * sdt_id => sdt_id
    * s_type: 1设备标准类; 2巡检标准类
    * */

    // 定义保存标准数据
    ...mapActions('other', [
      'setNormOrgan',
      'setNormTree',
      'setNormData'
    ]),
    // 获取标准树
    getNormData () {
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let treeData = res.data.data1 || []
          if (treeData.length === 0) {
            // 初始化项目标准树
            this.initNormTree()
          } else {
            treeData.forEach(item => {
              if (item.s_type === 1) {
                item.disabled = true
              }
            })
            this.treeData = treeData
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
    getNormTree (b = false) {
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let treeData = res.data.data1 || []
          treeData.forEach(item => {
            if (item.s_type === 1) {
              item.disabled = true
            }
          })
          this.treeData = treeData
          if (b) {
            // 标记当前选中
            this.$refs.tree.setCheckedKeys([this.id])
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
    // 初始化项目标准树
    initNormTree () {
      let params = {
        company_id: this.companyId,
        project_id: this.projectId,
        this_type: this.orgType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/initializationStandardsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 重新获取标准树
          this.getNormTree()
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
    // 点击标准树
    checkChange (data, checked, self) {
      if (checked === true) {
        if (this.id === data.id) {
          return
        }
        this.$refs.tree.setCheckedKeys([data.id])
        // 设置当前id
        this.id = data.id
        this.depth = data.depth
        // 当前页码初始化
        this.nowPage = 1
        // 获取列表数据
        this.getListData()
        // 保存标准树数据
        // 参数 id:树ID; depth:第几层；type:标准类型，1：设备标准类，2：巡检标准类；
        let obj = {
          id: data.id,
          depth: data.depth,
          type: data.s_type,
          path: data.path
        }
        this.setNormTree(obj)
      } else {
        if (this.id === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    // 获取列表数据
    getListData () {
      let params = {
        ascription_type: this.orgType,
        company_id: this.companyId,
        project_id: this.projectId,
        sdt_type: this.id,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selStandardsMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    /* 新增标准 */
    addUpdata () {
      this.addDialog = false
      // 刷新标准树
      this.getNormTree(true)
      // 获取列表数据
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 编辑标准 */
    comClick (data) {
      this.comForm = {
        name: data.sdt_name,
        remark: data.remarks
      }
      // 参数 id:当前项的sdt_id； parid:父ID;
      // type:标准类型，1.设备标准类，2：巡检标准类；depth：第几层；path：路径
      let obj = {
        id: data.sdt_id,
        parid: data.parent_id,
        type: data.s_type,
        depth: data.depth,
        path: data.path,
        typeid: data.sdt_type
      }
      this.setNormData(obj)
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 刷新标准树
      this.getNormTree(true)
      // 获取列表数据
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 删除 */
    delClick (data) {
      let obj = {
        id: data.sdt_id,
        parid: data.parent_id,
        type: data.s_type,
        depth: data.depth,
        path: data.path,
        typeid: data.sdt_type
      }
      this.setNormData(obj)
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      // 刷新标准树
      this.getNormTree(true)
      // 获取列表数据
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    },
    /* 引入平台标准库 */
    importPlatform (type) {
      // libraryType  0:平台; 1:企业
      this.libraryType = type
      this.libraryDialog = true
    },
    libraryUpdata () {
      this.libraryDialog = false
      // 刷新标准树
      this.getNormTree(true)
      // 获取列表数据
      this.getListData()
    },
    libraryCancel () {
      this.libraryDialog = false
    },
    /* 检查项 */
    skipClick (data) {
      // 参数 id:当前项的sdt_id； parid:父ID;
      // type:标准类型，1.设备标准类，2：巡检标准类；depth：第几层；path：路径
      let obj = {
        id: data.sdt_id,
        parid: data.parent_id,
        type: data.s_type,
        depth: data.depth,
        path: data.path,
        typeid: data.sdt_type
      }
      this.setNormData(obj)
      this.$router.push(
        {
          path: '/main/normitem'
        }
      )
    }
  },
  watch: {
    depth (val, oldVal) {
      if (val === 1) {
        this.impDisabled = true
        this.addDisabled = false
      } else if (val === 2) {
        this.impDisabled = false
        this.addDisabled = false
      } else {
        this.impDisabled = true
        this.addDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
 .pronorm{
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
       padding-top: 10px;
       padding-right: 0;
       padding-bottom: 10px;
       padding-left: 10px;
       margin-left: 20px;
       margin-right: 20px;
       background: #ffffff;
       .module-aside{
         height: 100%;
         padding: 5px;
         border-radius: 6px;
         border: 1px solid #cccccc;
       }
       .module-main{
         padding-top: 0;
         padding-right: 10px;
         padding-bottom: 0;
         padding-left: 20px;
         overflow: scroll;
         .search{
           display: flex;
           height: 60px;
           align-items: center;
           justify-content: flex-end;

         }
       }
     }
   }
 }
</style>
