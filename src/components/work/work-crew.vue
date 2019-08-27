<template>
  <el-dialog title="选择人员" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-input placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model="crewfilter" style="width: 40%; margin-bottom: 10px;"></el-input>
    <el-table class="select-table" :data="crewOptions" style="width: 100%" max-height="360">
      <el-table-column label="" width="65">
        <template slot-scope="scope">
          <el-radio v-model="crewId" :label="scope.row.user_id">&nbsp;&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="姓名"></el-table-column>
      <el-table-column prop="user_phone" label="联系方式"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      crewState: false,
      crewOptions: [],
      ocrewOptions: [],
      crewfilter: '',
      crewId: '',
      disabled: true
    }
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
    crewInit () {
      this.crewfilter = ''
      this.crewId = ''
      if (!this.crewState) {
        this.getCrewOptions()
      }
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
          let crewData = res.data.data1.users
          this.crewOptions = crewData
          this.ocrewOptions = crewData
          this.crewState = true
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
    // 确定
    confirmClick () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        projectN_id: this.nowProid,
        userN_id: this.crewId,
        wo_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/wo/sendWO',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '派单成功',
            type: 'success'
          })
          // 刷新列表
          this.$emit('parentUpdata')
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
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.crewInit()
      }
    },
    crewfilter (val, oldVal) {
      this.crewOptions = this.ocrewOptions.filter(item => (~item.user_name.indexOf(val)))
    },
    crewId (val, oldVal) {
      if (val) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.work-item{
  .paging{
    margin-top: 20px;
  }
}
</style>
