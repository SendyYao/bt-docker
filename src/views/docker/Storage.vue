<script setup lang="ts">

import {onMounted, ref} from "vue";
import BtComTable from "@/components/common/BtComTable.vue";
import BtFeedback from "@/components/common/BtFeedback.vue";
import type {MountedVolumeList} from "@/types/MountedVolumeList.ts";
import CommonDockerRequest from "@/utils/request.ts";

const tableData = ref<MountedVolumeList>()

const tabFilter = ref([
  {name: "存储卷", disabled: true, checked: true, prop: "Name"},
  {name: "挂载点", checked: true, prop: "Mountpoint"},
  {name: "所属容器", checked: true, prop: "container"},
  {name: "设备", checked: true, prop: "Driver"},
  {name: "创建时间", checked: false, prop: "CreatedAt"},
  {name: "标签", checked: true, prop: "Labels"},
  {name: "操作", disabled: true, checked: true}
])

const dialogVisible = ref(false)
const feedbackVisible = ref(false)

onMounted(async () => {
  if (!tableData.value) {
    console.log("获取数据")
    tableData.value = await new CommonDockerRequest().createRequest<MountedVolumeList>('/volume/get_volume_list', null, 1)
  }
})
</script>

<template>
  <div class="relative container-table-tab p-[1.6rem]">
    <bt-com-table :tab-filter="tabFilter" :table-data="tableData" page-name="Storage">
      <template #header-left>
        <div class="flex flex-shrink-0">
          <div class="flex items-center">
            <div class="flex items-center">
              <el-button type="primary" @click="dialogVisible=true">添加存储卷</el-button>
              <el-button type="default">清理存储卷</el-button>
            </div>
            <a class="ml-[1rem] bt-link" @click="feedbackVisible=true">需求反馈</a>
          </div>
        </div>
      </template>

      <template #operation-colum>
        <el-table-column label="操作">
          <template #default="scope">
            <div>
              <span class="bt-link" @click="console.log(scope['$index'])">
                删除
              </span>
            </div>
          </template>
        </el-table-column>
      </template>
    </bt-com-table>
    <bt-feedback feedback-component="docker"
                 v-model:show-feedback="feedbackVisible"/>
  </div>
</template>

<style scoped>

</style>