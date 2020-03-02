<template>
  <div class="orange-module">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="企业详情" name="company"></el-tab-pane>
      <el-tab-pane label="模块配置" name="config"></el-tab-pane>
      <!--<el-tab-pane label="角色管理" name="role"></el-tab-pane>-->
    </el-tabs>
    <div class="content">
      <com-module1
        v-if="parentOrgType === 1"
        v-show="modType === 1"
        :parentOrgId= "parentOrgId"
        :parentOrgType= "parentOrgType"
        :parentBaseId= "parentBaseId"
        @parentUpdata="upData">
      </com-module1>
      <com-module2
        v-if="parentOrgType === 2"
        v-show="modType === 2"
        :parentOrgId= "parentOrgId"
        :parentOrgType= "parentOrgType"
        :parentBaseId= "parentBaseId"
        @parentUpdata="upData">
      </com-module2>
      <config-module
        v-show="modType === 3"
        :parentOrgId= "parentOrgId"
        :parentBaseId= "parentBaseId">
      </config-module>
    </div>
  </div>
</template>

<script>
// 引入编辑企业组件
import comModule1 from '@/components/company/oorgan-com1'
// 引入编辑分公司组件
import comModule2 from '@/components/company/oorgan-com2'
// 引入新增类型组件
import configModule from '@/components/company/oorgan-config'
export default{
  props: ['parentOrgId', 'parentOrgType', 'parentBaseId'],
  data () {
    return {
      activeName: 'company',
      modType: 0
    }
  },
  created () {

  },
  mounted () {
    const orgType = this.parentOrgType
    if (orgType === 1) {
      this.modType = 1
    } else if (orgType === 2) {
      this.modType = 2
    }
  },
  components: {
    comModule1,
    comModule2,
    configModule
  },
  methods: {
    // 点击导航
    handleClick (tab) {
      if (tab.name === 'config') {
        this.modType = 3
      } else {
        const orgType = this.parentOrgType
        if (orgType === 1) {
          this.modType = 1
        } else if (orgType === 2) {
          this.modType = 2
        }
      }
    },
    upData () {
      this.$emit('parentUpdata')
    }
  },
  watch: {
    parentOrgId (val, old) {
      const orgType = this.parentOrgType
      if (orgType === 1) {
        this.modType = 1
      } else if (orgType === 2) {
        this.modType = 2
      }
    }
  }
}
</script>

<style lang="less" scoped>
 .orange-module {

 }
</style>
