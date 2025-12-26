<script setup lang="ts">
import {computed, ref} from "vue";
import BtDialog from "@/components/common/BtDialog.vue";
import {ElMessage} from "element-plus";

type ConfirmContent = Record<"prepend"|"dangerous"|"append", string>

const props = defineProps<{
  showConfirm: boolean
  confirmTitle: string
  confirmContent: ConfirmContent
  confirmKeyWord: string
}>()

const emit = defineEmits<{
  (e: "update:showConfirm", value: boolean): void
  (e: "close"): void
  (e: 'check-success'): void
}>()

const showConfirm = computed({
  get: () => props.showConfirm,
  set: (val: boolean) => emit("update:showConfirm", val),
})

const inputKeyWord = ref('')

// 当 bt-dialog 内部 el-dialog 被关闭时触发
function handleDialogUpdate(val: boolean) {
  console.log("Close")
  emit("update:showConfirm", val);
}

function handelConfirmClick() {
  if (inputKeyWord.value != props.confirmKeyWord) {
    ElMessage({
      customClass: "bt-message-error",
      showClose: true,
      duration: 2000,
      type: "error",
      message: "输入错误，请重新输入！"
    })
  }
  else {
    emit("check-success")
  }

}

</script>

<template>
  <bt-dialog :model-value="showConfirm"
             :title="confirmTitle"
             @update:model-value="handleDialogUpdate">
    <div class="confirm-input text-dark relative p-[2rem] !h-[inherit]">
      <div class="content flex items-center">
        <i class="svgtofont-el-warning-filled !text-[4rem] text-warning"/>
        <div class="message flex-1 ml-4 py-[.3rem] leading-[2.4rem] text-[1.3rem]">
          <div class="text">
            {{ confirmContent.prepend }}
            <span class="text-danger">{{ confirmContent.dangerous }}</span>
            {{ confirmContent.append }}
          </div>
        </div>
      </div>
      <div class="bg-[#e6e6e6] flex flex-col p-[12px] mt-[12px]">
        <p class="mb-[8px]">
          请手动输入
          <span class="text-danger"> "{{confirmKeyWord}}"</span>
          ,完成验证
        </p>
        <el-input size="small" type="text" autocomplete="off" tabindex="0" v-model="inputKeyWord"/>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-between flex-row-reverse">
        <div>
          <el-button type="warning" @click="showConfirm=false">取消</el-button>
          <el-button type="primary" @click="handelConfirmClick">确定</el-button>
        </div>
      </div>
    </template>
  </bt-dialog>
</template>

<style scoped>

</style>