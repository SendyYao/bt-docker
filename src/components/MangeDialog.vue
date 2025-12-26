<script setup lang="ts">
import {ref, watch} from "vue";
import ContainerInfo from "@/components/ContainerInfo.vue";

const props = defineProps<{
  modelValue: boolean
  container?: any
}>()

const emit = defineEmits(["update:modelValue"])

const dialogVisible = ref(props.modelValue)

watch(() => props.modelValue, val => dialogVisible.value = val)

function closeDialog() {
  emit("update:modelValue", false)
}

</script>

<template>

  <el-dialog v-model="dialogVisible"
             @close="closeDialog"
             :show-close="false"
             align-center
             draggable
             class="bt-dialog rounded-[.4rem]"
             style="--el-dialog-width: 90rem">
    <template #header>
      <span class="text-[1.4rem] leading-[1.8rem] text-gray-333 truncate">{{container ? `管理容器：${container.name}` : '容器管理'}}</span>
    </template>
    <template #footer>
      <div class="absolute top-[-15px] right-[-15px] z-99 w-[3rem] h-[3rem] rounded-[50%] cursor-point hover:bg-[#f1f1f1]">
        <div class="absolute w-[3rem] h-[3rem] top-[0] left-[0] origin-center close-popup-btn" @click="closeDialog"></div>
      </div>
    </template>
    <ContainerInfo :container="container" :key="container.name"/>
  </el-dialog>

</template>

<style scoped>

</style>