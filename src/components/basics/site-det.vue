<template>
  <el-dialog title="地址详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="上级位置">
        <el-input :disabled="true" v-model="formData.parentPath"></el-input>
      </el-form-item>
      <el-form-item label="地址名称">
        <el-input :disabled="true" v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="区域类型">
        <el-input :disabled="true" v-model="formData.areaType"></el-input>
      </el-form-item>
      <el-form-item label="地址类型">
        <el-input :disabled="true" v-model="formData.type"></el-input>
      </el-form-item>
      <el-form-item label="地址标签">
        <el-input :disabled="true" v-model="formData.mac"></el-input>
      </el-form-item>
      <el-form-item label="关联标准">
        <el-input :disabled="true" v-model="formData.norm"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" :disabled="true" v-model="formData.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        parentPath: '',
        name: '',
        areaType: '',
        type: '',
        mac: '',
        norm: '',
        remark: ''
      }
    }
  },
  computed: {
    ...mapState(
      {
        nowClientId: state => state.nowClientId,
        userId: state => state.info.userId,
        nowProid: state => state.nowProid
      }
    )
  },
  methods: {
    detInit () {
      this.formData = {
        parentPath: '',
        name: '',
        areaType: '',
        type: '',
        mac: '',
        norm: '',
        remark: ''
      }
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.nowProid,
        position_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/selPositionOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 区域类型
          const areaNum = itemData.area_type || ''
          let areaType = ''
          if (areaNum === 1) {
            areaType = '办公室区域'
          } else if (areaNum === 2) {
            areaType = '工作区域'
          }
          // 地址类型
          const typeNum = itemData.position_type
          let type = ''
          if (typeNum === 0) {
            type = '巡检地址'
          } else if (typeNum === 6) {
            type = '固定岗位'
          }
          // Mac地址
          this.formData = {
            parentPath: itemData.parent_address,
            name: itemData.position_name,
            areaType: areaType,
            type: type,
            mac: itemData.position_mac,
            norm: itemData.template_name || '',
            remark: itemData.instructions
          }
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 关闭
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
