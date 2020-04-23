<template>
  <el-dialog title="计划详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-form :model="formData" :label-width="formLabelWidth">
      <el-form-item class="item" label="计划名称">
        <el-input disabled v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item class="item" disabled label="执行组" v-if="formData.group">
        <el-input disabled v-model="formData.group"></el-input>
      </el-form-item>
      <el-form-item class="item" label="执行部门" v-else>
        <el-input disabled v-model="formData.sector"></el-input>
      </el-form-item>
      <el-form-item class="item" label="执行日期">
        <el-input disabled v-model="formData.date"></el-input>
      </el-form-item>
      <el-form-item class="item" label="任务模式">
        <el-input disabled v-model="formData.pattern"></el-input>
      </el-form-item>
      <el-form-item class="item" label="执行频次">
        <el-input disabled v-model="formData.frequency"></el-input>
      </el-form-item>
      <div v-for="item in formData.crews" :key="item.id">
        <el-form-item class="item" label="执行人员">
          <el-input style="width: 200px;" disabled  :value="item.name"></el-input>
        </el-form-item>
      </div>
      <el-form-item class="item" label="周期" v-if="whetherMore">
        <el-input disabled v-model="formData.period"></el-input>
      </el-form-item>
      <div class="times">
        <div class="times-title">执行时段</div>
        <div class="times-item" v-for="item in formData.timeFrame" :key="item.id">
          <div class="nape">
            <span class="nape-title">开始时间</span>
            <el-input style="width: 180px;" disabled :value="item.time"></el-input>
          </div>
          <div class="nape" v-if="!formData.group">
            <span class="nape-title">执行人员</span>
            <el-input style="width: 120px;" disabled v-model="item.crew"></el-input>
          </div>
        </div>
      </div>
    </el-form>
    <ul class="list" v-show="postionData.length > 0">
      <li class="list-item" v-for="item in postionData" :key="item.position_id">
        <span class="name">{{ item.position_name }}</span>
        <span class="price" v-if="item.os_ids">{{ item.os_names }}</span>
        <span class="hint" v-else>无关联标准模板</span>
      </li>
    </ul>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        project: '',
        sector: '',
        group: '',
        date: '',
        startDate: '',
        endDate: '',
        pattern: '',
        frequency: '',
        crews: [],
        period: '',
        timeFrame: [],
        order: ''
      },
      whetherMore: false,
      postionData: []
    }
  },
  created () {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    detInit () {
      this.formData = {
        name: '',
        project: '',
        sector: '',
        group: '',
        date: '',
        endDate: '',
        pattern: '',
        frequency: '',
        crews: [],
        period: '',
        timeFrame: [],
        order: ''
      }
      this.whetherMore = false
      this.postionData = []
      this.getDetails()
    },
    // 查看详情
    getDetails () {
      let params = {
        // company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.parentPro,
        plan_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/selInsOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 计划名称
          this.formData.name = itemData.plan_name
          // 所属项目
          this.formData.project = this.nowProname
          // 操作角色
          this.formData.sector = itemData.ogz_name || ''
          // 操作组
          this.formData.group = itemData.group_name || ''
          // 执行日期
          const startData = itemData.start_date
          const endData = itemData.end_date
          this.formData.date = startData + ' 至 ' + endData
          // 任务模式
          const patternNum = itemData.plan_model
          let pattern = ''
          // 频次
          let frequency = ''
          // 是否一天多次
          let whetherMore = false
          if (patternNum === 0) {
            pattern = '循环任务'
            // 频率
            const freNum = itemData.frequency
            // 单位
            const unit = itemData.unit
            // 次数
            const degree = itemData.frequency1
            frequency = freNum + unit + degree + '次'
            // 是否一天多次
            if (freNum === 1 && unit === '天') {
              whetherMore = true
            }
          } else if (patternNum === 1) {
            pattern = '单次任务'
          }
          this.formData.pattern = pattern
          // 频次
          this.formData.frequency = frequency
          // 是否一天多次
          this.whetherMore = whetherMore
          // 人员
          const crewData = itemData.users
          let crews = []
          if (!whetherMore) {
            crewData.forEach((item, index) => {
              crews.push(
                {
                  id: index,
                  name: item.user_name
                }
              )
            })
          }
          this.formData.crews = crews
          // 周期
          let periodNum = itemData.cycle
          if (periodNum) {
            periodNum = periodNum.split('/')
          } else {
            periodNum = []
          }
          const periodAry = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
          let period = []
          periodNum.forEach(item => {
            let num = parseInt(item)
            period.push(periodAry[num])
          })
          period = period.join('、')
          this.formData.period = period
          // 时段
          let timeFrame = []
          let times = itemData.times
          times = times.split('/')
          times.forEach((item, index) => {
            const timeFrameItem = {
              id: index,
              time: item,
              crew: crewData[index].user_name
            }
            timeFrame.push(timeFrameItem)
          })
          this.formData.timeFrame = timeFrame
          // 点位顺序
          const orderNum = itemData.po_desc
          let order = ''
          if (orderNum === 0) {
            order = '随机顺序'
          } else if (orderNum === 1) {
            order = '固定顺序'
          }
          this.formData.order = order
          // 点位
          let position = itemData.positions
          position = position.join(',')
          this.formData.posData = []
          this.getPosData(position)
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
    // 地址
    getPosData (ids) {
      let params = {
        project_id: this.parentPro,
        position_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsSetPositionsTemplate',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.postionData = res.data.data1
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
        // 初始化数据
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .large-dialog{
    .el-dialog__body{
      max-height: 480px;
      overflow: auto;
      .times{
        padding-bottom: 20px;
        .times-title{
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100px;
          height: 40px;
        }
        .times-item {
          display: flex;
          align-items: center;
          height: 50px;
          padding-left: 100px;
          padding-bottom: 10px;
          .nape{
            display: flex;
            align-items: center;
            height: 40px;
            margin-right: 20px;
            .nape-title{
              padding-right: 5px;
            }
          }
        }
      }
      .list{
        border: 1px solid #cecece;
        padding: 10px;
        border-radius: 4px;
        .list-item{
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          border-bottom: 1px solid #cecece;
          &:last-of-type{
            border-bottom: none;
          }
          .name{
            max-width: 40%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            color: #272727;
          }
          .price{
            max-width: 60%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            color: #272727;
          }
          .hint{
            color: #999999;
          }
        }
      }
    }
  }
</style>
