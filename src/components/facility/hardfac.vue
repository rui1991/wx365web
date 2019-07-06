<template>
  <div class="hardfac">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item>硬件设备管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>mac地址</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.mac"></el-input>
            </div>
            <div class="item">
              <span>设备类型</span>
              <el-select v-model="nowSearch.type" clearable style="width: 160px;" placeholder="请选择设备类型">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addClick">新增</el-button>
              <!--<el-button type="primary" :disabled="downDisabled" @click="upClick">导入</el-button>-->
            </div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>设备名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>设备状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择设备状态">
                <el-option
                  v-for="item in stateOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <!--<el-button type="primary" @click="recordClick">导入记录</el-button>-->
              <el-button type="primary" @click="warningClick">告警推送</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="设备名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="checkDetails(scope.row.id, scope.row.dtype)">{{ scope.row.dname }}</a>
            </template>
          </el-table-column>
          <el-table-column label="MAC地址">
            <template slot-scope="scope">
              <span>{{scope.row.mac | filterMac}}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备类型">
            <template slot-scope="scope">
              <span v-if="scope.row.dtype === 'dwjz'">定位基站</span>
              <span v-else-if="scope.row.dtype === 'cjk'">采集卡</span>
              <span v-else-if="scope.row.dtype === 'sjwg'">数据网关</span>
            </template>
          </el-table-column>
          <el-table-column label="设备位置">
            <template slot-scope="scope">
              <span v-if="scope.row.location_name">{{ scope.row.location_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="gl" label="是否已关联数据网关"></el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.device_state === 0">在线</span>
              <span v-else-if="scope.row.device_state === 1">离线</span>
              <span v-else-if="scope.row.device_state === 2">电量不足</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="relateClick(scope.row.id, scope.row.dtype)" v-if="scope.row.dtype === 'sjwg'">设备关联</a>
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)" v-if="scope.row.dtype === 'sjwg'">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.id, scope.row.dtype)" v-if="scope.row.dtype === 'sjwg'">删除</a>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page="nowPage"
          layout="prev, pager, next, total"
          @current-change="pageChang"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
    <!-- 新增 -->
    <el-dialog title="新增设备" :visible.sync="addDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <p style="height: 35px; color: #f04645;">提示：只可新增网关类型设备，如需添加采集信息，请通过用户管理进行添加！</p>
      <el-form class="divide-from" :model="addForm" :rules="rules" ref="ruleAddForm" :label-width="formLabelWidth">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select style="width: 100%;" v-model="addForm.type" placeholder="请选择设备类型">
            <el-option
              v-for="item in typeOpeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备mac" prop="mac">
          <el-input v-model.trim="addForm.mac" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备位置" prop="posName" v-show="addPostion">
          <el-input :disabled="true" v-model="addForm.posName"></el-input>
          <el-button type="primary" @click="posClick">选择位置</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetAddForm('ruleAddForm')">取 消</el-button>
        <el-button type="primary" :disabled="addDisabled" @click="submitAddForm('ruleAddForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="设备详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog mult-dialog">
      <el-tabs v-model="detActive" type="card" @tab-click="detTabClick">
        <el-tab-pane label="设备详情" name="facility"></el-tab-pane>
        <el-tab-pane label="设备电量详情" :disabled="detTabDis" name="electric"></el-tab-pane>
        <el-tab-pane label="设备履历详情" :disabled="detTabDis" name="record"></el-tab-pane>
      </el-tabs>
      <el-form :model="detForm" :label-width="formLabelWidth" v-show="detActive === 'facility'">
        <div class="two-form">
          <el-form-item class="item" label="设备名称">
            <el-input :disabled="true" v-model="detForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="设备类型">
            <el-input :disabled="true" v-model="detForm.type"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="设备mac">
            <el-input :disabled="true" v-model="detForm.mac"></el-input>
          </el-form-item>
          <el-form-item class="item" label="设备位置">
            <el-input :disabled="true" v-model="detForm.posName"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="设备状态">
            <el-input :disabled="true" v-model="detForm.state"></el-input>
          </el-form-item>
        </div>
        <el-table class="select-table" :data="detForm.relateTable" v-show="detForm.relateTable.length > 0">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="设备MAC地址" width="180">
            <template slot-scope="scope">
              <span v-if="scope.row.gw_type === 'sjwg'">{{ scope.row.gw_mac }}</span>
              <span v-else-if="scope.row.card_type === 'cjk'">{{ scope.row.card_mac }}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备类型" width="80">
            <template slot-scope="scope">
              <span v-if="scope.row.gw_type === 'sjwg'">数据网关</span>
              <span v-else-if="scope.row.card_type === 'cjk'">采集卡</span>
            </template>
          </el-table-column>
          <el-table-column label="设备名称">
            <template slot-scope="scope">
              <span v-if="scope.row.gw_type === 'sjwg'">{{ scope.row.gw_name }}</span>
              <span v-else-if="scope.row.card_type === 'cjk'">{{ scope.row.card_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="绑定状态">
            <template slot-scope="scope">
              <span v-if="scope.row.register_state === 0">已绑定</span>
              <span v-else-if="scope.row.register_state === 1">未绑定</span>
            </template>
          </el-table-column>
          <!--<el-table-column label="操作" width="120">-->
            <!--<template slot-scope="scope">-->
              <!--<a href="javascript:void(0);" class="operate com" @click="untieSwgClick(scope.row.gw_id)" v-if="scope.row.gw_type === 'sjwg'">解除关联</a>-->
              <!--<a href="javascript:void(0);" class="operate com" @click="untieCardClick(scope.row.card_id)" v-else-if="scope.row.card_type === 'cjk'">解除关联</a>-->
            <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
      </el-form>
      <el-form :model="detEleForm" :label-width="formLabelWidth" v-show="detActive === 'electric'">
        <div class="two-form">
          <el-form-item class="item" label="设备名称">
            <el-input :disabled="true" v-model="detEleForm.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="设备mac">
            <el-input :disabled="true" v-model="detEleForm.mac"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="当前电量">
            <el-input :disabled="true" v-model="detEleForm.quantity"></el-input>
          </el-form-item>
          <el-form-item class="item" label="设备状态">
            <el-input :disabled="true" v-model="detEleForm.state"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="充电频次">
            <el-input :disabled="true" v-model="detEleForm.frequency"></el-input>
          </el-form-item>
          <el-form-item class="item" label="可用时长">
            <el-input :disabled="true" v-model="detEleForm.usable"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-form :model="detRecForm" :label-width="formLabelWidth" v-show="detActive === 'record'">
        <div class="two-form">
          <el-form-item class="item" label="注册时间">
            <el-input :disabled="true" v-model="detRecForm.time"></el-input>
          </el-form-item>
          <el-form-item class="item" label="使用公司">
            <el-input :disabled="true" v-model="detRecForm.firm"></el-input>
          </el-form-item>
        </div>
        <div class="two-form" v-for="item in detRecForm.list" :key="item.time">
          <el-form-item class="item" label="升级时间">
            <el-input :disabled="true" v-model="item.create_time"></el-input>
          </el-form-item>
          <el-form-item class="item" label="版本号">
            <el-input :disabled="true" v-model="item.version"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑设备" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="comForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="设备类型" prop="type">-->
          <!--<el-select style="width: 100%;" v-model="comForm.type" :disabled="true" placeholder="请选择设备类型">-->
            <!--<el-option-->
              <!--v-for="item in typeOptions"-->
              <!--:key="item.value"-->
              <!--:label="item.label"-->
              <!--:value="item.value">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="设备mac" prop="mac">
          <el-input v-model.trim="comForm.mac" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备位置" prop="posName" v-show="comPostion">
          <el-input :disabled="true" v-model="comForm.posName"></el-input>
          <el-button type="primary" @click="posClick">选择位置</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该设备？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 位置 -->
    <el-dialog title="选择位置" :visible.sync="posDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-tree
        :data="posTree"
        :highlight-current="posHighlight"
        default-expand-all
        node-key="id"
        :props="defaultProps"
        @node-click="posTreeClick">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="posDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectPos">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 采集卡列表 -->
    <el-dialog title="关联采集卡" :visible.sync="cardDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入采集卡名称" prefix-icon="el-icon-search" v-model="cardfilter"></el-input>
      <el-table class="select-table" :data="cardData" @selection-change="cardSelectChange" style="width: 100%" max-height="360">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="mac" label="MAC地址"></el-table-column>
        <el-table-column prop="dname" label="设备名称"></el-table-column>
        <el-table-column label="设备类型">
          <template slot-scope="scope">
            <span>采集卡</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cardDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="cardDisabled" @click="sendRelateCard">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 解绑 -->
    <el-dialog title="提示" :visible.sync="untieDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要解绑该硬件设备？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="untieDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="untieDisabled" @click="submitUntieForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <el-dialog title="选择人员" :visible.sync="crewDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-input class="search" placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model="crewfilter" style="width: 40%; margin-bottom: 10px;"></el-input>
      <el-table class="select-table" :data="crewData" ref="crewTable" @selection-change="crewSelectionChange" stripe style="width: 100%" max-height="360">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="user_name" label="姓名"></el-table-column>
        <el-table-column prop="user_phone" label="联系方式"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="crewDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="cerwDisabled" @click="addWarningSend">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog title="导入硬件设备" :visible.sync="upDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div class="up-file">
        <span class="txt">导入文件</span>
        <el-upload
          class="upload-demo"
          :action="reqUrl"
          :headers="reqHead"
          :on-success="upFileSuccess"
          :on-error="upFileError"
          :multiple="false"
          :file-list="fileList">
          <el-button size="small" type="primary">点击导入</el-button>
        </el-upload>
        <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑硬件设备</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="upDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'hardfac',
  data () {
    let checkMac = (rule, value, callback) => {
      let regex = /^[a-zA-Z0-9]{8,12}$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac格式有误，请认真核对'))
        }
      } else {
        callback(new Error('请输入设备的mac地址'))
      }
    }
    return {
      search: {
        mac: '',
        type: '',
        name: '',
        state: ''
      },
      nowSearch: {
        mac: '',
        type: '',
        name: '',
        state: ''
      },
      typeOptions: [
        // {
        //   label: '定位基站',
        //   value: 'dwjz'
        // },
        {
          label: '采集卡',
          value: 'cjk'
        },
        {
          label: '数据网关',
          value: 'sjwg'
        }
      ],
      stateOptions: [
        {
          label: '正常',
          value: 0
        },
        {
          label: '离线',
          value: 1
        },
        {
          label: '电量不足',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        // type: [
        //   { required: true, message: '请选择设备类型', trigger: 'change' }
        // ],
        mac: [
          { required: true, validator: checkMac, trigger: 'blur' }
        ]
      },
      typeOpeOptions: [
        {
          label: '数据网关',
          value: 'sjwg'
        }
      ],
      addDialog: false,
      addForm: {
        name: '',
        type: 'sjwg',
        mac: '',
        posName: '',
        posId: ''
      },
      addPostion: true,
      addDisabled: false,
      detDialog: false,
      detForm: {
        name: '',
        type: '',
        mac: '',
        posName: '',
        state: '',
        relateTable: []
      },
      detTabDis: false,
      detActive: 'facility',
      detEleState: false,
      detEleForm: {
        name: '',
        mac: '',
        quantity: '',
        state: '',
        frequency: '',
        usable: ''
      },
      detRecState: false,
      detRecForm: {
        time: '',
        firm: '',
        list: []
      },
      comDialog: false,
      comForm: {
        name: '',
        type: '',
        mac: '',
        posName: '',
        posId: ''
      },
      comPostion: true,
      comDisabled: false,
      delDialog: false,
      delDisabled: false,
      itemId: '',
      itemType: '',
      swgId: '',
      cardId: '',
      posDialog: false,
      posTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      checkedPosId: '',
      checkedPosName: '',
      posHighlight: true,
      cardDialog: false,
      cardfilter: '',
      AllCardData: [],
      cardData: [],
      ocardData: [],
      cardSelection: [],
      cardDisabled: false,
      untieDialog: false,
      untieDisabled: false,
      crewDialog: false,
      crewData: [],
      ocrewData: [],
      crewfilter: '',
      linkmanSelection: [],
      cerwDisabled: true,
      upDialog: false,
      downDisabled: false,
      reqUrl: '',
      reqHead: {
        token: sessionStorage.getItem('wxWebToken'),
        user_id: sessionStorage.getItem('wxWebUserId')
      },
      fileList: []
    }
  },
  created () {
    // 获取列表
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid,
        nowOrgid: state => state.nowOrgid
      }
    )
  },
  methods: {
    // 搜索
    searchList () {
      let mac = this.nowSearch.mac
      mac = this.formatSetMac(mac)
      this.search = {
        mac: mac,
        type: this.nowSearch.type,
        name: this.nowSearch.name,
        state: this.nowSearch.state
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        mac: this.search.mac,
        dtype: this.search.type,
        dname: this.search.name,
        device_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareList',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.hardware
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
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 新增 */
    addClick () {
      this.addDialog = true
      this.addForm = {
        name: '',
        type: 'sjwg',
        mac: '',
        posName: '',
        posId: ''
      }
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
      this.addDialog = false
    },
    // 提交
    sendAddRequest () {
      let mac = this.addForm.mac
      mac = this.formatSetMac(mac)
      let params = {}
      if (this.addForm.posId) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          dname: this.addForm.name,
          dtype: this.addForm.type,
          mac: mac,
          location_id: this.addForm.posId
        }
      } else {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          dname: this.addForm.name,
          dtype: this.addForm.type,
          mac: mac
        }
      }
      params = this.$qs.stringify(params)
      this.addDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/addHardware',
        data: params
      }).then((res) => {
        this.addDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetAddForm('ruleAddForm')
          // 刷新列表
          this.getListData()
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
    // 格式化获取Mac地址
    formatGetMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    // 格式化Mac地址
    formatSetMac (str) {
      let value = str.toLowerCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    /* 详情 */
    checkDetails (id, type) {
      this.itemId = id
      this.itemType = type
      if (type === 'cjk') {
        this.detTabDis = false
      } else {
        this.detTabDis = true
      }
      this.detActive = 'facility'
      this.detEleState = false
      this.detRecState = false
      this.detDialog = true
      this.detForm = {
        name: '',
        type: '',
        mac: '',
        posName: '',
        state: '',
        relateTable: []
      }
      this.getDetItem()
    },
    getDetItem () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        device_id: this.itemId,
        dtype: this.itemType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 设备类型
          const typeValue = itemData.device_type
          let type = ''
          if (typeValue === 'dwjz') {
            type = '定位基站'
          } else if (typeValue === 'cjk') {
            type = '采集卡'
          } else if (typeValue === 'sjwg') {
            type = '数据网关'
          }
          // 设备状态
          const stateValue = itemData.device_state
          let state = ''
          if (stateValue === 0) {
            state = '在线'
          } else if (stateValue === 1) {
            state = '离线'
          } else if (stateValue === 2) {
            state = '电量不足'
          }
          this.detForm = {
            name: itemData.device_name,
            type: type,
            mac: itemData.device_mac,
            posName: itemData.location_name || '',
            state: state,
            relateTable: itemData.relation || []
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
    // 详情导航
    detTabClick (tab) {
      if (tab.name === 'facility') return
      if (tab.name === 'electric') {
        if (!this.detEleState) {
          // 清空数据
          this.detEleForm = {
            name: '',
            mac: '',
            quantity: '',
            state: '',
            frequency: '',
            usable: ''
          }
          this.checkEleDetails()
        }
      } else if (tab.name === 'record') {
        if (!this.detRecState) {
          // 清空数据
          this.detRecForm = {
            time: '',
            firm: '',
            list: []
          }
          this.checkRecDetails()
        }
      }
    },
    /* 电量详情 */
    checkEleDetails () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        device_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwarePwOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 电量详情状态
          this.detEleState = true
          const itemData = res.data.data1
          // 当前电量
          let quantity = itemData.card_pw || ''
          if (quantity) {
            quantity = quantity + '%'
          }
          // 充电频次
          let frequency = itemData.frequency || ''
          if (frequency) {
            frequency = '1周' + frequency + '次'
          }
          // 可用时长
          const usable = this.timeStamp(itemData.ctime)
          this.detEleForm = {
            name: itemData.card_name || '',
            mac: itemData.card_mac || '',
            quantity: quantity,
            state: itemData.lineState || '',
            frequency: frequency,
            usable: usable
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
    timeStamp (num) {
      if (!num) { return '' }
      let day = Number.parseInt(num / 60 / 24)
      var hour = Number.parseInt(num / 60 % 24)
      var min = Number.parseInt(num % 60)
      let time = ''
      if (day > 0) {
        time = day + '天'
      }
      if (hour > 0) {
        time += hour + '小时'
      }
      if (min > 0) {
        time += parseFloat(min) + '分钟'
      }
      return time
    },
    /* 履历详情 */
    checkRecDetails () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        device_id: this.itemId,
        dtype: this.itemType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareVsOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 履历详情状态
          this.detRecState = true
          const itemData = res.data.data1
          // 注册时间
          let registime = itemData.registime
          const index = registime.indexOf('.')
          let time = registime.substring(0, index)
          // 版本信息
          const vsm = itemData.vsm
          let list = vsm.map(item => {
            return {
              create_time: this.$common.formatDate(item.create_time),
              version: item.version
            }
          })
          this.detRecForm = {
            time: time,
            firm: itemData.organize_name,
            list: list
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
    /* 编辑 */
    comClick (data) {
      this.itemId = data.id
      this.comDialog = true
      this.comForm = {
        name: data.dname,
        type: data.dtype,
        mac: data.mac,
        posName: data.location_name || '',
        posId: data.location_id || ''
      }
    },
    // 重置表单
    resetComForm (formName) {
      this.$refs[formName].resetFields()
      this.comDialog = false
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
      let params = {}
      if (this.comForm.posId) {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          device_id: this.itemId,
          dname: this.comForm.name,
          dtype: this.comForm.type,
          location_id: this.comForm.posId
        }
      } else {
        params = {
          company_id: this.nowClientId,
          user_id: this.userId,
          project_id: this.nowProid,
          device_id: this.itemId,
          dname: this.comForm.name,
          dtype: this.comForm.type
        }
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/altHardware',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetComForm('ruleComForm')
          // 刷新列表
          this.getListData()
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
    /* 删除 */
    delClick (id, type) {
      this.itemId = id
      this.itemType = type
      this.delDialog = true
    },
    submitDelForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        device_id: this.itemId,
        dtype: this.itemType
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/altHardwareState',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.delDialog = false
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.delDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 设备关联 */
    relateClick (id, type) {
      this.itemId = id
      this.itemType = type
      this.cardDialog = true
      // 获取采集卡列表
      this.getCardList()
    },
    // 获取卡片列表
    getCardList () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        mac: '',
        dtype: 'cjk',
        dname: '',
        device_state: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareList',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 卡片列表
          this.AllCardData = res.data.data1.hardware
          // 排除已绑定
          this.getSwgDetails()
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
    // 获取该网关已绑定卡片
    getSwgDetails () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        device_id: this.itemId,
        dtype: 'sjwg'
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const bindCard = res.data.data1.relation || []
          let cardData = JSON.parse(JSON.stringify(this.AllCardData))
          bindCard.forEach(bindItem => {
            cardData.forEach((cardItem, index) => {
              if (bindItem.card_id === cardItem.id) {
                cardData.splice(index, 1)
              }
            })
          })
          this.cardData = cardData
          this.ocardData = cardData
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
    // 获取选中项
    cardSelectChange (data) {
      this.cardSelection = data
    },
    // 提交
    sendRelateCard () {
      const selectCard = this.cardSelection
      if (selectCard.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择你要绑定的采集卡！',
          type: 'warning'
        })
        return
      }
      let cardIds = []
      selectCard.forEach(item => {
        cardIds.push(item.id)
      })
      cardIds = cardIds.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        gw_id: this.itemId,
        card_id: cardIds,
        type: 0
      }
      params = this.$qs.stringify(params)
      this.cardDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/card/batchRegistrationGW',
        data: params
      }).then((res) => {
        this.cardDisabled = false
        if (res.data.result === 'Sucess') {
          // 关闭弹框
          this.cardDialog = false
          // 刷新列表
          this.getListData()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.cardDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 设备解绑 */
    // 解除网关
    untieSwgClick (id) {
      this.swgId = id
      this.cardId = this.itemId
      this.untieDialog = true
    },
    // 解除卡片
    untieCardClick (id) {
      this.swgId = this.itemId
      this.cardId = id
      this.untieDialog = true
    },
    submitUntieForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        gw_id: this.swgId,
        card_id: this.cardId,
        type: 1
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/card/batchRegistrationGW',
        data: params
      }).then((res) => {
        this.delDisabled = false
        if (res.data.result === 'Sucess') {
          // 隐藏提示框
          this.untieDialog = false
          // 刷新详情
          this.checkDetails(this.itemId, this.itemType)
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.delDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 位置 */
    posClick () {
      this.posDialog = true
      // 清空选中项
      this.checkedPosId = ''
      this.checkedPosName = ''
      // 取消高亮
      this.posHighlight = false
      // 获取数据
      if (this.posTree.length === 0) {
        setTimeout(() => {
          this.getPositionTree()
        }, 100)
      }
    },
    // 获取位置树
    getPositionTree () {
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
          this.posTree = res.data.data1
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
    // 点击树
    posTreeClick (data) {
      // 设置选中id
      this.checkedPosId = data.id
      this.checkedPosName = data.name
      // 设置高亮
      this.posHighlight = true
    },
    // 确定
    selectPos () {
      const checkedPosId = this.checkedPosId || ''
      const checkedPosName = this.checkedPosName || ''
      if (this.addDialog) {
        this.addForm.posName = checkedPosName
        this.addForm.posId = checkedPosId
      } else if (this.comDialog) {
        this.comForm.posName = checkedPosName
        this.comForm.posId = checkedPosId
      }
      this.posDialog = false
    },
    /* 告警推送 */
    warningClick () {
      if (this.crewData.length === 0) {
        // 获取项目人员
        this.getCrewOptions()
      } else {
        // 获取告警人
        this.getLinkman()
      }
      this.crewDialog = true
    },
    // 获取项目人员
    getCrewOptions () {
      let params = {
        organize_id: this.nowOrgid,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewData = res.data.data1.users
          this.ocrewData = res.data.data1.users
          // 获取告警人
          this.getLinkman()
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
    // 获取告警人
    getLinkman () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selDevicePush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const linkman = res.data.data1
          // 获取选中项
          let crewSelected = []
          // 切换选中
          linkman.forEach(linkmanItem => {
            let selectedItem = this.crewData.find(crewItem => {
              return linkmanItem.user_id === crewItem.user_id
            })
            crewSelected.push(selectedItem)
          })
          // 清空选中项
          this.$refs.crewTable.clearSelection()
          crewSelected.forEach(item => {
            this.$refs.crewTable.toggleRowSelection(item)
          })
          this.linkmanSelection = crewSelected
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
    // 获取选中项
    crewSelectionChange (data) {
      this.linkmanSelection = data
    },
    // 添加告警人
    addWarningSend () {
      const selectCrew = this.linkmanSelection
      let uids = []
      selectCrew.forEach(item => {
        uids.push(item.user_id)
      })
      uids = uids.join(',')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        user_ids: uids
      }
      params = this.$qs.stringify(params)
      this.cerwDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/setDevicePush',
        data: params
      }).then((res) => {
        this.cerwDisabled = false
        if (res.data.result === 'Sucess') {
          this.crewDialog = false
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.cerwDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 导入 */
    upClick () {
      this.upDialog = true
      let params = {
        state: 16,
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.sysetApi() + '/upload?' + params
      this.reqUrl = reqUrl
      // 清空导入文件提示
      this.fileList = []
    },
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 关闭导入框
        this.upDialog = false
        // 清空导入文件提示
        this.fileList = []
        // 刷新列表
        this.getListData()
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范！',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件导入失败！',
          type: 'error'
        })
      }
    },
    upFileError () {
      this.$message({
        showClose: true,
        message: '文件导入失败！',
        type: 'error'
      })
    },
    // 下载模板
    downTemplate () {
      let params = {
        filename: 'Device.xls'
      }
      params = this.$qs.stringify(params)
      window.location.href = this.sysetApi() + '/download?filepath=/data/wx365/ExcelIn/&' + params
    },
    /* 导入记录 */
    recordClick () {
      this.$router.push({ path: '/main/facup-record' })
    }
  },
  filters: {
    filterMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  },
  watch: {
    'addForm.type' (nowVal, oldVal) {
      if (nowVal === 'sjwg') {
        this.addPostion = true
      } else {
        this.addPostion = false
        this.addForm.posName = ''
        this.addForm.posId = ''
      }
    },
    'comForm.type' (nowVal, oldVal) {
      if (nowVal === 'sjwg') {
        this.comPostion = true
      } else {
        this.comPostion = false
        this.comForm.posName = ''
        this.comForm.posId = ''
      }
    },
    cardfilter (nowVal, oldVal) {
      this.cardData = this.ocardData.filter(item => (~item.dname.indexOf(nowVal)))
    },
    crewfilter (nowVal, oldVal) {
      this.crewData = this.ocrewData.filter(item => (~item.user_name.indexOf(nowVal)))
    },
    linkmanSelection (newVal, oldVal) {
      if (newVal.length > 0) {
        this.cerwDisabled = false
      } else {
        this.cerwDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.hardfac{
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
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              width: 70px;
              display: inline-block;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align: middle;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
