<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import axiosInstance from "@/axios.ts";
import type {Container} from "@/types/Container";

const props = defineProps<{ container: Container }>()
const dateRadio = ref("最近3天");
const datePickerRef = ref();

type LogResp = {
  id: string;
  size: number;
} & Record<"logs" | "logs_path" | "name", string>;

const LogResponse = ref<LogResp | null>(null);
// 双向绑定的范围
const dateRange = ref<[Date, Date] | string>('')

const buttonRef = ref<any | null>(null)
const buttonText = computed(() => {
  if (!dateRange.value || dateRange.value === '' || dateRadio.value != '') {
    return '自定义时间'
  }
  const [since, until] = dateRange.value
  const format = (d: Date) =>
      d.toLocaleDateString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit'})
          .replace(/\//g, '-')
  return `${format(since as Date) || '开始'} ~ ${format(until as Date) || '今天'}`
})

const logText = ref("")

const customDateButtonStyle = ref("margin: 0px 0px 0px 1rem")
const popperInset = ref("")
const disableDate = (time: Date) => {
  const today = new Date()
  today.setHours(0,0,0,0)
  return time.getTime() > today.getTime()
}
function openDatePicker() {
  (datePickerRef.value as any)?.handleOpen()

  nextTick(() => {
    const buttonRect = buttonRef.value?.$el?.getBoundingClientRect()
    console.log(buttonRect)
    if (buttonRect) {
      popperInset.value = `z-index: 2044; position: absolute; inset: ${buttonRect.bottom + window.screenY + 6}px auto auto ${buttonRect.left + window.screenX - 500}px`
    }
  })
}

function handleChange(val: [Date, Date]) {
  dateRange.value = val as [Date, Date]
  const sinceTimeStamp = val[0].getTime() / 1000 as number
  const untilTimeStamp = val[1].getTime() / 1000 as number
  (datePickerRef.value as any)?.handleClose()
  dateRadio.value = ''
  customDateButtonStyle.value = "margin: 0 0 0 0; background: rgb(32, 168, 58); color: rgb(255, 255, 255)"
  getContainerLog(props.container.id, [sinceTimeStamp, untilTimeStamp])
}

const getContainerLog = async (id: string, time_search: [number, number] | null = null) => {
  try {
    const tenNowTimeStamp = Math.round(Date.now() / 1000)

    const formData = new FormData()
    formData.set('id', id)

    if (!time_search) {
      // 定义映射关系
      const timeMap: Record<string, number | null> = {
        "最近7天": 7,
        "最近3天": 3,   // 可选默认值之一
        "全部": null     // null 表示不设置 time_search
      }

      // 获取对应天数
      const days: number | null = timeMap[dateRadio.value] ?? 3  // 如果不在 map 里，默认 3 天

      if (days != null) {
        formData.set('time_search', `[${tenNowTimeStamp - days * 24 * 3600}, ${tenNowTimeStamp}]`)
      }
    } else {
      formData.set('time_search', `[${time_search[0].toString()}, ${time_search[1].toString()}]`)
    }

    const response = await axiosInstance.post(
        "/btdocker/container/get_logs",
        formData,
        {loading: "获取日志，请稍后..."}
    )
    LogResponse.value = response.data
    setTimeout(() => {
      logText.value = response.data['logs'] || '暂无日志';
    }, 1000)
  } catch (error) {
    console.log(error)
  }
}

function exportContainerLog() {
  if (LogResponse.value) {
    window.open(`http://192.168.2.141:8008/download?filename=${LogResponse.value.logs_path}`, '__blank')
  }
  console.log(LogResponse.value?.logs_path)
}
</script>

<template>
  <div class="flex flex-col">
    <div>
      <div class="flex items-center justify-between">
        <div class="btnGroup flex my-[1.6rem] items-center">
          <el-button @click="getContainerLog(container.id)">获取|刷新日志</el-button>
          <div class="line mx-[1rem] w-[.1rem] h-[2rem] bg-[#ccc] align-middle"></div>
          <el-button @click="exportContainerLog">下载日志</el-button>
          <el-button>清空日志</el-button>
        </div>
        <div class="action flex items-center relative">
          <el-radio-group v-model="dateRadio" @change="() => {
            customDateButtonStyle='margin: 0px 0px 0px 1rem';
            getContainerLog(props.container.id)
          }">
            <el-radio-button label="最近3天" value="最近3天"></el-radio-button>
            <el-radio-button label="最近7天" value="最近7天"></el-radio-button>
            <el-radio-button label="全部" value="全部"></el-radio-button>
          </el-radio-group>
          <el-button ref="buttonRef" @click="openDatePicker" :style="customDateButtonStyle">{{ buttonText }}</el-button>
          <el-date-picker
              ref="datePickerRef"
              v-model="dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-value="new Date()"
              :disabled-date="disableDate"
              @change="handleChange"
              placement="auto"
              :popper-style="popperInset"
              style="display: none"/>
        </div>
      </div>
      <div class="h-[54rem] overflow-y-auto">
        <div class="w-full h-full relative">
          <pre class="w-full flex items-start py-[1rem] px-4 overflow-y-auto bg-[#333] log-box" style="height: 100%">
            <code class="flex-1 w-full p-0 bg-none whitespace-pre-line text-i text-[#ececec]">
              {{ logText }}
            </code>
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>