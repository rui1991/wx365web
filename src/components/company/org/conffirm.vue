<template>
  <div class="conffirm">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="企业详情" name="comclient"></el-tab-pane>
      <el-tab-pane label="模块配置" name="confmod"></el-tab-pane>
      <!--<el-tab-pane label="角色管理" name="role"></el-tab-pane>-->
    </el-tabs>
    <div class="content">
      <router-view @parentChange="orgChange"></router-view>
    </div>
  </div>
</template>

<script>
export default{
  name: 'conffirm',
  data () {
    return {

    }
  },
  created () {

  },
  computed: {
    activeName: {
      get () {
        return this.$store.state.orgConfName
      },
      set (value) {
        this.$store.commit('setOrgConfName', value)
      }
    }
  },
  methods: {
    handleClick (tab) {
      const name = tab.name
      if (name === 'comclient') {
        this.$router.push({ path: '/main/oorgan/conffirm/comclient' })
      } else if (name === 'confmod') {
        this.$router.push({ path: '/main/oorgan/conffirm/confmod' })
      } else if (name === 'role') {
        this.$router.push({ path: '/main/oorgan/conffirm/role' })
      }
    },
    orgChange () {
      this.$emit('parentRefresh')
    }
  }
}
</script>

<style lang="less" scoped>
.conffirm{

}
</style>
