<template>
  <div class="position">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>基础配置</el-breadcrumb-item>
          <el-breadcrumb-item>位置管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <div class="tree-top">
            <p class="title">项目位置</p>
            <div class="operate">
              <a href="javascript:void(0);" class="blue" @click="addClick">新建</a>
              <a href="javascript:void(0);" class="blue" @click="addsClick">批量新建</a>
            </div>
          </div>
          <el-tree
            style="padding: 5px"
            :data="positionTree"
            ref="posTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            :props="defaultProps"
            @check-change="posCheckChange"
            @node-click="posNodeClick">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="content-item" v-show="operateType === 1">
            <h3 class="title">位置详情</h3>
            <el-form :model="detForm" :label-width="formLabelWidth">
              <el-form-item label="上级位置" prop="parent">
                <el-input :disabled="true" v-model="detForm.parent"></el-input>
              </el-form-item>
              <el-form-item label="位置类型" prop="type">
                <el-select v-model="detForm.type" disabled placeholder="请选择位置类型">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="位置名称" prop="name">
                <el-input :disabled="true" v-model="detForm.name" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input :disabled="true" type="textarea" v-model="detForm.remark"></el-input>
              </el-form-item>
              <el-form-item label="位置状态" prop="state">
                <el-switch v-model="detForm.state" disabled active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </el-form-item>
            </el-form>
            <div class="show-img">
              <h4 class="img-title">图片</h4>
              <div class="images" v-if="detForm.picture">
                <img :src="detForm.picture" height="120" alt="">
              </div>
              <p class="img-hint" v-else>未上传图片</p>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="detDisabled" @click="submitDetForm">编 辑</el-button>
            </div>
          </div>
          <div class="content-item" v-show="operateType === 2">
            <h3 class="title">编辑位置</h3>
            <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
              <el-form-item label="上级位置" prop="parent">
                <el-input :disabled="true" v-model="comForm.parent"></el-input>
              </el-form-item>
              <el-form-item label="位置类型" prop="type">
                <el-select v-model="comForm.type" placeholder="请选择位置类型">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="位置名称" prop="name">
                <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="comForm.remark"></el-input>
              </el-form-item>
              <el-form-item label="位置状态" prop="state">
                <el-switch v-model="comForm.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </el-form-item>
            </el-form>
            <el-upload
              class="upload-demo"
              :action="reqUrl"
              :on-success="handleSuccess"
              :on-error="handleError"
              :on-remove="handleRemove"
              :file-list="fileList"
              :multiple="false"
              :limit="imgLimit"
              list-type="picture">
              <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
              <el-button size="small" type="primary" @click="showComImg = false">{{ comImgText }}</el-button>
              <div slot="tip" class="el-upload__tip" style="padding-left: 120px; color: red;">只能上传单张jpg/png文件，大小不超过2048kb！</div>
            </el-upload>
            <div class="operate">
              <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
              <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
            </div>
          </div>
          <div class="content-item" v-show="operateType === 3">
            <h3 class="title">新增位置</h3>
            <el-form :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
              <el-form-item label="上级位置" prop="parent">
                <el-input :disabled="true" v-model="addForm.parent"></el-input>
              </el-form-item>
              <el-form-item label="位置类型" prop="type">
                <el-select v-model="addForm.type" placeholder="请选择位置类型">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="位置名称" prop="name">
                <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="addForm.remark"></el-input>
              </el-form-item>
              <el-form-item label="位置状态" prop="state">
                <el-switch v-model="addForm.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </el-form-item>
            </el-form>
            <el-upload
              class="upload-demo"
              :action="reqUrl"
              :on-success="handleSuccess"
              :on-error="handleError"
              :on-remove="handleRemove"
              :multiple="false"
              :file-list="fileList"
              :limit="imgLimit"
              list-type="picture">
              <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip" style="padding-left: 120px;">只能上传单张jpg/png文件，大小不超过2048kb！</div>
            </el-upload>
            <div class="operate">
              <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
              <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
            </div>
          </div>
          <div class="content-item" v-show="operateType === 4">
            <h3 class="title">批量新增位置</h3>
            <el-form :model="addsForm" :rules="rules" ref="ruleAddsForm" :label-width="formLabelWidth">
              <el-form-item label="上级位置" prop="parent">
                <el-input :disabled="true" v-model="addsForm.parent"></el-input>
              </el-form-item>
              <el-form-item label="位置类型" prop="type">
                <el-select v-model="addsForm.type" placeholder="请选择位置类型">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="输入类型" prop="importType">
                <el-radio-group v-model="addsForm.importType">
                  <el-radio :label="1">连续</el-radio>
                  <el-radio :label="2">无规则</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="位置名称" required v-if="addsForm.importType === 1">
                <el-col :span="10">
                  <el-form-item prop="name1">
                    <el-input v-model.number="addsForm.name1" type="number" auto-complete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col class="line" :span="4" style="text-align: center;">----</el-col>
                <el-col :span="10">
                  <el-form-item prop="name2">
                    <el-input v-model.number="addsForm.name2" type="number" auto-complete="off"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
              <el-form-item label="位置名称" prop="name" v-else>
                <el-input v-model.trim="addsForm.names" placeholder="多个位置名称之间用英文逗号隔开" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="单位名称" required v-if="addsForm.importType === 1">
                <el-col :span="12">
                  <el-form-item prop="unit">
                    <el-input v-model.trim="addsForm.unit" auto-complete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12" style="padding-left: 20px; color: red;">例如：栋，单元，层，等！</el-col>
              </el-form-item>
              <el-form-item label="位置状态" prop="state">
                <el-switch v-model="addsForm.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </el-form-item>
            </el-form>
            <div class="operate">
              <el-button @click="resetAddForm('ruleAddsForm')">取 消</el-button>
              <el-button type="primary" :disabled="addsDisabled" @click="submitAddsForm('ruleAddsForm')">确 定</el-button>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'position',
  data () {
    return {
      positionTree: [],
      treeHighlight: true,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      posId: 0,
      posName: '',
      operateType: 0,
      typeOptions: [
        {
          label: '楼栋',
          value: 1
        },
        {
          label: '单元',
          value: 2
        },
        {
          label: '楼层',
          value: 3
        },
        {
          label: '位置',
          value: 5
        },
        {
          label: '公共区域',
          value: 6
        },
        {
          label: '停车场',
          value: 7
        },
        {
          label: '商铺',
          value: 8
        }
      ],
      detForm: {
        parent: '',
        type: '',
        name: '',
        remark: '',
        state: true,
        imgUrl: '',
        picture: ''
      },
      detDisabled: false,
      comForm: {
        parent: '',
        type: '',
        name: '',
        remark: '',
        state: true,
        imgUrl: '',
        picture: ''
      },
      comImgText: '上传图片',
      showComImg: true,
      comDisabled: false,
      addForm: {
        parent: '',
        type: '',
        name: '',
        remark: '',
        state: true
      },
      addDisabled: false,
      addsForm: {
        parent: '',
        type: '',
        importType: 1,
        names: '',
        name1: '',
        name2: '',
        unit: '',
        state: true
      },
      importType: 2,
      addsDisabled: false,
      rules: {
        type: [
          { required: true, message: '请选择位置类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '请选择位置状态', trigger: 'change' }
        ],
        importType: [
          { required: true, message: '请选择输入类型', trigger: 'change' }
        ],
        name1: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        name2: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位名称', trigger: 'blur' }
        ]
      },
      formLabelWidth: '100px',
      reqUrl: '',
      imgLimit: 1,
      fileList: []
    }
  },
  created () {
    // 获取位置树
    this.getPositionTree()
  },
  mounted () {
    // 设置上传地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id' + this.userId
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowProname: state => state.nowProname
      }
    )
  },
  methods: {
    // 获取位置树
    getPositionTree (b = false) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.locationApi() + '/location/v1.0/selLocationTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const treeData = res.data.data1
          this.positionTree = [
            {
              'id': 0,
              'name': this.nowProname,
              'children': treeData
            }
          ]
          if (b) {
            this.$refs.siteTree.setCheckedKeys([this.posId])
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
    // 点击位置树
    posCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.orgId === data.id) {
          return
        }
        this.$refs.posTree.setCheckedKeys([data.id])
        // 存储当前id
        this.posId = data.id
        if (data.id === 0) {
          this.posName = ''
          this.operateType = 0
        } else {
          this.posName = data.name
          this.operateType = 1
          // 获取详情
          this.detForm = {
            parent: '',
            type: '',
            name: '',
            remark: '',
            state: true,
            imgUrl: '',
            images: []
          }
          this.getPositionDet()
        }
      } else {
        if (this.posId === data.id) {
          this.$refs.posTree.setCheckedKeys([data.id])
        }
      }
    },
    posNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.posTree.setCheckedKeys([data.id])
      // 存储当前id
      this.posId = data.id
      if (data.id === 0) {
        this.posName = ''
        this.operateType = 0
      } else {
        this.posName = data.name
        this.operateType = 1
        // 获取详情
        this.detForm = {
          parent: '',
          type: '',
          name: '',
          remark: '',
          state: true,
          imgUrl: '',
          images: []
        }
        this.getPositionDet()
      }
    },
    // 获取位置详情
    getPositionDet () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        location_id: this.posId
      }
      params = this.$qs.stringify(params)
      this.detDisabled = true
      this.$axios({
        method: 'post',
        url: this.locationApi() + '/location/v1.0/selLocationByID',
        data: params
      }).then((res) => {
        this.detDisabled = false
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 状态
          const stateCode = itemData.location_state
          let state = true
          if (stateCode === 0) {
            state = true
          } else if (stateCode === 1) {
            state = false
          }
          // 图片
          let picture = ''
          const imgUrl = itemData.picture || ''
          if (imgUrl) {
            picture = this.sysetApi() + '/showImage?state=10&filename=' + imgUrl
          }
          this.detForm = {
            parent: itemData.parent_location_name || '',
            type: itemData.location_type,
            name: itemData.location_name,
            remark: itemData.remark,
            state: state,
            imgUrl: imgUrl,
            picture: picture
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
    /* 编辑 */
    submitDetForm () {
      this.operateType = 2
      this.comForm = JSON.parse(JSON.stringify(this.detForm))
      this.fileList = []
      if (this.detForm.picture) {
        this.comImgText = '重新上传'
      } else {
        this.comImgText = '上传图片'
      }
      this.showComImg = true
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
    // 重置表单
    resetComForm (formName) {
      this.$refs[formName].resetFields()
      this.operateType = 1
    },
    // 提交
    sendComRequest () {
      // 状态
      const state = this.comForm.state
      let stateCode = 1
      if (state) {
        stateCode = 0
      }
      // 图片
      let picture = ''
      if (this.showComImg) {
        picture = this.comForm.imgUrl
      } else {
        const fileList = this.fileList
        if (fileList.length > 0) {
          picture = fileList[0].response
        }
      }
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        location_id: this.posId,
        location_type: this.comForm.type,
        location_name: this.comForm.name,
        remark: this.comForm.remark,
        location_state: stateCode,
        pictures: picture
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.locationApi() + '/location/v1.0/altLocation',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.operateType = 1
          // 获取详情
          this.detForm = {
            parent: '',
            type: '',
            name: '',
            remark: '',
            state: true,
            images: []
          }
          this.getPositionDet()
          // 刷新树
          this.getPositionTree()
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
    /* 新增 */
    addClick () {
      this.operateType = 3
      this.addForm = {
        parent: this.posName,
        type: '',
        name: '',
        remark: '',
        state: true
      }
      this.fileList = []
    },
    // 验证表单
    submitAddForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendAddRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetAddForm (formName) {
      this.$refs[formName].resetFields()
      if (this.posId === 0) {
        this.operateType = 0
      } else {
        this.operateType = 1
      }
    },
    // 提交
    sendAddRequest () {
      // 状态
      const state = this.addForm.state
      let stateCode = 1
      if (state) {
        stateCode = 0
      }
      // 图片
      const fileList = this.fileList
      let picture = ''
      if (fileList.length > 0) {
        picture = fileList[0].response
      }
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        parent_id: this.posId,
        location_type: this.addForm.type,
        location_name: this.addForm.name,
        remark: this.addForm.remark,
        location_state: stateCode,
        pictures: picture
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.locationApi() + '/location/v1.0/addLocation',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
          // 刷新树
          this.getPositionTree()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.addDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 批量新增 */
    addsClick () {
      this.operateType = 4
      this.addsForm = {
        parent: this.posName,
        type: '',
        importType: 1,
        names: '',
        name1: '',
        name2: '',
        unit: '',
        state: true
      }
    },
    // 验证表单
    submitAddsForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendAddsRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetAddsForm (formName) {
      this.$refs[formName].resetFields()
      if (this.posId === 0) {
        this.operateType = 0
      } else {
        this.operateType = 1
      }
    },
    // 提交
    sendAddsRequest () {
      // 状态
      const state = this.addsForm.state
      let stateCode = 1
      if (state) {
        stateCode = 0
      }
      // 输入类型
      const importType = this.addsForm.importType
      let params = {}
      if (importType === 1) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          parent_id: this.posId,
          location_type: this.addsForm.type,
          input_type: importType,
          start_location_name: this.addsForm.name1,
          end_location_name: this.addsForm.name2,
          location_name_unit: this.addsForm.unit,
          remark: '',
          location_state: stateCode
        }
      } else {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          parent_id: this.posId,
          location_type: this.addsForm.type,
          input_type: importType,
          location_names: this.addsForm.names,
          // start_location_name: this.addsForm.name1,
          // end_location_name: this.addsForm.name2,
          // location_name_unit: this.addsForm.unit,
          remark: '',
          location_state: stateCode
        }
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.locationApi() + '/location/v1.0/addBatchLocation',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddsForm('ruleAddsForm')
          // 刷新树
          this.getPositionTree()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.addDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 上传图片 */
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      this.fileList = fileList
      // this.fileList = file
    },
    // 上传图片失败
    handleError () {
      this.$message({
        showClose: true,
        message: '上传图片失败，请稍后再试！',
        type: 'error'
      })
    },
    // 删除图片
    handleRemove (file, fileList) {
      this.fileList = fileList
    }
  }
}
</script>

<style lang="less" scoped>
.position{
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
        .content-item{
          width: 600px;
          margin: 0 auto;
          .title{
            height: 60px;
            text-align: center;
            line-height: 60px;
            font-size: 16px;
            font-weight: 600;
          }
          .operate{
            margin-top: 50px;
            text-align: center;
          }
          .show-img{
            padding-bottom: 10px;
            .img-title{
              width: 100px;
              padding-right: 12px;
              text-align: right;
            }
            .images{
              text-align: center;
              img{
                margin: 5px;
              }
            }
            .img-hint{
              height: 35px;
              line-height: 35px;
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style>
