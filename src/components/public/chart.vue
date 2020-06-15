<template>
  <div class="chart" :id="id"></div>
</template>

<script>
/*
* 说明：
*   使用范围：所有图表的显示
*   接收参数：
*     parOption：图表的option
*     id: 图表的id
*     domWidth: 设定一个变量，用于监听图表模块大小是否发生变化，图表组件进行相应的更新
* */
export default{
  props: ['parOption', 'id', 'domWidth'],
  data () {
    return {
      chart: null
    }
  },
  created () {

  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.chart = this.$echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.parOption)
    }
  },
  watch: {
    parOption: {
      handler (val, oldVal) {
        if (this.chart) {
          this.chart.setOption(val)
        }
      },
      deep: true
    },
    domWidth (val, oldVal) {
      this.chart.resize()
    }
  }
}
</script>

<style lang="less" scoped>
  .chart{
    width: 100%;
    height: 100%;
  }
</style>
