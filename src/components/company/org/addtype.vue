<template>
  <div class="addtype">
    <h3 class="title">请选择机构类型</h3>
    <div class="types">
      <a href="javascript:void(0);" class="item" @click="typeClick(1)" v-show="types.client">
        <img src="../../../assets/images/firm.png" alt="">
        <p class="txt">企业</p>
      </a>
      <a href="javascript:void(0);" class="item" @click="typeClick(2)" v-show="types.firm">
        <img src="../../../assets/images/firm.png" alt="">
        <p class="txt">分公司</p>
      </a>
      <a href="javascript:void(0);" class="item" @click="typeClick(3)" v-show="types.project">
        <img src="../../../assets/images/project.png" alt="">
        <p class="txt">项目</p>
      </a>
      <a href="javascript:void(0);" class="item" @click="typeClick(4)" v-show="types.sector">
        <img src="../../../assets/images/sector.png" alt="">
        <p class="txt">部门</p>
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'addtype',
  data () {
    return {
      types: {
        client: true,
        firm: true,
        project: true,
        sector: true
      }
    }
  },
  created () {

  },
  mounted () {
    if (this.orgType === 0) {
      this.types = {
        client: true,
        firm: false,
        project: false,
        sector: true
      }
    } else if (this.orgType === 1) {
      this.types = {
        client: false,
        firm: true,
        project: true,
        sector: true
      }
    } else if (this.orgType === 2) {
      this.types = {
        client: false,
        firm: false,
        project: true,
        sector: true
      }
    } else if (this.orgType === 3) {
      this.types = {
        client: false,
        firm: false,
        project: false,
        sector: true
      }
    } else {
      this.types = {
        client: false,
        firm: false,
        project: false,
        sector: false
      }
    }
  },
  computed: {
    ...mapState(
      {
        companyId: state => state.info.companyId,
        orgType: state => state.org.orgType
      }
    )
  },
  methods: {
    typeClick (count) {
      if (this.companyId === 1) {
        if (count === 1) {
          this.$router.push({ path: '/main/oorgan/addclient', query: { type: count } })
        } else {
          this.$router.push({ path: '/main/oorgan/addorg', query: { type: count } })
        }
      } else {
        this.$router.push({ path: '/main/corgan/addorg', query: { type: count } })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.addtype{
  width: 600px;
  margin: 0 auto;
  .title{
    height: 60px;
    text-align: center;
    line-height: 60px;
    font-size: 16px;
    font-weight: 600;
  }
  .types{
    padding: 20px;
    text-align: center;
    font-size: 0;
    .item{
      display: inline-block;
      width: 120px;
      padding: 10px 0;
      border-top: 1px solid #cccccc;
      border-left: 1px solid #cccccc;
      border-bottom: 1px solid #cccccc;
      img{
        text-align: center;
      }
      .txt{
        line-height: 30px;
        font-size: 14px;
        color: #333333;
        text-align: center;
      }
      &:last-of-type{
        border-right: 1px solid #cccccc;
      }
    }

  }
}
</style>
