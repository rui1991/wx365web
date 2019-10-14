<template>
  <div>
    <el-dialog title="详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <h5 class="form-title">异常详情</h5>
      <el-form :model="formData" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece;">
        <div class="two-form">
          <el-form-item class="item" label="项目名称">
            <el-input :disabled="true" v-model="formData.proName"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行时间">
            <el-input :disabled="true" v-model="formData.exeTime"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="巡检地址">
            <el-input :disabled="true" v-model="formData.site"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行人">
            <el-input :disabled="true" v-model="formData.executor"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="检查项">
            <el-input :disabled="true" v-model="formData.checkItem"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行结果">
            <el-input :disabled="true" v-model="formData.exeResult"></el-input>
          </el-form-item>
        </div>
        <el-form-item class="one-form" label="检查要求">
          <el-input type="textarea" :disabled="true" v-model="formData.exaContent"></el-input>
        </el-form-item>
        <el-form-item class="one-form" label="备注">
          <el-input type="textarea" :disabled="true" v-model="formData.remark"></el-input>
        </el-form-item>
      </el-form>
      <h5 class="form-title">工单详情</h5>
      <el-form :model="formData" :label-width="formLabelWidth" style="border-bottom: 1px solid #cecece; margin-bottom: 20px;">
        <div class="two-form">
          <el-form-item class="item" label="标题">
            <el-input :disabled="true" v-model="formData.workTitle"></el-input>
          </el-form-item>
          <el-form-item class="item" label="创建人">
            <el-input :disabled="true" v-model="formData.crePerson"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="创建时间">
            <el-input :disabled="true" v-model="formData.creTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="当前处理人">
            <el-input :disabled="true" v-model="formData.nowPerson"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="最后处理时间">
            <el-input :disabled="true" v-model="formData.lastTime"></el-input>
          </el-form-item>
          <el-form-item class="item" label="完成状态">
            <el-input :disabled="true" v-model="formData.finishState"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-table class="select-table" :data="formData.logData" style="width: 100%;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="type" width="100" label="操作类型"></el-table-column>
        <el-table-column prop="perform_user_name" width="80" label="执行人"></el-table-column>
        <el-table-column label="执行时间">
          <template slot-scope="scope">
            <span>{{ scope.row.perform_time | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="说明"></el-table-column>
        <el-table-column width="100" label="图片">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="com" v-if="scope.row.photo" @click="checkImg(scope.row.photo)">查看</a>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 显示图片 -->
    <img-module
      :parentDialog="imgDialog"
      :parentImgurl="imgUrl"
      @parentClose="imgClose">
    </img-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入显示图片组件
import imgModule from '@/components/public/show-img'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        proName: '',
        exeTime: '',
        site: '',
        executor: '',
        checkItem: '',
        exeResult: '',
        exaContent: '',
        remark: '',
        workTitle: '',
        crePerson: '',
        creTime: '',
        nowPerson: '',
        lastTime: '',
        finishState: '',
        logData: []
      },
      imgDialog: false,
      imgUrl: ''
    }
  },
  components: {
    imgModule
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
    detInit () {
      this.formData = {
        proName: '',
        exeTime: '',
        site: '',
        executor: '',
        checkItem: '',
        exeResult: '',
        exaContent: '',
        remark: '',
        workTitle: '',
        crePerson: '',
        creTime: '',
        nowPerson: '',
        lastTime: '',
        finishState: '',
        logData: []
      }
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        isd_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsAbnormalOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 项目名称
          const proName = itemData.abMap.project_name
          // 执行时间
          const exeTime = this.$common.formatDate(itemData.abMap.modification_time)
          // 巡检地址
          const site = itemData.abMap.position_name
          // 执行人
          const executor = itemData.abMap.user_name || ''
          // 检查项
          const checkItem = itemData.abMap.ins_name || ''
          // 执行结果
          const resultState = itemData.abMap.task_state
          let exeResult = ''
          if (resultState === 0) {
            exeResult = '未巡查'
          } else if (resultState === 1) {
            exeResult = '正常'
          } else if (resultState === 2) {
            exeResult = '异常'
          }
          // 检查内容及要求
          const exaContent = itemData.abMap.check_content || ''
          // 备注
          const remark = itemData.abMap.note || ''
          // 标题
          const workTitle = itemData.woMap.wo_name || ''
          // 创建人
          const crePerson = itemData.woMap.create_user_name || ''
          // 创建时间
          const creTime = this.$common.formatDate(itemData.woMap.create_time)
          // 处理人
          const nowPerson = itemData.woMap.accept_user_name || ''
          // 最后处理时间
          const lastTime = itemData.woMap.last_time
          // 完成状态
          const finishNum = itemData.woMap.wo_state || ''
          let finishState = ''
          if (finishNum === 0) {
            finishState = '待处理'
          } else if (finishNum === 1) {
            finishState = '处理中'
          } else if (finishNum === 2) {
            finishState = '已完成'
          }
          // 日志
          let logData = itemData.woMap.wo_log || []
          this.formData = {
            proName: proName,
            exeTime: exeTime,
            site: site,
            executor: executor,
            checkItem: checkItem,
            exeResult: exeResult,
            exaContent: exaContent,
            remark: remark,
            workTitle: workTitle,
            crePerson: crePerson,
            creTime: creTime,
            nowPerson: nowPerson,
            lastTime: lastTime,
            finishState: finishState,
            logData: logData
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
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    },
    // 查看图片
    checkImg (url) {
      this.imgUrl = this.sysetApi() + '/showImage?state=10&filename=' + url
      this.imgDialog = true
    },
    imgClose () {
      this.imgDialog = false
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
