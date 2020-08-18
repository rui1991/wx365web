<template>
  <div id="container"></div>
</template>

<script>
import AMap from 'AMap'
export default{
  props: ['parentState', 'parentLong', 'parentLat'],
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    mapInit () {
      // 创建map实例
      let map = new AMap.Map('container', {
        resizeEnable: true,
        center: [this.parentLong, this.parentLat],
        zoom: 19
      })
      let marker = new AMap.Marker({
        position: [this.parentLong, this.parentLat],
        offset: new AMap.Pixel(-13, -30)
      })
      marker.setMap(map)
    }
  },
  watch: {
    parentState (val, oldVal) {
      if (val) {
        this.mapInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  #container{
    width: 100%;
    height: 386px;
  }
</style>
