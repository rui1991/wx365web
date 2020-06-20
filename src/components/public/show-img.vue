<template>
  <el-dialog title="图片" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div style="text-align: center; overflow-x: hidden;">
      <img :src="item.imgUrl" v-for="item in parentImgurl" :key="item.id" height="380" style="margin: 5px;" alt="">
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/*
* 说明：
*   使用范围：图片的对话框形式展示
*   接收参数：
*           parentImgurl: [
*                           {
*                             id: 图片的标识
*                             imgUrl：图片的链接
*                           }
*                         ]
* */
export default{
  props: ['parentDialog', 'parentImgurl'],
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
