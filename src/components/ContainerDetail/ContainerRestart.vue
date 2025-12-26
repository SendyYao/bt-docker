<script setup lang="ts">
import {reactive} from "vue";

const Form = reactive({
  RestartStrategy: "no",
  RestartNumber: 0
})

const Strategies = [
  {label: "不重启", value: "no"},
  {label: "仅非正常退出的时候重启", value: "on-failure"},
  {label: "停止后马上重启", value: "always"},
  {label: "失败后重启", value: "unless-stopped"}
]
const validate = (rule:any, value: number, callback:any) => {
  if (!value) {
    callback(new Error('请输入最大重试次数'))
  } else {
    const reg = /^\d+(?=\.{0,1}\d+$|$)/
    if (reg.test(String(value))) {
      callback()
    } else {
      callback(new Error('请输入正整数'))
    }
  }
}
const Rule = {
  RestartNumber: [
    {trigger: "blur", validator: validate}
  ]
}
</script>

<template>
  <div class="pt-1.6rem">
    <el-form label-position="right" :model="Form" :rules="Rule">
      <el-form-item label="重启策略">
        <el-select class="!w-[20rem]" v-model="Form.RestartStrategy">
          <el-option v-for="operation in Strategies"
                     :label="operation.label"
                     :value="operation.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="最大重试次数" prop="RestartNumber" required :style="Form.RestartStrategy != 'unless-stopped' ? 'display: none' : ''">
        <el-input style="width: 20rem" type="number" v-model="Form.RestartNumber">
          <template #append> 次 </template>
        </el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" class="ml-[10rem]" @click="console.log(Form)">保存策略</el-button>
    <ul class="tips mt-[3.4rem] list-square ml-[10rem]" style="list-style-type: square">
      <li class="mt-[4px]">手动关闭的将不会自动启动</li>
    </ul>
  </div>
</template>

<style scoped>

</style>