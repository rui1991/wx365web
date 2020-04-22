<template>
  <div>
    <el-dialog title="检查项详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
        <el-form-item label="标准项名称">
          <el-input v-model.trim="formData.name" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="表达方式">
          <el-input v-model.trim="formData.wayValue" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="表达值" v-if="wayType === 1">
          <el-tag
            :key="tag"
            v-for="tag in formData.values">
            {{tag}}
          </el-tag>
        </el-form-item>
        <el-form-item label="表达值" v-else>
          <el-input v-model.trim="formData.valueText" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="默认值" v-show="wayType === 1">
          <el-input v-model.trim="formData.defValue" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="异常值" v-show="wayType === 1">
          <el-input v-model.trim="formData.abnValue" disabled auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="要求">
          <el-input type="textarea" maxlength="100" disabled placeholder="文本长度不得超过100个字符" v-model.trim="formData.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default{
  props: ['parentDialog', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      wayOptions: [
        {
          lable: '单选',
          value: '单选'
        },
        {
          lable: '多选',
          value: '多选'
        },
        {
          lable: '文本框',
          value: '文本框'
        },
        {
          lable: '文本域',
          value: '文本域'
        },
        {
          lable: '图片',
          value: '图片'
        }
      ],
      wayType: 1,
      inputVisible: false,
      inputValue: '',
      valueOptions: [],
      formData: {
        name: '',
        wayValue: '',
        values: [],
        valueText: '',
        defValue: '',
        abnValue: '',
        content: ''
      },
      disabled: false
    }
  },
  methods: {
    // 初始化数据
    detInit () {
      const formData = JSON.parse(JSON.stringify(this.parentForm))
      // 表达方式
      const way = formData.way
      let wayValue = ''
      switch (way) {
        case 1:
          this.wayType = 1
          wayValue = '单选'
          break
        case 2:
          this.wayType = 1
          wayValue = '多选'
          break
        case 3:
          this.wayType = 2
          wayValue = '文本框'
          break
        case 4:
          this.wayType = 2
          wayValue = '文本域'
          break
        case 5:
          this.wayType = 3
          wayValue = '图片'
          break
      }
      // 异常值
      let abnValue = formData.abnValue
      abnValue = abnValue.join(',')
      this.formData = {
        name: formData.name,
        wayValue: wayValue,
        values: formData.values,
        valueText: formData.valueText,
        defValue: formData.defValue,
        abnValue: abnValue,
        content: formData.content
      }
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
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
