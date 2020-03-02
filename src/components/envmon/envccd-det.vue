<template>
  <el-dialog title="设备详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="设备名称">
        <el-input :disabled="true" v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="DevEui">
        <el-input :disabled="true" v-model.trim="formData.DevEui" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="设备类型">
        <el-input :disabled="true" v-model.trim="formData.type" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="设置温度" style="width: 440px;" v-if="formData.type === '温湿度'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最低温度" disabled v-model.number="formData.htempMin">
              <template slot="append">℃</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最高温度" disabled v-model.number="formData.htempMax">
              <template slot="append">℃</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置湿度" style="width: 440px;" v-if="formData.type === '温湿度'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最低湿度" disabled v-model.number="formData.moisMin">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最高湿度" disabled v-model.number="formData.moisMax">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置规则" style="width: 440px;" v-if="formData.type === '无线水浸'">
        <el-radio-group v-model="formData.waterRule">
          <el-radio label="wet">浸水自动报警</el-radio>
          <el-radio label="dry">无水自动报警</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="设置压力" style="width: 440px;" v-show="formData.type === '无线压力变送器'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最小压力" disabled v-model.number="formData.presMin">
              <template slot="append">kPa</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最大压力" disabled v-model.number="formData.presMax">
              <template slot="append">kPa</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置液位" style="width: 440px;" v-show="formData.type === '无线液位变送器'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最小液位" disabled v-model.number="formData.liquMin">
              <template slot="append">cm</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最大液位" disabled v-model.number="formData.liquMax">
              <template slot="append">cm</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置温度" style="width: 440px;" v-if="formData.type === '安全用电'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最低温度" disabled v-model.number="formData.etempMin">
              <template slot="append">℃</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最高温度" disabled v-model.number="formData.etempMax">
              <template slot="append">℃</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置电压" style="width: 440px;" v-if="formData.type === '安全用电'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最低电压" disabled v-model.number="formData.voltageMin">
              <template slot="append">V</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最高电压" disabled v-model.number="formData.voltageMax">
              <template slot="append">V</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设置电流" style="width: 440px;" v-if="formData.type === '安全用电'">
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最低电流" disabled v-model.number="formData.electMin">
              <template slot="append">A</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item>
            <el-input style="width: 140px;" placeholder="最高电流" disabled v-model.number="formData.electMax">
              <template slot="append">A</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="设备位置">
        <el-input :disabled="true" v-model.trim="formData.posName" auto-complete="off"></el-input>
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
        htempMin: '',
        htempMax: '',
        moisMin: '',
        moisMax: '',
        waterRule: '',
        presMin: '',
        presMax: '',
        etempMin: '',
        etempMax: '',
        voltageMin: '',
        voltageMax: '',
        electMin: '',
        electMax: '',
        posName: '',
        posId: '',
        DevEui: '',
        beat: '',
        lastTime: '',
        describe: ''
      }
    }
  },
  methods: {
    detInit () {
      this.formData = this.parentData
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
