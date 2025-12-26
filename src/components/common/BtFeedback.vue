<script setup lang="ts">

import BtDialog from "@/components/common/BtDialog.vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";

const props = defineProps<{
  showFeedback: boolean,
  feedbackComponent: string
}>()

const emit = defineEmits<{
  (e: "update:showFeedback", value: boolean): void
  (e: "close"): void
}>()

const showFeedback = computed({
  get: () => props.showFeedback,
  set: (val: boolean) => emit("update:showFeedback", val),
})


// 当 bt-dialog 内部 el-dialog 被关闭时触发
function handleDialogUpdate(val: boolean) {
  emit("update:showFeedback", val);
}

const rateRef = ref<HTMLElement | null>(null)
const rateScore = ref(0)
const hovering = ref(false)
const hoverIndex = ref(-1)
const feedbackContent = ref("")

const texts = ['很不满意', '不满意', '一般', '满意', '非常满意']
const colors = ['#ef0808', '#f0ad4e', '#20a53a']

const getStarColor = (index: number) => {
  if (index < 1) return colors[0]
  if (index < 3) return colors[1]
  return colors[2]
}

// 构造 style 字符串（便于 setAttribute）
const buildTipStyle = (index: number, visible: boolean) => {
  const base = getStarColor(index)
  return [
    `color:${base}`,
    `border-color:${base}42`,
    `background-color:${base}1A`,
    `display:${visible ? 'block' : 'none'}`
  ].join(';')
}

/**
 * updateSingleTipVisibility - 只更新与 hover 相关的 tip 显示
 * 当鼠标移入某个星时，隐藏其它 tip，仅显示当前 hoverIndex 的 tip
 * 当 hoverIndex = -1 时（鼠标离开）恢复默认状态（调用 updateRateTips）
 */
const updateSingleTipVisibility = async (hoverIdx: number) => {
  await nextTick()
  const rateEl = (rateRef.value && ((rateRef.value as any).$el || rateRef.value)) as HTMLElement
  if (!rateEl) return
  const items = rateEl.querySelectorAll<HTMLElement>('.el-rate__item')

  items.forEach((item, idx) => {
    let tip = item.querySelector<HTMLElement>('.rate-tips')
    if (!tip) {
      // 还没创建就先创建（保证每个 item 都有一个 tip 节点）
      tip = document.createElement('div')
      tip.className = 'rate-tips'
      tip.innerText = texts[idx] || ''
      item.appendChild(tip)
    }
    const visible = hoverIdx >= 0 ? (idx === hoverIdx) : undefined
    if (visible === undefined) {
      // hover 已离开，恢复到 score / 未评分 的默认显示
      const showWhenUnrated = [0, 2, 4].includes(idx)
      const show = (rateScore.value === 0 ? showWhenUnrated : Math.round(rateScore.value) - 1 === idx)
      tip.setAttribute('style', buildTipStyle(idx, show))
    } else {
      // 只显示 hover 的那个
      tip.setAttribute('style', buildTipStyle(idx, visible))
    }
  })
}

/**
 * 鼠标移动事件：计算 hoverIndex 并仅更新显示相关 tip（高效）
 * event.currentTarget 是 el-rate 根元素
 */
const onRateMouseMove = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return
  const rect = target.getBoundingClientRect()
  const relativeX = event.clientX - rect.left
  const starWidth = rect.width / 5
  const idx = Math.min(4, Math.max(0, Math.floor(relativeX / starWidth)))
  if (idx !== hoverIndex.value) {
    hoverIndex.value = idx
    // 直接更新显示：只显示当前 hover 的 tip
    updateSingleTipVisibility(idx)
  }
}

/**
 * 鼠标离开 el-rate：将 hoverIndex 置 -1 并恢复默认显示（未评分状态或已评分状态）
 * 同时，如果 hoverIndex 有值，可以把 hover 记录为评分（你要的“无需点击自动记录”）
 */
const onRateMouseLeave = () => {
  // 自动记录 hover 分数（若有）
  if (hoverIndex.value >= 0) {
    rateScore.value = hoverIndex.value + 1 // 索引 -> 分数
  }
  hoverIndex.value = -1
  // 恢复默认显示（基于当前 score）
  updateSingleTipVisibility(-1)
}

