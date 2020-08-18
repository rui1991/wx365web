<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>硬件对接</el-breadcrumb-item>
        <el-breadcrumb-item>推送设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-content">
      <div class="module-aside">
        <!-- 组织树 -->
        <org-module
          @parentUpOrg="updateOrgan">
        </org-module>
      </div>
      <div class="module-main">
        <div class="main-search main-search-single">
          <div class="operate">
            <el-button type="primary" :disabled="addDisabled" @click="addDialog = true">新增</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="project_name" label="项目名称"></el-table-column>
          <el-table-column prop="type_name" label="消息类型"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.project_id, scope.row.type)">关闭</a>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentName="proName"
      :parentId="proId"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      :parentType="itemType"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
/*
* state:  0 设置     1 解除
* tyep:  1 巡检任务  2  固定岗
* */
import { mapState } from 'vuex'
// 引入组织树组件
import orgModule from '@/components/public/report-org1'
// 引入新增组件
import addModule from '@/components/external/mespush-add'
// 引入删除组件
import delModule from '@/components/external/mespush-del'
export default{
  name: 'mespush',
  data () {
    return {
      orgType: 0,
      proName: '',
      proId: 0,
      itemId: 0,
      itemType: 1,
      tableData: [],
      addDisabled: true,
      addDialog: false,
      delDialog: false
    }
  },
  created () {
    // 获取设置列表
    this.getListData()
  },
  components: {
    orgModule,
    addModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  filters: {

  },
  methods: {
    // 组织树
    updateOrgan (data) {
      this.orgType = data.type
      this.proName = data.name
      this.proId = data.proId
      if (data.type === 3) {
        this.addDisabled = false
      } else {
        this.addDisabled = true
      }
    },
    // 获取设置列表
    getListData () {
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/selPushSetOO'
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let resData = res.data.data1
          let tableData = []
          resData.forEach(item => {
            let types = item.types.split(',')
            types.forEach(inItem => {
              if (inItem === '1') {
                tableData.push({
                  project_id: item.project_id,
                  project_name: item.project_name,
                  type: 1,
                  type_name: '巡检任务'
                })
              } else if (inItem === '2') {
                tableData.push({
                  project_id: item.project_id,
                  project_name: item.project_name,
                  type: 2,
                  type_name: '固定岗'
                })
              }
            })
          })
          this.tableData = tableData
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
    /* 删除 */
    delClick (id, type) {
      this.itemId = id
      this.itemType = type
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      // 更新列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-row.css';
</style>
