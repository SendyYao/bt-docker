<script setup lang="ts">
import {useDockerStore} from "@/store/dockerStore.ts";
import type {ContainerInfo} from "@/types/ContainerInfo";

const ContainerVolumeData = (useDockerStore().currentConDetail as ContainerInfo).Mounts

</script>

<template>
  <el-table :data=ContainerVolumeData
            class="w-full"
            border
            :header-cell-style="{background:'#f0f0f1'}"
            style="position:relative!important;"
  >
    <el-table-column label="数据卷" prop="Source"/>
    <el-table-column label="容器目录" prop="Destination"/>
  </el-table>
</template>

<style scoped>

</style>