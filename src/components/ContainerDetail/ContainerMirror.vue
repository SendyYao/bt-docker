<script setup lang="ts">
import {reactive, ref} from "vue";
import type {FormInstance, FormRules} from "element-plus";

type MirrorForm = Record<'model'|'image'|'releaseNumber'|'warehouseAddress'|'description'|'author', string> & {isExportImage: boolean}
const formRef = ref<FormInstance>()
const Form = reactive<MirrorForm>({
  model: 'easy',
  image: '',
  releaseNumber: 'latest',
  warehouseAddress: 'Official',
  description: '',
  author: '',
  isExportImage: false
})
const formRules = reactive(<FormRules<MirrorForm>>{
  image: [
    { required: true, message: '请输入镜像名', trigger: 'blur' }
  ]
})
</script>

<template>
  <div class="container-dialog">
    <el-form label-position="right" ref="formRef" :rules="formRules" :model="Form">
      <el-form-item label="创建方式" style="margin-bottom: 1.5rem">
        <el-radio-group class="flex items-center" v-model="Form.model">
          <el-radio-button value="easy">简单模式</el-radio-button>
          <el-radio-button value="more">高级模式</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="镜像名" required style="margin-bottom: 1.5rem" prop="image">
        <el-input style="width: 24rem" placeholder="请输入镜像名" type="text" v-model="Form.image"/>
      </el-form-item>
      <el-form-item label="版本号">
        <div class="flex items-center">
          <el-input placeholder="请输入版本号" type="text" style="width: 24rem" v-model="Form.releaseNumber" />
          <span class="ml-[1rem] text-[#666] text-[1.2rem] whitespace-nowrap">默认:latest</span>
        </div>
      </el-form-item>
      <div :style="Form.model=='easy' ? 'display: none' : ''">
        <el-form-item label="仓库地址">
          <el-select class="!w-[24rem]" v-model="Form.warehouseAddress">
            <el-option label="docker官方库" value="Official" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input style="width: 24rem" placeholder="描述" v-model="Form.description"/>
        </el-form-item>
        <el-form-item label="作者">
          <el-input style="width: 24rem" placeholder="作者" v-model="Form.author"/>
        </el-form-item>
        <div class="mt-[2.4rem]">
          <el-checkbox class="mb-[2rem] ml-[10rem]" v-model="Form.isExportImage" :checked="Form.isExportImage" label="生成镜像并导出压缩包" />
        </div>
      </div>
      <el-button type="primary" class="ml-[10rem]" @click="console.log(Form)">生成镜像</el-button>
    </el-form>
  </div>
</template>

<style scoped>
.container-dialog {
  min-height: 600px;
  display: flex;
  flex-direction: column;
  padding-top: 16px;
}
</style>