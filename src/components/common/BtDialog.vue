<script setup lang="ts">
import {computed, nextTick, onMounted, watch} from "vue";

const props = defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "close"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const dialogTitle = computed(() => props.title?.trim() || '')
// watch(() => props.modelValue, val => dialogVisible.value = val)

function closeDialog() {
  dialogVisible.value = false
  emit("update:modelValue", false)
  emit("close")
}

/** 隐藏默认 header */
const updateHeaderDisplay = async () => {
  await nextTick()
  const header = document.querySelector('.el-dialog__header') as HTMLElement
  if (header) {
    header.style.display = dialogTitle.value ? '' : 'none'
  }
}

onMounted(updateHeaderDisplay)
watch(dialogTitle, updateHeaderDisplay)
watch(dialogVisible, (val) => {
  if (val) updateHeaderDisplay()
})
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      align-center
      draggable
      class="bt-dialog rounded-[.4rem]"
      style="--el-dialog-width: 52rem"
  >
    <template #header>
      <span class="text-[1.4rem] leading-6 text-gray-333 truncate">{{dialogTitle}}</span>
    </template>
    <div class="absolute top-[-15px] right-[-15px] z-99 w-[3rem] h-[3rem] rounded-[50%] cursor-pointer hover:bg-[#f1f1f1]">
      <div
          class="absolute w-[3rem] h-[3rem] top-[0] left-[0] origin-center close-popup-btn"
          @click="closeDialog"
      />
    </div>
    <!-- 默认插槽: 内容主体 -->
    <slot />

    <!-- footer 插槽：允许自定义，也有默认关闭按钮 -->
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>