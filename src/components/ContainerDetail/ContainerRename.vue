<script setup lang="ts">

import {useDockerStore} from "@/store/dockerStore.ts";
import type {ContainerInfo} from "@/types/ContainerInfo";
import {ref} from "vue";

const OriginName = (useDockerStore().currentConDetail as ContainerInfo).Name
const CurrentName = ref(OriginName.replace('/', ''))
</script>

<template>
  <div id="pane-rename" class="el-tab-pane">
    <el-form>
      <el-form-item label="新容器名" required label-position="right">
        <el-input class="!w-[24rem]" v-model="CurrentName" placeholder="请输入新容器名"/>
      </el-form-item>
    </el-form>
    <el-button type="primary" class="ml-[10rem]" @click="console.log(CurrentName)">保存</el-button>
  </div>
</template>

<style scoped>

</style>