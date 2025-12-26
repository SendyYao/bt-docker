<script setup lang="ts">

import {type Component, computed, defineAsyncComponent, ref} from 'vue'
import type {Container} from "@/types/Container";

const activeName = ref('status')

const props = defineProps<{ container: Container }>()

const tabPaneInfo = {
  "容器状态": 'status',
  "容器终端": 'terminal',
  "容器详情": 'details',
  "容器存储卷": 'volume',
  "容器网络": 'net',
  "重启策略": 'restart',
  "创建镜像": 'mirror',
  "编辑容器": 'edit',
  "升级容器": 'upgrade',
  "重命名": 'rename',
  "实时监控": 'monitor',
  "容器日志": 'logs',
  "反向代理": 'proxy'
}

const modules = import.meta.glob<Component>('@/components/ContainerDetail/*.vue')
const activeComponent = computed(() => {
  if (['status', 'terminal', 'details', 'volume', 'net', 'restart', 'mirror', 'edit', 'upgrade', 'rename', 'logs', 'proxy'].includes(activeName.value)) {
    const compName = `Container${activeName.value.charAt(0).toUpperCase()}${activeName.value.slice(1)}.vue`
    const compPath = `/src/components/ContainerDetail/${compName}`
    return defineAsyncComponent(modules[compPath])
  }
  // 默认
  return defineAsyncComponent(() => import('@/components/ContainerDetail/ContainerOthers.vue'))
})

const SinglePropValue = (tabPanelKey: string) => {
  if (['容器状态', '容器终端', '容器详情', '容器网络', '编辑容器', '升级容器', '容器日志', '反向代理'].includes(tabPanelKey)) {
    return props.container
  }
  return tabPanelKey
}
</script>

<template>
  <div v-show="false">
    <p>容器ID: {{ container.id }}</p>
    <p>镜像: {{ container.image }}</p>
    <p>状态: {{ container.status }}</p>
  </div>
  <div class="h-[inherit]">
    <el-tabs
        v-model="activeName"
        type="border-card"
        tab-position="left"
        class="tabs-left-bg-card !h-[inherit]"
    >
      <template v-for="(value, key) in tabPaneInfo">
        <el-tab-pane :label="key" :name="value">
          <Component :is="activeComponent"
                     :container="SinglePropValue(key)"
                     @update:container="(newContainer: Container) => {console.log(newContainer.status)}"
                     v-if="activeName==value"
          />
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>
</template>

<style scoped>

</style>
