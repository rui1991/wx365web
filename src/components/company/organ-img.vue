<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentOrgId'],
  data () {
    return {
      title: '',
      reqUrl: '',
      fileList: []
    }
  },
  created () {

  },
  mounted () {
    // 设置上传图片地址
    this.reqUrl = this.sysetApi() + '/upload?state=10&user_id' + this.userId
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
