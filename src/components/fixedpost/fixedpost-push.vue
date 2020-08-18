<template>
  <div>
    <el-dialog title="打卡详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog" class="fixedpost-rep">
      <p class="hint red">
        *打卡时间结束后未打卡，将推送给推送人！
      </p>
      <div class="content">
        <span class="name">推送人</span>
        <el-input style="width: 380px; margin-right: 20px;" :disabled="true" v-model="unames"></el-input>
        <el-button type="primary" style="vertical-align: top;" @click="crewClick">选择人员</el-button>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentOrgid="projectOrgId"
      :parentIds="uids"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox3'
export default{
  props: ['parentDialog'],
  data () {
    return {
      type: 0,
      unames: '',
      uids: [],
      crewDialog: false
    }
  },
  created () {

  },
  components: {
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 初始化数据
    pushInit () {
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/selPerPushSet',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1 || []
          if (resData.length > 0) {
            this.unames = resData[0].user_names
            let uidStr = resData[0].user_ids
            let uidArr = []
            if (uidStr) {
              uidArr = uidStr.split(',')
            }
            let uids = uidArr.map(item => {
              return Number.parseInt(item)
            })
            this.uids = uids
          } else {
            this.unames = ''
            this.uids = []
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
    /* 人员 */
    crewClick () {
      if (this.uids.length > 0) {
        this.type = 1
      } else {
        this.type = 0
      }
      this.crewDialog = true
    },
    crewUpdata (data) {
      let uids = ''
      if (data.ids.length > 0) {
        uids = data.ids.join(',')
      }
      if (this.type === 0) {
        // 新增
        this.addUpdata(uids)
      } else if (this.type === 1) {
        if (data.ids.length === 0) {
          // 清除
          this.delUpdata()
        } else {
          // 编辑
          this.comUpdata(uids)
        }
      }
    },
    crewCancel () {
      this.crewDialog = false
    },
    /* 新增 */
    addUpdata (uids) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        users: uids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/perPushSet',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '项目推送人设置成功！',
            type: 'success'
          })
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
    comUpdata (uids) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        users: uids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/altPerPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '项目推送人设置成功！',
            type: 'success'
          })
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
    /* 删除 */
    delUpdata () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/delPerPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '项目推送人设置成功！',
            type: 'success'
          })
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
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.pushInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .hint{
    height: 35px;
    line-height: 35px;
  }
  .content{
    padding-top: 10px;
    display: flex;
    align-items: center;
    height: 40px;
    margin-bottom: 10px;
    .name{
      width: 60px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
</style>
