<template>
  <div class="fixedpost-set">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/fixedpost">固定岗管理</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>固定岗设置</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="岗位地址" width="160">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="checkDetails(scope.row.message)">{{ scope.row.position_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="时间段" class-name="multi-row">
            <template slot-scope="scope">
              <span>{{ scope.row.message | filterTimeFrame }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.position_id, scope.row.message)">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.position_id)">删除</a>
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
    <!-- 编辑 -->
    <el-dialog title="编辑打卡规则" :visible.sync="comDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <div style="margin-bottom: 10px; text-align: right;">
        <el-button type="primary" @click="addTime">添加时段</el-button>
      </div>
      <el-form :model="comForm" :rules="rules" ref="ruleComForm" :label-width="formLabelWidth">
        <el-form-item label="时间段" required v-for="(item, index) in comForm.times" :key="index">
          <el-col :span="14">
            <el-form-item prop="time" style="width: 240px;">
              <el-time-picker
                style="width: 240px;"
                is-range
                arrow-control
                v-model="item.time"
                :clearable="false"
                value-format="HH:mm"
                format="HH:mm"
                :time-arrow-control="true"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择时间范围">
              </el-time-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="frequency">
              <el-input v-model.number="item.frequency" auto-complete="off" type="number">
                <template slot="append">次</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" style="text-align: right; font-size: 20px;"><i class="el-icon-delete red" style="cursor: pointer;" @click="delTime(index)"></i></el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetComForm('ruleComForm')">取 消</el-button>
        <el-button type="primary" :disabled="comDisabled" @click="submitComForm('ruleComForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog title="规则详情" :visible.sync="detDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-table class="select-table" :data="detData" stripe style="width: 100%" max-height="420">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="start_time" label="开始时间"></el-table-column>
        <el-table-column prop="end_time" label="结束时间"></el-table-column>
        <el-table-column label="打卡次数">
          <template slot-scope="scope">
            <span>1</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detDialog = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
      <p class="hint-text"><i class="el-icon-warning"></i>是否要删除固定岗位设置？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" :disabled="delDisabled" @click="submitDelForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'fixedpostSet',
  data () {
    return {
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: '',
      formLabelWidth: '100px',
      rules: {
        // time: [
        // ]
        // frequency: [
        //   { required: true, validator: checkFrequency, trigger: 'blur' }
        // ]
      },
      comForm: {
        times: []
      },
      comDialog: false,
      comDisabled: false,
      detDialog: false,
      detData: [],
      delDialog: false,
      delDisabled: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', true)
    // 查询列表数据
    this.getListData()
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        companyName: state => state.info.companyName,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/selPermanentSet',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.sp
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
    /* 岗位详情 */
    checkDetails (timeStr) {
      this.detDialog = true
      const times = JSON.parse(timeStr)
      let detData = []
      times.forEach(item => {
        const time = item.time.split('-')
        const detItem = this.proTimeDet(time[0], time[1], item.frequency)
        detData = detData.concat(detItem)
      })
      this.detData = detData
    },
    /* 处理时间段 */
    proTimeDet (time1, time2, count) {
      // 开始时间
      const startTime = this.proTimeSecond(time1)
      // 结束时间
      const endTime = this.proTimeSecond(time2)
      // 单位时间
      const unitTime = Math.round((endTime - startTime) / count)
      // 时间段
      let timeNodes = []
      for (let i = 0; i < count; i++) {
        let startNode = startTime + unitTime * i
        startNode = this.formatTimeNode(startNode)
        let endNode = startTime + unitTime * (i + 1)
        endNode = this.formatTimeNode(endNode)
        timeNodes.push(
          {
            start_time: startNode,
            end_time: endNode
          }
        )
      }
      return timeNodes
    },
    /* 编辑时间段 */
    comClick (id, timeStr) {
      this.itemId = id
      this.comDialog = true
      const times = this.formatTimes(timeStr)
      this.comForm.times = times
    },
    formatTimes (str) {
      if (!str) { return [] }
      const timeData = JSON.parse(str)
      let times = []
      timeData.forEach(item => {
        times.push(
          {
            time: item.time.split('-'),
            frequency: item.frequency
          }
        )
      })
      return times
    },
    // 添加时段
    addTime () {
      this.comForm.times.push(
        {
          time: ['00:00', '23:59'],
          frequency: 1
        }
      )
    },
    // 删除时段
    delTime (index) {
      this.comForm.times.splice(index, 1)
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
      this.comDialog = false
    },
    // 提交
    sendComRequest () {
      // 全部时段
      const allData = this.comForm.times
      if (allData.length === 0) {
        this.$message({
          showClose: true,
          message: '请添加时段！',
          type: 'warning'
        })
        return
      }
      let allTime = []
      let detData = []
      allData.forEach(item => {
        let frequency = Number.parseInt(item.frequency)
        if (frequency <= 0) {
          frequency = 1
        }
        const detItem = this.proTimeNode(item.time[0], item.time[1], frequency)
        detData = detData.concat(detItem)
        allTime.push(
          {
            time: item.time[0] + '-' + item.time[1],
            frequency: frequency
          }
        )
      })
      allTime = JSON.stringify(allTime)
      const detTime = detData.join('/')
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.itemId,
        all: allTime,
        det: detTime
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/setPermanentPosition',
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
    /* 处理时间段 */
    proTimeNode (time1, time2, count) {
      // 开始时间
      const startTime = this.proTimeSecond(time1)
      // 结束时间
      const endTime = this.proTimeSecond(time2)
      // 单位时间
      const unitTime = Math.round((endTime - startTime) / count)
      // 时间段
      let timeNodes = []
      for (let i = 0; i < count; i++) {
        let startNode = startTime + unitTime * i
        startNode = this.formatTimeNode(startNode)
        let endNode = startTime + unitTime * (i + 1)
        endNode = this.formatTimeNode(endNode)
        let nodeItem = startNode + '-' + endNode
        timeNodes.push(nodeItem)
      }
      return timeNodes
    },
    /* 格式化秒数 */
    proTimeSecond (time) {
      const timeArr = time.split(':')
      const minute = Number.parseInt(timeArr[0])
      const second = Number.parseInt(timeArr[1])
      return minute * 60 + second
    },
    /* 格式化时间 */
    formatTimeNode (time) {
      let minute = Number.parseInt(time / 60) + ''
      if (minute === '24') {
        return '23:59'
      }
      minute = minute.padStart(2, '0')
      let second = time % 60 + ''
      second = second.padStart(2, '0')
      return minute + ':' + second
    },
    /* 删除 */
    delClick (id) {
      this.delDialog = true
      this.itemId = id
    },
    submitDelForm () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.itemId
      }
      params = this.$qs.stringify(params)
      this.delDisabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v1.0/delPermanentPosition',
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
    }
  },
  filters: {
    filterTimeFrame (str) {
      if (!str) { return '' }
      const timeData = JSON.parse(str)
      let timeStr = ''
      timeData.forEach(item => {
        timeStr += item.time + '，' + item.frequency + '次； '
      })
      return timeStr
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.$store.commit('setProDisabled', false)
  }
}
</script>

<style lang="less" scoped>
.fixedpost-set{
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
    }
  }
}
</style>
