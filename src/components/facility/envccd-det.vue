<template>
  <el-dialog title="设备详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="设备名称">
        <el-input :disabled="true" v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="设备类型">
        <el-input :disabled="true" v-model.trim="formData.type" auto-complete="off"></el-input>
      </el-form-item>
      <!--<el-form-item label="授权码">-->
        <!--<el-input v-model.trim="formData.code" auto-complete="off"></el-input>-->
      <!--</el-form-item>-->
      <el-form-item label="设备位置">
        <el-input :disabled="true" v-model.trim="formData.posName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="DevEui">
        <el-input :disabled="true" v-model.trim="formData.DevEui" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="AppEui">
        <el-input :disabled="true" v-model.trim="formData.AppEui" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="AppKey">
        <el-input :disabled="true" v-model.trim="formData.AppKey" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="最近在线时间">
        <el-input :disabled="true" v-model.trim="formData.lastTime" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input :disabled="true" type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.describe"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentData'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        typeValue: '',
        type: '',
        code: '',
        posName: '',
        posId: '',
        DevEui: '',
        AppEui: '',
        AppKey: '',
        beat: '',
        lastTime: '',
        describe: ''
      }
    }
  },
  methods: {
    detInit () {
      this.formData = JSON.parse(JSON.stringify(this.parentData))
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
