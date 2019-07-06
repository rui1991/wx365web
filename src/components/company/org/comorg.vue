<template>
  <div class="org-item">
    <h3 class="title">{{ titleName }}</h3>
    <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
      <el-form-item :label="name" prop="name">
        <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="上级机构" prop="parent" v-if="comForm.type === 3">
        <el-input :disabled="true" v-model="comForm.parentName" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="parentClick">选择上级</el-button>
      </el-form-item>
      <el-form-item label="上级机构" prop="parent" v-else>
        <el-input :disabled="true" v-model="comForm.parentName"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="comForm.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="comForm.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="site" prop="site" v-show="orgType === 2">
        <el-input v-model.trim="comForm.site" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="comForm.remark"></el-input>
      </el-form-item>
      <el-form-item :label="state" prop="state">
        <el-radio-group v-model="comForm.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">保 存</el-button>
    </div>
    <el-dialog title="选择上级机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="tree">
        <el-tree
          :data="parentTree"
          show-checkbox
          default-expand-all
          check-strictly
          node-key="id"
          ref="parentTree"
          @check-change="parentCheckChange"
          :props="defaultProps">
        </el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="parentDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectParent">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'comorg',
  data () {
    return {
      titleName: '编辑机构',
      name: '机构名称',
      site: '机构地址',
      state: '机构状态',
      mesHint: '机构编辑成功！',
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        linkman: [
          {required: true, message: '请输入联系人', trigger: 'blur'}
        ]
      },
      comForm: {
        type: '',
        name: '',
        parentName: '',
        parentId: 1,
        linkman: '',
        phone: '',
        site: '',
        remark: '',
        state: 0
      },
      comDisabled: false,
      parentDialog: false,
      parentTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      parentName: '',
      parentId: ''
    }
  },
  created () {

  },
  mounted () {
    if (this.orgType === 2) {
      this.titleName = '编辑分公司'
      this.name = '分公司名称'
      this.site = '分公司地址'
      this.state = '分公司状态'
      this.mesHint = '分公司编辑成功！'
    } else if (this.orgType === 3) {
      this.titleName = '编辑项目'
      this.name = '项目名称'
      this.site = '项目地址'
      this.state = '项目状态'
      this.mesHint = '项目编辑成功！'
    } else if (this.orgType === 4) {
      this.titleName = '编辑部门'
      this.name = '部门名称'
      this.site = '部门地址'
      this.state = '部门状态'
      this.mesHint = '部门编辑成功！'
    }
    // 获取详情
    this.getOrganDet()
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        orgId: state => state.org.orgId,
        baseId: state => state.org.baseId,
        orgType: state => state.org.orgType
      }
    )
  },
  methods: {
    getOrganDet () {
      let params = {
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.orgType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.comForm = {
            type: this.orgType,
            name: itemData.ogz_name,
            parentName: itemData.parent_up_name || '',
            parentId: itemData.parent_up_id || 1,
            linkman: itemData.user_name || '',
            phone: itemData.ogz_phone || '',
            site: itemData.address || '',
            remark: itemData.remarks || '',
            state: 0
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
        this.detDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 验证表单
    submitComForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendComRequest()
        } else {
          return false
        }
      })
    },
    // 提交
    sendComRequest () {
      let params = {
        user_id: this.userId,
        base_id: this.baseId,
        organize_id: this.orgId,
        organize_type: this.comForm.type,
        ogz_name: this.comForm.name,
        parent_up_id: this.comForm.parentId,
        user_name: this.comForm.linkman,
        ogz_phone: this.comForm.phone,
        address: this.comForm.site,
        remarks: this.comForm.remark,
        ogz_state: this.comForm.state,
        nature: '',
        area: '',
        industry: '',
        size: ''
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altOrganizeTree',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: this.mesHint,
            type: 'success'
          })
          // 刷新树
          this.$emit('parentRefresh')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.comDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 选择项目上级 */
    // 获取机构树
    getParentTree () {
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
          const orgData = res.data.data1
          // 处理机构树
          const treeData = this.initDisOrgTree(orgData)
          this.parentTree = treeData
          // 设置上级
          const parentId = this.comForm.parentId
          const parentName = this.comForm.parentName
          this.parentId = parentId
          this.parentName = parentName
          setTimeout(() => {
            this.$refs.parentTree.setCheckedKeys([parentId])
          }, 100)
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
    // 初始化处理组织树
    initDisOrgTree (treeData) {
      treeData.forEach(item => {
        if (item.organize_type === 3 || item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecOrgTree(item.children)
        }
      })
      return treeData
    },
    initRecOrgTree (data) {
      data.forEach(item => {
        if (item.organize_type === 3 || item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecOrgTree(item.children)
        }
      })
    },
    // 点击选择上级
    parentClick () {
      this.parentDialog = true
      if (this.parentTree.length === 0) {
        this.getParentTree()
      } else {
        const parentId = this.comForm.parentId
        const parentName = this.comForm.parentName
        this.parentId = parentId
        this.parentName = parentName
        setTimeout(() => {
          this.$refs.parentTree.setCheckedKeys([parentId])
        }, 100)
      }
    },
    // 选择上级
    parentCheckChange (data, checked, self) {
      if (checked === true) {
        this.parentId = data.id
        this.parentName = data.name
        this.$refs.parentTree.setCheckedKeys([data.id])
      } else {
        if (this.parentId === data.id) {
          this.$refs.parentTree.setCheckedKeys([data.id])
        }
      }
    },
    // 确定
    selectParent () {
      if (!this.parentId) {
        this.$message({
          showClose: true,
          message: '请选择上级机构！',
          type: 'warning'
        })
        return
      }
      this.comForm.parentId = this.parentId
      this.comForm.parentName = this.parentName
      this.parentDialog = false
    }
  },
  watch: {
    orgId (newVal, oldVal) {
      // 重置表单
      this.$refs['ruleComForm'].resetFields()
      // 切换标题
      if (this.orgType === 2) {
        this.titleName = '编辑分公司'
        this.name = '分公司名称'
        this.site = '分公司地址'
        this.state = '分公司状态'
        this.mesHint = '分公司编辑成功！'
      } else if (this.orgType === 3) {
        this.titleName = '编辑项目'
        this.name = '项目名称'
        this.site = '项目地址'
        this.state = '项目状态'
        this.mesHint = '项目编辑成功！'
      } else if (this.orgType === 4) {
        this.titleName = '编辑部门'
        this.name = '部门名称'
        this.site = '部门地址'
        this.state = '部门状态'
        this.mesHint = '部门编辑成功！'
      }
      // 获取详情
      this.getOrganDet()
    }
  }
}
</script>

<style lang="less" scoped>
  .org-item{
    width: 600px;
    margin: 0 auto;
    .title {
      height: 60px;
      text-align: center;
      line-height: 60px;
      font-size: 16px;
      font-weight: 600;
    }
    .operate {
      margin-top: 50px;
      text-align: center;
    }
  }
</style>
