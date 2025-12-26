<script setup lang="ts">
import type {Container} from "@/types/Container";
import type {ContainerInfo} from "@/types/ContainerInfo";
import {ref} from "vue";
import {useDockerStore} from "@/store/dockerStore.ts";
import {VAceEditor} from "vue3-ace-editor";
import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-json'

defineProps<{ container: Container }>()

type Details = Record<'镜像' | 'CMD' | 'ENTRYPOINT', string> & { '端口配置': string[] | string }

const activateTab = ref("view")
const containerInfo = (useDockerStore().currentConDetail as ContainerInfo)
const details = ref<Details>()
const EnvValue = ref({})

if (containerInfo) {
  let portList: string[] = []
  if (containerInfo.HostConfig.PortBindings) {
    portList = Object.entries(containerInfo.HostConfig.PortBindings).map(([portType, entries]) =>
        entries.map(entry => `${entry.HostPort}-->${portType}`).join(', ')
    );
  }
  details.value = {
    "镜像": containerInfo.Image,
    "端口配置": portList,
    "CMD": ((CmdValue: string[] | null) =>
        !CmdValue ? '' : CmdValue.join(' '))(containerInfo.Config.Cmd),
    "ENTRYPOINT": ((EntryPointValue: string[] | null) =>
        !EntryPointValue ? '' : EntryPointValue.join(' '))(containerInfo.Config.Entrypoint),
  }
  containerInfo.Config.Env.forEach((entry) => {
    const entrySplit = entry.split('=')
    EnvValue.value[entrySplit[0]] = entrySplit[1]
  })
}

</script>

<template>
  <el-tabs
      v-model="activateTab"
      type="card"
      class="tabs-card"
  >
    <el-tab-pane label="视图展示" name="view">
      <div class="Table pl-[2rem] w-full h-[50rem] overflow-auto">
        <div class="title text-[2rem] mb-[1rem]">容器详情</div>
        <div v-for="(value, key) in details" :key="key" class="item">
          <div class="w-[15%]">{{ key }}</div>
          <template v-if="key!='端口配置'">
            <div class="flex-1" style="overflow-inline: auto">{{ value }}</div>
          </template>
          <template v-else>
            <div class="flex-1">
              <div class="port" v-for="port of value">{{ port }}</div>
            </div>
          </template>
        </div>
        <div class="item pt-[2rem]">
          <div class="w-[10%]">ENV</div>
          <el-descriptions
              :column="1"
              border>
            <el-descriptions-item
                v-for="(value, key) of EnvValue"
                :label="key">
              <template #default>
                <span class="inline-block whitespace-pre-line w-[25rem]">{{ value }}</span>
              </template>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="文件展示" name="file">
      <div class="h-[54rem] overflow-auto">
        <v-ace-editor :value="JSON.stringify(containerInfo, null, 2)"
                      lang="json"
                      theme="monokai"
                      readonly
                      :print-margin="false"
                      :options="{showPrintMargin: false, showLineNumbers: true, wrapBehavioursEnabled: true, indentedSoftWrap: true}"
                      class="h-full relative" />
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>

</style>