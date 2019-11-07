<template>
  <el-dialog title="网关详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog mult-dialog">
    <el-tabs v-model="detActive" type="card" @tab-click="detTabClick">
      <el-tab-pane label="网关详情" name="swg"></el-tab-pane>
      <el-tab-pane label="地图" :disabled ="tabDisabled" name="map"></el-tab-pane>
    </el-tabs>
    <el-form class="entirety-from" :model="parentData" :label-width="formLabelWidth" v-show="detActive === 'swg'">
      <el-form-item label="网关名称" prop="name">
        <el-input :disabled="true" v-model.trim="parentData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="网关ID" prop="id">
        <el-input :disabled="true" v-model.trim="parentData.id" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="网关位置" prop="posName">
        <el-input :disabled="true" v-model="parentData.posName"></el-input>
      </el-form-item>
      <el-form-item label="经度" prop="longitude">
        <el-input :disabled="true" v-model.trim="parentData.longitude" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="纬度" prop="latitude">
        <el-input :disabled="true" v-model.trim="parentData.latitude" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="describe">
        <el-input :disabled="true" type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="parentData.describe"></el-input>
      </el-form-item>
    </el-form>
    <!-- 地图坐标 -->
    <map-module
      v-show="detActive === 'map'"
      :parentState="mapShow"
      :parentLong="parentData.longitude"
      :parentLat="parentData.latitude">
    </map-module>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
// 引入位置组件
import mapModule from '@/components/public/show-map'
export default{
  props: ['parentDialog', 'parentData'],
  data () {
    return {
      detActive: 'swg',
      formLabelWidth: '100px',
      tabDisabled: true,
      mapShow: false
    }
  },
  created () {

  },
  components: {
    mapModule
  },
  methods: {
    detInit () {
      // 默认查看设备详情
      this.detActive = 'swg'
      this.mapShow = false
      const longitude = this.parentData.longitude
      const latitude = this.parentData.latitude
      if (longitude && latitude) {
        this.tabDisabled = false
      } else {
        this.tabDisabled = true
      }
    },
    // 详情导航
    detTabClick (tab) {
      if (tab.name === 'swg') return
      if (tab.name === 'map' && !this.mapShow) {
        this.mapShow = true
      }
    },
    /* 关闭 */
    closeClick () {
      this.$emit('parentClose')
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
