<template>
  <div
    class="home"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="module-container">
      <div class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="module-main">
        <div class="search">
          <span>组织机构</span>
          <el-input style="width: 240px; margin-left: 10px; margin-right: 20px;" :disabled="true" v-model="orgName"></el-input>
          <el-button type="primary" @click="orgDialog = true">选择组织</el-button>
          <div class="track">
            <el-button type="primary" @click="clickTrack" v-if="roleId === 500">人员轨迹</el-button>
          </div>
        </div>
        <div class="pandect" :class="{ clickable: switchType !== 1 }" @click="skipSurvey">
          <h3 class="pandect-title">
            <span class="chunk"></span>
            <span class="txt">{{ pandectTitle }}</span>
            <span class="sign">今天</span>
          </h3>
          <div class="pandect-content">
            <p class="pandect-item" v-show="switchType === 1">上线项目：{{ pandectData.projectNum }}个</p>
            <p class="pandect-item" v-show="switchType !== 3">地址设备：{{ pandectData.siteFac }}个</p>
            <p class="pandect-item">人员数量：{{ pandectData.crewNum }}人</p>
            <p class="pandect-item">采集设备：{{ pandectData.gatherFac }}个</p>
            <p class="pandect-item" v-show="switchType !== 3">地址数量：{{ pandectData.siteNum }}个</p>
            <p class="pandect-item" v-show="switchType !== 3">网关设备：{{ pandectData.gatewayFac }}个</p>
            <p class="pandect-item green">在线人数：{{ pandectData.onlineCrew }}人</p>
            <p class="pandect-item green">在线设备：{{ pandectData.onlineFac }}个</p>
            <p class="pandect-item red">离线人数：{{ pandectData.offlineCrew }}人</p>
            <p class="pandect-item red">离线设备：{{ pandectData.offlineFac }}个</p>
          </div>
        </div>
        <div class="survey">
          <el-row :gutter="10" style="margin-bottom: 10px;">
            <el-col :span="12">
              <div class="item" :class="{ clickable: switchType !== 1 }" @click="skipTask">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">巡检巡查任务</p>
                  <span class="sign">今天</span>
                </div>
                <div class="item-content">
                  <div class="chart">
                    <Chart :parOption="taskOption" id="home_task" :domWidth="domWidth"></Chart>
                  </div>
                  <div class="describe">
                    <div class="details">
                      <p class="single">巡检任务数量：{{ task.taskAll }}条</p>
                      <p class="single green">任务完成数：{{ task.finish }}条</p>
                      <p class="single red">任务未完成数：{{ task.unfinished }}条</p>
                      <p class="single">任务完成率：{{ task.finishRate }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="item" :class="{ clickable: switchType !== 1 }" @click="skipQuality">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">品质监控（人员/位置）</p>
                  <span class="sign">今天</span>
                </div>
                <div class="item-content">
                  <div class="chart">
                    <Chart :parOption="qualityOption" id="home_quality" :domWidth="domWidth"></Chart>
                  </div>
                  <div class="describe">
                    <div class="details">
                      <p class="single green">已打卡人数：{{ quality.clock }}人</p>
                      <p class="single red">未打卡人数：{{ quality.noclock }}人</p>
                      <p class="single">已巡查位置数：{{ quality.examine }}个</p>
                      <p class="single red">未巡查位置数：{{ quality.noexamine }}个</p>
                      <p class="single">打卡上传数量：{{ quality.uploading }}条</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="item" :class="{ clickable: switchType !== 1 }" @click="skipCallname">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">点名管理</p>
                  <span class="sign old">昨天</span>
                </div>
                <div class="item-content">
                  <div class="chart">
                    <Chart :parOption="callnameOption" id="home_callname" :domWidth="domWidth"></Chart>
                  </div>
                  <div class="describe">
                    <div class="details">
                      <p class="single">点名人数：{{ callname.allNum }}个</p>
                      <p class="single green">点名成功人数：{{ callname.sucNum }}个</p>
                      <p class="single red">点名失败人数：{{ callname.faiNum }}个</p>
                      <p class="single">人员打卡率：{{ callname.clockRate }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12" v-show="switchType !== 3">
              <div class="item" :class="{ clickable: switchType !== 1 }" @click="skipFixation">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">固定岗管理</p>
                  <span class="sign">今天</span>
                </div>
                <div class="item-content">
                  <div class="chart">
                    <Chart :parOption="fixationOption" id="home_fixation" :domWidth="domWidth"></Chart>
                  </div>
                  <div class="describe">
                    <div class="details">
                      <p class="single">需打卡次数：{{ fixation.allNum }}次</p>
                      <p class="single green">打卡成功次数：{{ fixation.sucNum }}次</p>
                      <p class="single red">未打卡次数：{{ fixation.notNum }}次</p>
                      <p class="single red">打卡异常数：{{ fixation.abnNum }}次</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 选择组织机构 -->
    <org-module
      :parentDialog="orgDialog"
      :parentId="orgId"
      @parentUpdata="orgUpdata"
      @parentCancel="orgCancel">
    </org-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入组织组件
import orgModule from '@/components/profile/home-org'
// 引入chart
import Chart from '@/components/public/chart'

/*
* 参数说明：
*   switchType：用于控制模块切换
*     1：企业（黑卡，企业，分公司）
*     2：项目
*     3：部门
* */

export default{
  name: 'home',
  data () {
    return {
      orgDialog: false,
      switchType: 1,
      orgName: '',
      orgId: '',
      baseId: 0,
      pandectTitle: '',
      pandectData: {
        projectNum: 0,
        siteFac: 0,
        crewNum: 0,
        gatherFac: 0,
        siteNum: 0,
        gatewayFac: 0,
        onlineCrew: 0,
        onlineFac: 0,
        offlineCrew: 0,
        offlineFac: 0
      },
      task: {
        taskAll: 0,
        finish: 0,
        unfinished: 0,
        finishRate: '0%'
      },
      taskOption: {
        title: {
          text: '',
          x: 'center',
          y: 'bottom',
          // bottom: '5px',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bolder',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '巡检巡查任务',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#44bd8a', '#d8d8d8']
      },
      quality: {
        clock: 0,
        noclock: 0,
        examine: 0,
        noexamine: 0,
        uploading: 0
      },
      qualityOption: {
        title: {
          text: '',
          x: 'center',
          y: 'bottom',
          // bottom: '5px',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bolder',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '工单统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#62a8e8', '#d8d8d8']
      },
      callname: {
        allNum: 0,
        sucNum: 0,
        faiNum: 0,
        clockRate: '0%'
      },
      callnameOption: {
        title: {
          text: '',
          x: 'center',
          y: 'bottom',
          // bottom: '5px',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bolder',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '点名管理统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#44bd8a', '#d8d8d8']
      },
      fixation: {
        allNum: 0,
        sucNum: 0,
        notNum: 0,
        abnNum: 0
      },
      fixationOption: {
        title: {
          text: '',
          x: 'center',
          y: 'bottom',
          // bottom: '5px',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bolder',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '固定岗打卡统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#62a8e8', '#44bd8a', '#d8d8d8']
      },
      domWidth: this.$common.getDomClientSize().width,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    // 监控窗口变化
    window.onresize = () => {
      const domWidth = this.$common.getDomClientSize().width
      this.domWidth = domWidth
    }
    // 默认初始化显示最高权限
    let orgNode = []
    if (this.orgTree[0].organize_type === 0) {
      orgNode = this.orgTree[0].children[0]
    } else {
      orgNode = this.orgTree[0]
    }
    this.orgId = orgNode.id
    this.orgName = orgNode.name
    this.baseId = orgNode.base_id
    const orgType = orgNode.organize_type
    switch (orgType) {
      // case 0:
      //   this.switchType = 1
      //   this.pandectTitle = '企业/分公司信息'
      //   this.getCompanyData()
      //   break
      case 1:
        this.switchType = 1
        this.pandectTitle = '企业/分公司信息'
        this.getCompanyData()
        break
      case 2:
        this.switchType = 1
        this.pandectTitle = '企业/分公司信息'
        this.getCompanyData()
        break
      case 3:
        this.switchType = 2
        this.pandectTitle = '项目信息'
        this.getProjectData()
        break
      case 4:
        this.switchType = 3
        this.pandectTitle = '部门信息'
        this.getSectorData()
        break
    }
  },
  components: {
    orgModule,
    Chart
  },
  computed: {
    ...mapState('user', [
      'userId',
      'roleId',
      'userPhone'
    ]),
    ...mapState('other', [
      'orgTree'
    ])
  },
  methods: {
    /* 选择组织 */
    orgUpdata (data) {
      this.orgDialog = false
      this.orgId = data.id
      this.orgName = data.name
      this.baseId = data.baseId
      const type = data.type
      // 获取数据
      switch (type) {
        case 0:
          this.switchType = 1
          this.pandectTitle = '企业/分公司信息'
          this.getCompanyData()
          break
        case 1:
          this.switchType = 1
          this.pandectTitle = '企业/分公司信息'
          this.getCompanyData()
          break
        case 2:
          this.switchType = 1
          this.pandectTitle = '企业/分公司信息'
          this.getCompanyData()
          break
        case 3:
          this.switchType = 2
          this.pandectTitle = '项目信息'
          this.getProjectData()
          break
        case 4:
          this.switchType = 3
          this.pandectTitle = '部门信息'
          this.getSectorData()
          break
      }
    },
    orgCancel () {
      this.orgDialog = false
    },
    // 企业
    getCompanyData () {
      let params = {
        company_id: this.baseId,
        type: 1
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/selComOperateMes',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const homeData = res.data.data1
          /* 概况 */
          // poMacSize
          this.pandectData = {
            projectNum: homeData.comBaseMes.proSize || 0,
            siteFac: homeData.comBaseMes.poMacSize || 0,
            crewNum: homeData.comBaseMes.userSize || 0,
            gatherFac: homeData.comBaseMes.bindCardSize || 0,
            siteNum: homeData.comBaseMes.poSize || 0,
            gatewayFac: homeData.comBaseMes.gwSize || 0,
            onlineCrew: homeData.comBaseMes.onlineUserSize || 0,
            onlineFac: homeData.comBaseMes.offlineDeviceSize || 0,
            offlineCrew: homeData.comBaseMes.offlineUserSize || 0,
            offlineFac: homeData.comBaseMes.onlineDeviceSize || 0
          }
          /* 巡检巡查任务 */
          const taskAll = homeData.comInsDutyMes.insDutySize || 0
          // 已完成任务
          const taskFinish = homeData.comInsDutyMes.continueInsDutySize || 0
          // 未完成任务
          const taskUndone = homeData.comInsDutyMes.notContinueInsDutySize || 0
          // 完成率
          const taskFinishRate = this.$common.countPercent(taskFinish, taskAll)
          this.task = {
            taskAll: taskAll,
            finish: taskFinish,
            unfinished: taskUndone,
            finishRate: taskFinishRate
          }
          this.taskOption.title.text = '任务完成百分比'
          const taskChart = [
            {value: taskFinish, name: '已完成'},
            {value: taskUndone, name: '未完成'}
          ]
          this.taskOption.series[0].data = taskChart
          /* 品质监控（人员/位置） */
          // 已打卡人数
          const qualityClock = homeData.comQualityMes.alreadyRecordUserSize || 0
          // 未打卡人数
          const qualityNoclock = homeData.comQualityMes.notRecordUserSize || 0
          // 已巡查位置数
          const qualityExamine = homeData.comQualityMes.alreadyRecordUserSize || 0
          // 未巡查位置数
          const qualityNoexamine = homeData.comQualityMes.notRecordUserSize || 0
          // 打卡上传数量
          const qualityUploading = homeData.comQualityMes.notRecordUserSize || 0
          this.quality = {
            clock: qualityClock,
            noclock: qualityNoclock,
            examine: qualityExamine,
            noexamine: qualityNoexamine,
            uploading: qualityUploading
          }
          this.qualityOption.title.text = '位置巡查数百分比'
          const qualityChart = [
            {value: qualityExamine, name: '已巡查'},
            {value: qualityNoexamine, name: '未巡查'}
          ]
          this.qualityOption.series[0].data = qualityChart

          /* 点名管理 */
          // 点名人数
          const callnameAll = homeData.comRollcollMes.rollcallUserSize || 0
          // 点名成功人数
          const callnameSucceed = homeData.comRollcollMes.rollcallSucessUserSize || 0
          // 点名失败人数
          const callnameFailed = homeData.comRollcollMes.rollcallFailedUserSize || 0
          // 人员打卡率
          const callnameSucRate = this.$common.countPercent(callnameSucceed, callnameAll)
          this.callname = {
            allNum: callnameAll,
            sucNum: callnameSucceed,
            faiNum: callnameFailed,
            clockRate: callnameSucRate
          }
          this.callnameOption.title.text = '点名成功百分比'
          const callnameChart = [
            {value: callnameSucceed, name: '成功'},
            {value: callnameFailed, name: '失败'}
          ]
          this.callnameOption.series[0].data = callnameChart

          /* 固定岗管理 */
          // 需打卡次数
          const fixationAll = homeData.comPermanentMes.mustPerRecordSize || 0
          // 打卡成功次数
          const fixationSucceed = homeData.comPermanentMes.mustPerRecordSize || 0
          // 未打卡次数
          const fixationNot = homeData.comPermanentMes.mustPerRecordSize || 0
          // 打卡异常次数
          const fixationAbnormal = homeData.comPermanentMes.mustPerRecordSize || 0
          this.fixation = {
            allNum: fixationAll,
            sucNum: fixationSucceed,
            notNum: fixationNot,
            abnNum: fixationAbnormal
          }
          this.fixationOption.title.text = '打卡次数百分比'
          const fixationChart = [
            {value: fixationSucceed, name: '已打卡'},
            {value: fixationNot, name: '未打卡'},
            {value: fixationAbnormal, name: '异常'}
          ]
          this.fixationOption.series[0].data = fixationChart
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 项目
    getProjectData () {
      let params = {
        project_id: this.baseId,
        type: 1
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/selProOperateMes',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const homeData = res.data.data1
          /* 概况 */
          this.pandectData = {
            projectNum: 0,
            siteFac: homeData.proBaseMes.poMacSize || 0,
            crewNum: homeData.proBaseMes.userSize || 0,
            gatherFac: homeData.proBaseMes.bindCardSize || 0,
            siteNum: homeData.proBaseMes.poSize || 0,
            gatewayFac: homeData.proBaseMes.gwSize || 0,
            onlineCrew: homeData.proBaseMes.onlineUserSize || 0,
            onlineFac: homeData.proBaseMes.offlineDeviceSize || 0,
            offlineCrew: homeData.proBaseMes.offlineUserSize || 0,
            offlineFac: homeData.proBaseMes.onlineDeviceSize || 0
          }
          /* 巡检巡查任务 */
          const taskAll = homeData.proInsDutyMes.insDutySize || 0
          // 已完成任务
          const taskFinish = homeData.proInsDutyMes.continueInsDutySize || 0
          // 未完成任务
          const taskUndone = homeData.proInsDutyMes.notContinueInsDutySize || 0
          // 完成率
          const taskFinishRate = this.$common.countPercent(taskFinish, taskAll)
          this.task = {
            taskAll: taskAll,
            finish: taskFinish,
            unfinished: taskUndone,
            finishRate: taskFinishRate
          }
          this.taskOption.title.text = '任务完成百分比'
          const taskChart = [
            {value: taskFinish, name: '已完成'},
            {value: taskUndone, name: '未完成'}
          ]
          this.taskOption.series[0].data = taskChart
          /* 品质监控（人员/位置） */
          // 已打卡人数
          const qualityClock = homeData.proQualityMes.alreadyRecordUserSize || 0
          // 未打卡人数
          const qualityNoclock = homeData.proQualityMes.notRecordUserSize || 0
          // 已巡查位置数
          const qualityExamine = homeData.proQualityMes.alreadyRecordUserSize || 0
          // 未巡查位置数
          const qualityNoexamine = homeData.proQualityMes.notRecordUserSize || 0
          // 打卡上传数量
          const qualityUploading = homeData.proQualityMes.notRecordUserSize || 0
          this.quality = {
            clock: qualityClock,
            noclock: qualityNoclock,
            examine: qualityExamine,
            noexamine: qualityNoexamine,
            uploading: qualityUploading
          }
          this.qualityOption.title.text = '位置巡查数百分比'
          const qualityChart = [
            {value: qualityExamine, name: '已巡查'},
            {value: qualityNoexamine, name: '未巡查'}
          ]
          this.qualityOption.series[0].data = qualityChart

          /* 点名管理 */
          // 点名人数
          const callnameAll = homeData.proRollcollMes.rollcallUserSize || 0
          // 点名成功人数
          const callnameSucceed = homeData.proRollcollMes.rollcallSucessUserSize || 0
          // 点名失败人数
          const callnameFailed = homeData.proRollcollMes.rollcallFailedUserSize || 0
          // 人员打卡率
          const callnameSucRate = this.$common.countPercent(callnameSucceed, callnameAll)
          this.callname = {
            allNum: callnameAll,
            sucNum: callnameSucceed,
            faiNum: callnameFailed,
            clockRate: callnameSucRate
          }
          this.callnameOption.title.text = '点名成功百分比'
          const callnameChart = [
            {value: callnameSucceed, name: '成功'},
            {value: callnameFailed, name: '失败'}
          ]
          this.callnameOption.series[0].data = callnameChart

          /* 固定岗管理 */
          // 需打卡次数
          const fixationAll = homeData.proPermanentMes.mustPerRecordSize || 0
          // 打卡成功次数
          const fixationSucceed = homeData.proPermanentMes.mustPerRecordSize || 0
          // 未打卡次数
          const fixationNot = homeData.proPermanentMes.mustPerRecordSize || 0
          // 打卡异常次数
          const fixationAbnormal = homeData.proPermanentMes.mustPerRecordSize || 0
          this.fixation = {
            allNum: fixationAll,
            sucNum: fixationSucceed,
            notNum: fixationNot,
            abnNum: fixationAbnormal
          }
          this.fixationOption.title.text = '打卡次数百分比'
          const fixationChart = [
            {value: fixationSucceed, name: '已打卡'},
            {value: fixationNot, name: '未打卡'},
            {value: fixationAbnormal, name: '异常'}
          ]
          this.fixationOption.series[0].data = fixationChart
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 部门
    getSectorData () {
      let params = {
        ogz_id: this.baseId,
        type: 1
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.reportApi() + '/selOgzOperateMes',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const homeData = res.data.data1
          /* 概况 */
          this.pandectData = {
            projectNum: 0,
            siteFac: 0,
            crewNum: homeData.ogzBaseMes.userSize || 0,
            gatherFac: homeData.ogzBaseMes.bindCardSize || 0,
            siteNum: 0,
            gatewayFac: 0,
            onlineCrew: homeData.ogzBaseMes.onlineUserSize || 0,
            onlineFac: homeData.ogzBaseMes.offlineDeviceSize || 0,
            offlineCrew: homeData.ogzBaseMes.offlineUserSize || 0,
            offlineFac: homeData.ogzBaseMes.onlineDeviceSize || 0
          }
          /* 巡检巡查任务 */
          const taskAll = homeData.ogzInsDutyMes.insDutySize || 0
          // 已完成任务
          const taskFinish = homeData.ogzInsDutyMes.continueInsDutySize || 0
          // 未完成任务
          const taskUndone = homeData.ogzInsDutyMes.notContinueInsDutySize || 0
          // 完成率
          const taskFinishRate = this.$common.countPercent(taskFinish, taskAll)
          this.task = {
            taskAll: taskAll,
            finish: taskFinish,
            unfinished: taskUndone,
            finishRate: taskFinishRate
          }
          this.taskOption.title.text = '任务完成百分比'
          const taskChart = [
            {value: taskFinish, name: '已完成'},
            {value: taskUndone, name: '未完成'}
          ]
          this.taskOption.series[0].data = taskChart
          /* 品质监控（人员/位置） */
          // 已打卡人数
          const qualityClock = homeData.ogzQualityMes.alreadyRecordUserSize || 0
          // 未打卡人数
          const qualityNoclock = homeData.ogzQualityMes.notRecordUserSize || 0
          // 已巡查位置数
          const qualityExamine = homeData.ogzQualityMes.alreadyRecordUserSize || 0
          // 未巡查位置数
          const qualityNoexamine = homeData.ogzQualityMes.notRecordUserSize || 0
          // 打卡上传数量
          const qualityUploading = homeData.ogzQualityMes.notRecordUserSize || 0
          this.quality = {
            clock: qualityClock,
            noclock: qualityNoclock,
            examine: qualityExamine,
            noexamine: qualityNoexamine,
            uploading: qualityUploading
          }
          this.qualityOption.title.text = '位置巡查数百分比'
          const qualityChart = [
            {value: qualityExamine, name: '已巡查'},
            {value: qualityNoexamine, name: '未巡查'}
          ]
          this.qualityOption.series[0].data = qualityChart

          /* 点名管理 */
          // 点名人数
          const callnameAll = homeData.ogzRollcollMes.rollcallUserSize || 0
          // 点名成功人数
          const callnameSucceed = homeData.ogzRollcollMes.rollcallSucessUserSize || 0
          // 点名失败人数
          const callnameFailed = homeData.ogzRollcollMes.rollcallFailedUserSize || 0
          // 人员打卡率
          const callnameSucRate = this.$common.countPercent(callnameSucceed, callnameAll)
          this.callname = {
            allNum: callnameAll,
            sucNum: callnameSucceed,
            faiNum: callnameFailed,
            clockRate: callnameSucRate
          }
          this.callnameOption.title.text = '点名成功百分比'
          const callnameChart = [
            {value: callnameSucceed, name: '成功'},
            {value: callnameFailed, name: '失败'}
          ]
          this.callnameOption.series[0].data = callnameChart

          /* 固定岗管理 */
          this.fixation = {
            allNum: 0,
            sucNum: 0,
            notNum: 0,
            abnNum: 0
          }
          this.fixationOption.title.text = ''
          this.fixationOption.series[0].data = []
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 跳转总览概况 */
    skipSurvey () {
      if (this.switchType === 1) return
      this.$router.push({
        path: '/main/home-survey',
        query: {
          id: this.orgId,
          name: this.orgName,
          baseId: this.baseId,
          type: this.switchType
        }
      })
    },
    /* 跳转巡检巡查任务 */
    skipTask () {
      if (this.switchType === 1) return
      this.$router.push({
        path: '/main/home-task',
        query: {
          id: this.orgId,
          name: this.orgName,
          baseId: this.baseId,
          type: this.switchType
        }
      })
    },
    /* 品质监控（人员/位置） */
    skipQuality () {
      if (this.switchType === 1) return
      this.$router.push({
        path: '/main/home-quality',
        query: {
          id: this.orgId,
          name: this.orgName,
          baseId: this.baseId,
          type: this.switchType
        }
      })
    },
    /* 点名管理 */
    skipCallname () {
      if (this.switchType === 1) return
      this.$router.push({
        path: '/main/home-callname',
        query: {
          id: this.orgId,
          name: this.orgName,
          baseId: this.baseId,
          type: this.switchType
        }
      })
    },
    /* 详情 */
    skipFixation () {
      if (this.switchType !== 2) return
      this.$router.push({
        path: '/main/home-fixation',
        query: {
          name: this.orgName,
          baseId: this.baseId,
          type: this.switchType
        }
      })
    },
    // 人员轨迹
    clickTrack () {
      const openUrl = this.baseUrl() + '/trackmap/#/login?phone=' + this.userPhone
      window.open(openUrl)
    }
  }
}
</script>

<style lang="less" scoped>
.home{
  height: 100%;
  padding-bottom: 20px;
  .module-container{
    height: 100%;
    .module-header{
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-main{
      margin-left: 20px;
      margin-right: 20px;
      .search{
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 70px;
        padding-left: 20px;
        padding-right: 20px;
        background: #ffffff;
        .hint{
          padding-left: 20px;
          color: #272727;
        }
        .track{
          flex-grow: 1;
          text-align: right;
        }
      }
      .pandect{
        margin-top: 10px;
        padding-top: 10px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 10px;
        background: #ffffff;
        .pandect-title {
          height: 30px;
          display: flex;
          align-items: center;
          .chunk {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4e97d8;
          }
          .txt{
            padding-left: 10px;
            font-size: 18px;
            color: #333;
          }
        }
        .pandect-content{
          display: flex;
          flex-wrap: wrap;
          .pandect-item{
            width: 25%;
            height: 40px;
            display: flex;
            align-items: center;
            font-size: 14px;
          }
        }
      }
      .survey{
        margin-top: 10px;
        .item{
          display: flex;
          flex-direction: column;
          padding: 10px 20px;
          background: #ffffff;
          .item-title {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 30px;
            .chunk {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #4e97d8;
            }
            .txt {
              padding-left: 10px;
              font-size: 18px;
              color: #333;
            }
          }
          .item-content{
            display: flex;
            flex-direction: row;
            height: 240px;
            .chart {
              flex-grow: 1;
            }
            .describe {
              display: flex;
              align-items: center;
              width: 180px;
              .details {
                display: flex;
                flex-wrap: wrap;
                .single {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  height: 35px;
                  .txt {
                    font-size: 14px;
                  }
                }
              }
            }
          }
        }
      }
      .sign{
        margin-left: 10px;
        padding: 3px 5px;
        font-size: 12px;
        color: #339933;
        background: #E4E4E4;
        border-radius: 2px;
        &.old{
          color: #0066CC;
        }
      }
      .clickable{
        cursor: pointer;
      }
    }
  }
}
</style>
