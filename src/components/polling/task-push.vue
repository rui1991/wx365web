<template>
  <div>
    <el-dialog title="推送设置" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <p class="hint red">
        *任务执行时间结束后任务未完成，将推送给任务执行人和推送人！
      </p>
<!--      <div class="operate">-->
<!--        <el-button type="danger" @click="delClick">清除设置</el-button>-->
<!--      </div>-->
      <div class="list">
        <div class="list-item" v-for="item in listData" :key="item.ogz_id">
          <span class="name">{{ item.ogz_name }}</span>
          <el-input style="width: 400px; margin-right: 20px;" :disabled="true" v-model="item.user_names"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="crewClick(item)">选择人员</el-button>
        </div>
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
/*
* type: 0 新增     1 编辑/删除
* */
import { mapState } from 'vuex'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox3'
export default{
  props: ['parentDialog', 'parentSector'],
  data () {
    return {
      listData: [],
      type: 0,
      secId: 0,
      itemId: 0,
      uids: [],
      crewDialog: false
    }
  },
  created () {

  },
  mounted () {

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
      if (this.listData.length > 0) return
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
        url: this.sysetApi() + '/main/selDutyPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let sectorOptions = this.parentSector || []
          let listData = []
          sectorOptions.forEach(item => {
            let nowItem = resData.find(inItem => {
              return item.base_id === inItem.ogz_id
            })
            if (nowItem !== undefined) {
              listData.push(nowItem)
            } else {
              listData.push({
                'ogz_id': item.base_id,
                'user_ids': '',
                'user_names': '',
                'ogz_name': item.name
              })
            }
          })
          this.listData = listData
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
    crewClick (item) {
      // 组织ID
      this.secId = item.ogz_id
      let userIds = item.user_ids
      let uids = []
      if (item.id) {
        this.type = 1
        this.itemId = item.id
        if (userIds) {
          uids = userIds.split(',').map(item => {
            return Number.parseInt(item)
          })
        }
      } else {
        this.type = 0
      }
      this.uids = uids
      this.crewDialog = true
    },
    crewUpdata (data) {
      let uids = ''
      if (this.type === 0) {
        if (data.ids.length > 0) {
          uids = data.ids.join(',')
          // 新增
          this.addUpdata(uids)
        } else {
          this.crewDialog = false
        }
      } else if (this.type === 1) {
        if (data.ids.length === 0) {
          // 清除
          this.delUpdata()
        } else {
          uids = data.ids.join(',')
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
        ogz_id: this.secId,
        users: uids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/addDutyPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '部门推送人设置成功！',
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
        ogz_id: this.secId,
        id: this.itemId,
        users: uids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/altDutyPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '部门推送人设置成功！',
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
        project_id: this.projectId,
        id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/main/delDutyPush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 获取详情
          this.getDetails()
          this.crewDialog = false
          this.$message({
            showClose: true,
            message: '部门推送人设置成功！',
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
  .list{
    padding-top: 10px;
    .list-item{
      display: flex;
      align-items: center;
      height: 40px;
      margin-bottom: 10px;
      &:last-of-type{
        margin-bottom: 0;
      }
      .name{
        width: 80px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
</style>