/**
 * updateRateTips - 更新所有 tip 的文本与显示（用于初始渲染与 score 变化）
 * 只在需要时调用（score 变化或初次 mount）
 */
const updateRateTips = () => {
  if (!showFeedback.value) return
  console.log('updateRateTips')
  nextTick(() => {
    const rateEl = (rateRef.value as any)?.$el || rateRef.value
    if (!rateEl) return
    const items = rateEl.querySelectorAll('.el-rate__item')

    items.forEach((item: HTMLElement, index: number) => {
      let tip = item.querySelector('.rate-tips') as HTMLElement
      if (!tip) {
        tip = document.createElement('div')
        tip.className = 'rate-tips'
        item.appendChild(tip)
      }

      const show =
          (!hovering.value && rateScore.value === 0 && [0, 2, 4].includes(index)) ||
          (hovering.value && hoverIndex.value === index) ||
          (!hovering.value && rateScore.value > 0 && Math.round(rateScore.value) - 1 === index)

      tip.innerText = texts[index]
      tip.setAttribute('style', buildTipStyle(index, show))
    })
  })
}
watch(showFeedback, updateRateTips)
</script>

<template>
  <bt-dialog :model-value="showFeedback"
             @update:modelValue="handleDialogUpdate"
  >
    <div class="h-[inherit]">
      <div class="nps-survey-box !h-[inherit]">
        <div class="nps-survey-banner">
          <span>
            <i/>
            <span style="vertical-align: 4px">您对{{ feedbackComponent }}有什么改进的方向和建议?</span>
          </span>
        </div>
        <div class="px-[4rem] text-center !relative">
          <el-rate
              ref="rateRef"
              v-model="rateScore"
              :colors="colors"
              class="mt-[8px] mb-[3rem]"
              size="large"
              :max="5"
              :texts="texts"
              :show-text="false"
              @mousemove.native="onRateMouseMove"
              @mouseleave.native="onRateMouseLeave"
          />
          <span class="text-[red] absolute left-12 top-34">*</span>
          <el-input v-model="feedbackContent"
                    type="textarea"
                    :rows="5"
                    :placeholder="'您对'+feedbackComponent+'有什么改进的方向和建议?'"
                    style="min-height: 28px"
          />
        </div>
        <div class="mt-[2.4rem] text-[1.3rem] text-primary leading-[4.6rem] flex justify-center">
          我们特别重视您的反馈，我们会每周进行需求评审，希望能更好的帮到您
        </div>
        <div class="flex flex-col items-center p-[2rem]">
          <el-button type="primary"
                     size="large"
                     class="w-[12.5rem] !py-12px !px-20px !h-auto"
                     @click="console.log(rateScore, feedbackContent)">
            提交
          </el-button>
        </div>
      </div>
    </div>
  </bt-dialog>
</template>

<style scoped>
:deep(.el-rate) {
  height: 50px;
  display: flex;
}

:deep(.el-rate__item) {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-rate__icon) {
  font-size: 4rem !important;
}

:deep(.rate-tips) {
  display: none;
  position: absolute;
  bottom: -18px;
  font-size: 12px;
  width: 60px;
  height: 18px;
  text-align: center;
  color: rgb(239, 8, 8);
  background-color: rgba(239, 8, 8, 0.05);
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(239, 8, 8, 0.26);
  border-image: initial;
}

.text-primary {
  --un-text-opacity: 1;
  color: rgb(32 165 58 /var(--un-text-opacity));
}

.nps-survey-banner {
  background-image: url("@/assets/images/feedback/qa_banner.png");
  background-repeat: no-repeat;
  position: relative;
  width: 100%;
  background-size: 100%;
  background-position: top center;
  height: 92px;
  margin-top: -1px;
  margin-bottom: 16px;
}

.nps-survey-banner > span {
  position: absolute;
  left: 32px;
  top: 16px;
  font-size: 17px;
  --un-text-opacity: 1;
  color: rgb(var(--un-preset-theme-colors-white) / var(--un-text-opacity))
}

.nps-survey-banner i {
  background-image: url("@/assets/icons/logo-white.svg");
  background-repeat: no-repeat;
  background-size: 18px;
  display: inline-block;
  width: 20px;
  height: 20px;
}
</style>