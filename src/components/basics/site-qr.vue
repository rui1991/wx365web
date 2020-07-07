<template>
  <div id="qrcode">
    <vue-qr :text="item.value" :size="200" :margin="0" :logoMargin="2" v-for="item in qrValues" :key="item.id"></vue-qr>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import vueQr from 'vue-qr'
export default{
  props: ['parentDialog', 'parentData'],
  data () {
    return {
      qrUrl: this.baseUrl() + '/posdet/#/details',
      qrValues: []
    }
  },
  components: {
    vueQr
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
    qrInit () {
      let qrValues = []
      this.parentData.forEach((item) => {
        qrValues.push(
          {
            id: item.position_id,
            name: item.position_name,
            value: this.qrUrl + '?proid=' + this.projectId + '&posid=' + item.position_id
          }
        )
      })
      this.qrValues = qrValues
      setTimeout(() => {
        this.downQrcode()
      }, 500)
    },
    downQrcode () {
      const qrValues = this.qrValues
      const eles = document.querySelectorAll('#qrcode img')
      for (let i = 0; i < qrValues.length; i++) {
        const iconUrl = eles[i].src
        let a = document.createElement('a')
        let event = new MouseEvent('click')
        a.download = qrValues[i].name
        a.href = iconUrl
        a.dispatchEvent(event)
      }
      this.$emit('parentFinish')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.qrInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
