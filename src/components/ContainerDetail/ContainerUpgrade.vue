<script setup lang="ts">
import type {Container} from "@/types/Container";
import {reactive} from "vue";

defineProps<{container: Container}>()

const Form = reactive({
  targetImageRelease: "latest",
  forceUpgrade: false,
  forcePullImage: false
})
const rule = reactive({
  targetImageRelease: [
      {required: true, message: '请输入目标镜像版本', trigger: 'blur'}
  ]
})
</script>

<template>
  <el-form label-position="right" :model="Form" :rules="rule">
    <el-form-item label="当前镜像">{{container.image}}</el-form-item>
    <el-form-item label="目标镜像" required prop="targetImageRelease">
      <el-input style="width: 40rem" placeholder="请输入版本号" type="text" autocomplete="off" v-model="Form.targetImageRelease">
        <template #prepend>{{container.image.split(':')[0]}}</template>
      </el-input>
    </el-form-item>
    <el-form-item label=" ">
      <el-checkbox label="强制升级" :checked="Form.forceUpgrade" v-model="Form.forceUpgrade"/>
    </el-form-item>
    <el-form-item label=" ">
      <el-checkbox label="强制拉取镜像" :checked="Form.forcePullImage" v-model="Form.forcePullImage" />
    </el-form-item>
  </el-form>
  <el-button type="primary" class="ml-[10rem]" @click="console.log(Form)">保存配置</el-button>
</template>

<style scoped>

</style>