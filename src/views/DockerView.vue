<script setup lang="ts">
import {type Component, defineAsyncComponent, onMounted, ref, shallowRef} from "vue";
import router from "@/router";
import BtSwitch3 from "@/components/common/BtSwitch3.vue";

const headerTabs = {
  AppStore: {id: 1, name: "应用商店", url: "/docker/appstore"},
  ConManger: {id: 2, name: "总览", url: "/docker/conmanger"},
  DockerSite: {id: 3, name: "网站", url: "/docker/dockersite"},
  Containers: {id: 4, name: "容器", url: "/docker/containers"},
  CloudImages: {id: 5, name: "线上镜像", url: "/docker/cloudimages"},
  Images: {id: 6, name: "本地镜像", url: "/docker/images"},
  Orchestration: {id: 7, name: "容器编排", url: "/docker/orchestration"},
  Network: {id: 8, name: "网络", url: "/docker/network"},
  Storage: {id: 9, name: "存储卷", url: "/docker/storage"},
  WareHose: {id: 10, name: "仓库", url: "/docker/warehouse"},
  Setting: {id: 11, name: "设置", url: "/docker/setting"},
  DockerInstall: {id: 12, name: "Docker安装", url: "/docker/dockerinstall", disabled: true}
}
const modules = import.meta.glob<Component>('@/views/docker/*.vue')
const activeComponent = shallowRef<Component>()
const selectItemIndex = ref(0)
const currentPath = router.currentRoute.value.fullPath
const opts = [
  { label: "Light", value: "light", color: "#ef0808", index: 0 },
  { label: "Dark", value: "dark", color: "#f0ad4e", index: 1 },
  { label: "Super Dark", value: "super-dark", color: "#20a53a", index: 2 },
]
const currentMode = ref("light")

console.log(currentPath)

function switchTab(ComponentName: string, index: number, url: string) {
  if (selectItemIndex.value != index) {
    // console.log(ComponentName, url)
    selectItemIndex.value = index
    router.push(`${url}`)
    if (['ConManger', 'Containers', 'Network', 'Storage'].includes(ComponentName)) {
      activeComponent.value = defineAsyncComponent(modules[`/src/views/docker/${ComponentName}.vue`])
    } else {
      activeComponent.value = defineAsyncComponent(() => import('@/views/docker/Others.vue'))
    }
  }
}

function switchTheme(index: number) {
  const docStyle = document.documentElement.style;
  const styleList = ['', 'invert(85%) hue-rotate(180deg)', 'invert(100%) hue-rotate(180deg)'];
  let modeIndex: string | number | null = index !=null ?  index : sessionStorage.getItem('modeIndex')

  if (modeIndex == null) {
    console.log("sessionStorage")
    sessionStorage.setItem('modeIndex', '0')
    setTimeout(switchTheme, 500)

  } else {
    modeIndex = typeof modeIndex == "string" ? parseInt(modeIndex) : modeIndex
    modeIndex = index==null ? modeIndex >= styleList.length - 1 ? 0 : modeIndex + 1 : index
    sessionStorage.setItem('modeIndex', modeIndex.toString())
    docStyle.filter = styleList[modeIndex];
    console.log(index, modeIndex, docStyle.filter, currentMode.value)
  }
  document.body.querySelectorAll('img, picture, video, div.thumb')
      .forEach(el => (el as HTMLElement).style.filter = modeIndex ? 'invert(1) hue-rotate(180deg)' : '')
}

const layoutMinHeight = window.innerHeight
onMounted(() => {
  const themeIndex = opts.flatMap(entry => {
    if (entry.value == currentMode.value)
    {return entry.index}
  }).filter(item => item != undefined)[0]
  switchTheme(themeIndex)
})
</script>

<template>
  <div id="layout-main"
       class="w-full p-[8px]"
       :style="`min-height: ${layoutMinHeight}px`"
  >
    <!-- style="min-height: 835px" -->
    <div class="docker-tab-container animate-animated">
      <div class="flex flex-col" :class="activeComponent?.name?.toLowerCase()">
        <div class="header-tabs">
          <div class="flex flex-wrap">
            <template
                v-for="[ComponentName, Index, Name, Url, Disabled] of Object.entries(headerTabs).map(([componentName, entry]) => [componentName, entry.id, entry.name, entry.url, entry['disabled']])">
              <div class="header-child-tab"
                   :class="{'active-tab': selectItemIndex === Index, '!hidden': Disabled}"
                   @click="switchTab(ComponentName, Index, Url)">
                {{ Name }}
              </div>
            </template>
          </div>
          <div class="switchTheme">
            <el-dropdown title="Utils面板" trigger="hover" popper-class="utils-popper">
              <i class="svgtofont-icon-tools text-[red]" style="font-size: 2rem"/>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <bt-switch3 v-model="currentMode" :options="opts"
                                @click.stop
                                @mouseup.stop
                                @change="switchTheme(opts.flatMap(entry => {if (entry.value == currentMode) {return entry.index}}).filter(item => item != undefined)[0])"/>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div>
          <div class="docker-route-con">
            <component :is="activeComponent"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

#layout-main {
  overflow-y: hidden;
  --un-bg-opacity: 1;
  background-color: rgb(243 243 243 / var(--un-bg-opacity));
}

.header-tabs {
  position: relative;
  height: fit-content;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  --un-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--un-bg-opacity));
  box-shadow: 0 1px 3px 1px rgba(0, 0, 0, .05) !important;
  flex-wrap: wrap !important;
}

.header-child-tab {
  display: inline-block;
  height: 52px;
  cursor: pointer;
  border-radius: 5px;
  padding-left: 22px;
  padding-right: 22px;
  font-size: 16px;
  --un-text-opacity: 1;
  color: rgb(102 102 102 / var(--un-text-opacity));
  line-height: 52px;
}

.active-tab {
  position: relative;
  --un-text-opacity: 1;
  color: rgb(32 165 58 / var(--un-text-opacity))
}

.active-tab:after {
  position: absolute;
  left: 50%;
  bottom: 0;
  margin-left: -15%;
  display: block;
  width: 30%;
  height: 2px;
  --un-bg-opacity: 1;
  background-color: rgb(32 165 58 / var(--un-bg-opacity));
  content: "";
}

.switchTheme {
  margin-right: 3rem;
}

.docker-route-con {
  position: relative;
  margin-top: 12px;
  border-radius: 5px;
  --un-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--un-bg-opacity));
}

</style>