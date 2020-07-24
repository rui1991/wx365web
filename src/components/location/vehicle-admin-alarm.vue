<template>
  <div>
    <el-dialog title="告警推送人设置" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="tableData" style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="organize_name" label="部门"></el-table-column>
        <el-table-column prop="user_names" :show-overflow-tooltip="true" label="告警推送人"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="operate blue" @click="setClick(scope.row)">设置</a>
            <a href="javascript:void(0);" class="operate red" @click="clearClick(scope.row.ogz_id)">清除</a>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 设置 -->
    <el-dialog title="选择人员" :visible.sync="setDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-transfer
        filterable
        ref="myTransfer"
        :filter-method="filterMethod"
        filter-placeholder="请输入人员姓名"
        v-model="checkCrew"
        :props="props"
        :titles="['人员列表', '已选择']"
        :data="crewData">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setCancel">取 消</el-button>
        <el-button type="primary" :disabled="setDisabled" @click="setConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 清除 -->
    <el-dialog title="提示" :visible.sync="clearDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要清除此部门告警推送人？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearCancel">取 消</el-button>
        <el-button type="primary" :disabled="clearDisabled" @click="clearConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/*
* type: 0 设置   1 清除
* */
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      tableData: [],
      sectorId: 0,
      setDialog: false,
      crewData: [],
      props: {
        label: 'user_name',
        key: 'user_id'
      },
      checkCrew: [],
      filterMethod (query, item) {
        return item.user_name.indexOf(query) > -1
      },
      setDisabled: false,
      clearDialog: false,
      clearDisabled: false
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    alarmInit () {
      if (this.tableData.length > 0) return
      this.getAlarmList()
    },
    getAlarmList () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/selGpsCarPushUsers',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1
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
    /* 设置 */
    setClick (data) {
      this.sectorId = data.ogz_id
      this.setDialog = true
      // 已选中人员
      const ids = data.user_ids
      let uids = []
      if (ids) {
        uids = ids.split(',').map(item => {
          return Number.parseInt(item)
        })
      }
      this.checkCrew = uids
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
      if (this.crewData.length > 0) return
      // 获取人员
      this.getCrewData()
    },
    setConfirm () {
      let uids = this.checkCrew.join(',')
      let params = {
        type: 0,
        user_id: this.userId,
        ogz_id: this.sectorId,
        users: uids
      }
      params = this.$qs.stringify(params)
      this.setDisabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsCarPushUsers',
        data: params
      }).then((res) => {
        this.setDisabled = false
        if (res.data.result === 'Sucess') {
          this.setDialog = false
          this.getAlarmList()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.setDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    setCancel () {
      this.setDialog = false
    },
    /* 人员 */
    getCrewData () {
      let params = {
        organize_id: this.projectOrgId,
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
          let crewData = res.data.data1.users
          this.crewData = crewData
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
    /* 清除 */
    clearClick (id) {
      this.sectorId = id
      this.clearDialog = true
    },
    clearConfirm () {
      let params = {
        type: 1,
        user_id: this.userId,
        ogz_id: this.sectorId,
        users: ''
      }
      params = this.$qs.stringify(params)
      this.clearDisabled = true
      this.$axios({
        method: 'post',
        url: this.gpsApi() + '/setGpsCarPushUsers',
        data: params
      }).then((res) => {
        this.clearDisabled = false
        if (res.data.result === 'Sucess') {
          this.clearDialog = false
          this.getAlarmList()
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.clearDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    clearCancel () {
      this.clearDialog = false
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.alarmInit()
      }
    },
    checkCrew (val, oldVal) {
      if (val.length === 0) {
        this.setDisabled = true
      } else {
        this.setDisabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
