<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import type {Container} from "@/types/Container";
import type {FormInstance, FormRules} from "element-plus";
import type {ImageList} from "@/types/ImageList";
import CommonDockerRequest from "@/utils/request.ts";
import type {HostNetworkResp} from "@/types/ContainerStats.ts";
import {useDockerStore} from "@/store/dockerStore.ts";
import type {ContainerInfo} from "@/types/ContainerInfo";
import type {MountedVolumeList} from "@/types/MountedVolumeList.ts";
import BtConfirm from "@/components/common/BtConfirm.vue";

interface ContainerEditForm {
  name: string,
  image: string
}

interface PortData {
  localPort: number | null,
  containerPort: number | null,
  externalExposure: boolean,
  networkProtocol: string[]
}

interface NetData {
  name: string | null,
  ipv4Address: string | null,
  ipv6Address: string | null
}

interface MountData {
  mode: string,
  data: {mountDir: string | undefined, jurisdiction: string, containerDir: string | undefined}
}

interface DetailData {
  command: string,
  entrypoint: string,
  autoRemove: boolean,
  consoleInteraction: {
    Tty: boolean,
    OpenStdin: boolean,
    Privileged: boolean
  },
  MemoryReservation: number,
  CpuQuota: number,
  Memory: number,
  Label: string,
  Env: string
}

type ImageItem = Record<"name" | "id" | "size", string>

type TargetVolumeOption = Record<"name" | "mountPoint", string>

const prop = defineProps<{container: Container}>()

const currentContDetail = useDockerStore().currentConDetail as ContainerInfo

const imageList = ref<ImageItem[]>([])
const targetVolumeOptions = ref<TargetVolumeOption[]>([])
const containerPortData = ref<PortData[]>([])
const containerNetData = ref<NetData[]>([])
const containerMountData = ref<MountData[]>([])
const detailData = ref<DetailData>({
  command: '',
  entrypoint: '',
  autoRemove: false,
  consoleInteraction: {
    Tty: false,
    OpenStdin: false,
    Privileged: false
  },
  MemoryReservation: 0,
  CpuQuota: 0,
  Memory: 0,
  Label: '',
  Env: ''
})
const consoleSettings = ref<string[]>([])

const FormRef = ref<FormInstance>()
const Form = reactive({
  id: prop.container.id,
  new_name: prop.container.name,
  new_image: prop.container.image,
  new_publish_all_ports: false,
  new_ports: containerPortData.value,
  new_restart_policy: {Name: "no"},
  network_info: containerNetData.value,
  new_volumes: containerMountData.value,
  new_command: detailData.value.command,
  new_entrypoint: detailData.value.entrypoint,
  new_auto_remove: detailData.value.autoRemove,
  new_tty: detailData.value.consoleInteraction.Tty,
  new_stdin_open: detailData.value.consoleInteraction.OpenStdin,
  new_privileged: detailData.value.consoleInteraction.Privileged,
  new_mem_reservation: detailData.value.MemoryReservation,
  new_cpu_quota: detailData.value.CpuQuota,
  new_mem_limit: detailData.value.Memory,
  new_labels: detailData.value.Label,
  new_environments: detailData.value.Env
})

const Strategies = [
  {label: "不重启", value: "no"},
  {label: "失败后重启(默认重启5次)", value: "on-failure"},
  {label: "仅非正常退出时重启", value: "unless-stopped"},
  {label: "停止后马上重启", value: "always"}
]
const HostNetworkOptions = ref<{title: string, value: string}[]>();
const HostNetworkConfig = ref<HostNetworkResp>();

const unCustomNetwork = ['bridge', 'host']

const mountOptions = [
  {label: "本机目录", value: "dir"},
  {label: "挂载卷", value: "volume"}
]

const LimitOptions = ref([
  {
    label: "最小分配内存",
    appendLabel: "MB",
    key: "new_mem_reservation",
    max: Math.floor(useDockerStore().maxMem / (1024 * 1024)),
    value: useFormField("new_mem_reservation")
  },
  {
    label: "CPU限制",
    appendLabel: "核",
    key: "new_cpu_quota",
    max: useDockerStore().maxCPU,
    value: useFormField("new_cpu_quota")
  },
  {
    label: "内存限制",
    appendLabel: "MB",
    key: "new_mem_limit",
    max: Math.floor(useDockerStore().maxMem / (1024 * 1024)),
    value: useFormField("new_mem_limit")
  }
])

const LastTwoTextAreas = ref([
  {
    label: "标签",
    key: "new_labels",
    placeholder: "容器标签，一行一个，例：key=value",
    value: useFormField("new_labels")
  },
  {
    label: "环境变量",
    key: "new_environments",
    placeholder: "添加环境变量格式如下，有多个请换行添加：\nJAVA_HOME=/usr/local/java8\nHOSTNAME=master",
    value: useFormField("new_environments")
  }
])

const Rule = reactive<FormRules<ContainerEditForm>>({
  name: [
    {required: true, message: "请输入容器名", trigger: 'blur'}
  ],
  image: [
    {required: true, message: "请选择镜像", trigger: 'change'}
  ]
})

const showMoreInfo = ref(false)

const createFilter = (queryString: string) => {
  return (image: ImageItem) => {
    return (
        image.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const querySearch = (queryString: string, cb) => {
  const results = queryString
      ? imageList.value.filter(createFilter(queryString))
      : imageList.value
  cb(results)
}

const handleSelect = (item: ImageItem) => {
  console.log(item)
  Form.new_image = item.name
}

function useFormField(key: string) {
  return computed({
    get: () => Form[key],
    set: (v) => {
      // 防止 slider 接受空字符串
      Form[key] = (v === "" || v == null) ? 0 : v
    }
  })
}

function outputForm() {
  // 2025-11-24 Process Form.new_ports & Form.new_volumes type
  const processedPortsData = ref<{[property: string]: string | string[]}>({})
  const processedMountData = ref<{[property: string]: {bind: string, mode: string}}>({})
  Form.new_ports.forEach(item => {
    if (item.networkProtocol.length != 0) {
      const key = item.localPort+"/"+item.networkProtocol.join('/')
      processedPortsData.value[key] = item.externalExposure
          ? (item.containerPort as number).toString()
          : ["127.0.0.1", (item.containerPort as number).toString()]
    }
  });
  Form.new_volumes.forEach(item => {
    processedMountData.value[item.data.mountDir ?? ''] = {
      bind: item.data.containerDir ?? '',
      mode: item.data.jurisdiction
    }
  })
  Form.new_tty = consoleSettings.value.includes("-t")
  Form.new_stdin_open = consoleSettings.value.includes("-i")
  const processedForm = {
    ...Form
  }
  processedForm.new_ports = (processedPortsData.value as any)
  processedForm.new_volumes = (processedMountData.value as any)
  confirmOptions.value.showConfirm = false
  console.log(processedForm)
}

const confirmOptions = ref({
  showConfirm: false,
  confirmTitle: `编辑容器【${prop.container.name}】`,
  confirmContent: {
    prepend: "【command、entrypoint，标签和环境变量】",
    dangerous: "配置错误可能导致编辑后的容器无法运行或者丢失",
    append: ",请谨慎操作"
  },
  confirmKeyWord: "确认无误",
})

onMounted(async () => {
  if (imageList.value.length == 0) {
    const imageListResponseData: ImageList = await new CommonDockerRequest().createRequest<ImageList>('image/image_list', null, 1)
    imageListResponseData.forEach(value => {
      imageList.value.push({
        name: value.name,
        id: value.id.slice(7, 19),
        size: (value.size / (1024 * 1024)).toFixed(2) + " MB"
      })
    })
  }
  if (containerPortData.value.length == 0) {
    const result = (prop.container.ports as string[]).map(item => {
      const match = item.match(/:(\d+).*?-->(\d+)\/(\w+)/);
      if (match) {
        const [, localPort, containerPort, networkProtocol] = match;
        return {
          localPort,
          containerPort,
          externalExposure: true,
          networkProtocol: Array(networkProtocol)
        };
      }
      return {
        localPort: 80,
        containerPort: 80,
        externalExposure: true,
        networkProtocol: ["tcp"]
      }
    }).filter(Boolean);
    Form.new_ports = containerPortData.value = result as PortData[]
  }
  if (containerNetData.value.length == 0) {
    HostNetworkConfig.value = await new CommonDockerRequest().createRequest<HostNetworkResp>('network/get_host_network', null, 1)
    HostNetworkOptions.value = (HostNetworkConfig.value).flatMap(entry => {
      if (entry.name && entry.id) {
        return [{
          title: entry.name,
          value: entry.id
        }]
      }
      return [];
    })
    containerNetData.value.push(
        {name:"bridge", ipv4Address:"172.19.0.2", ipv6Address:null}
    )
  }
  if (containerMountData.value.length == 0) {
    const ContainerVolumeData = currentContDetail.Mounts
    ContainerVolumeData.forEach(dataItem => {
      containerMountData.value.push(
          {mode: "dir", data: {mountDir: dataItem.Source, jurisdiction: (dataItem.Mode as string), containerDir: dataItem.Destination}}
      )
    })
  }
  if (targetVolumeOptions.value.length == 0) {
    const targetVolumeList: MountedVolumeList = await new CommonDockerRequest()
        .createRequest<MountedVolumeList>('/volume/get_volume_list', null, 1)
    targetVolumeList.forEach(value => {
      targetVolumeOptions.value?.push({name: value.Name, mountPoint: value.Mountpoint})
    })
  }
  if (currentContDetail.Config) {
    const config = currentContDetail.Config; const hostConfig = currentContDetail.HostConfig
    const detail = detailData.value
    Form.new_command = detail.command = config.Cmd != null ? config.Cmd.join('\n') : ""
    Form.new_entrypoint = detail.entrypoint = config.Entrypoint.join('\n')
    Form.new_auto_remove = detail.autoRemove = hostConfig.AutoRemove
    Form.new_tty = detail.consoleInteraction.Tty = config.Tty
    if (Form.new_tty) consoleSettings.value.push("-t")
    Form.new_stdin_open = detail.consoleInteraction.OpenStdin = config.OpenStdin
    if (Form.new_stdin_open) consoleSettings.value.push("-i")
    Form.new_privileged = detail.consoleInteraction.Privileged = hostConfig.Privileged
    Form.new_mem_reservation = detail.MemoryReservation = hostConfig.MemoryReservation
    Form.new_cpu_quota = detail.CpuQuota = hostConfig.CpuQuota
    Form.new_mem_limit = detail.Memory = hostConfig.Memory
    Form.new_labels = detail.Label = Object.entries(config.Labels)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    Form.new_environments = detail.Env = config.Env.join('\n')
  }
})
</script>

<template>
  <div class="container-dialog" style="max-height: 595px">
    <el-form ref="FormRef" label-position="right" size="default" :model="Form" :rules="Rule">
      <div class="pb-[0]">
        <el-form-item label="容器名称" required prop="name">
          <el-input style="width: 40rem" placeholder="请输入容器名称" v-model="Form.new_name" id="name" />
        </el-form-item>
        <el-form-item label="镜像" required prop="image">
          <el-autocomplete
              v-model="Form.new_image"
              :fetch-suggestions="querySearch"
              class="!w-[40rem]"
              popper-class="my-autocomplete"
              placeholder="请输入或选择镜像"
              value-key="name"
              @select="handleSelect"
              id="image"
          >
            <template #default="{ item }">
              <div class="flex items-center justify-between py-[1rem]" :title="item.name">
                <div class="max-w-[25rem]">
                  <div class="text-[1.4rem] leading-[1.4] max-w-[25rem] truncate">{{ item.name }}</div>
                  <div class="text-[1.2rem] leading-[1.2] text-[#ccc] mt-[1rem]">{{ item.id }}</div>
                </div>
                <span class="name">{{ item.size }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <span class="inline-block ml-[10rem]">*可直接输入docker.io中的本地未下载的镜像直接创建容器</span>
        <el-form-item label="端口" class="!mt-[1.6rem]">
          <el-radio-group class="flex items-center" v-model="Form.new_publish_all_ports">
            <el-radio-button label="暴露端口" value="0" content="port"/>
            <el-radio-button label="暴露所有" value="1" content="all"/>
          </el-radio-group>
        </el-form-item>
        <div class="my-[1rem] ml-[10rem]" :style="Form.new_publish_all_ports ? 'display: none' : ''">
          <el-table class="w-full mb-[10px]"
                    :header-cell-style="{background:'#f0f0f1'}"
                    fit
                    :data="Form.new_ports"
          >
            <el-table-column label="本地端口" width="159px">
              <template #default="{row}">
                <el-input size="small" placeholder="例如：80" v-model="row.localPort"/>
              </template>
            </el-table-column>
            <el-table-column label="容器" width="158px">
              <template #default="{row}">
                <el-input size="small" placeholder="例如：80" v-model="row.containerPort"/>
              </template>
            </el-table-column>
            <el-table-column label="对外暴露" width="100px">
              <template #header>
                <div class="flex items-center">
                  <span>对外暴露</span>
                  <el-popover content="允许外部访问会将端口映射出去,所有人都可以访问这个端口(不建议)"
                              width="420px"
                              effect="dark"
                              placement="top">
                    <template #reference>
                      <span class="ml-4px bt-ico-ask">?</span>
                    </template>
                  </el-popover>
                </div>
              </template>
              <template #default="{row}">
                <el-switch size="small" v-model="row.externalExposure"/>
              </template>
            </el-table-column>
            <el-table-column label="协议" width="200px">
              <template #default="{row, $index}">
                <div class="flex items-center">
                  <el-checkbox-group v-model="row.networkProtocol" size="small">
                    <el-checkbox-button key="tcp" value="tcp">TCP</el-checkbox-button>
                    <el-checkbox-button key="udp" value="udp">UDP</el-checkbox-button>
                  </el-checkbox-group>
                  <el-button class="!ml-[1rem] h-[2.8]" @click="(containerPortData).splice($index, 1)">
                    <span class=""><i class="svgtofont-el-delete"/></span>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-button title="添加端口" @click="(containerPortData).push(
              {localPort: null, containerPort: null, externalExposure: false, networkProtocol: ['tcp']}
              )">添加</el-button>
        </div>
      </div>
      <el-form-item label="重启规则" class="!mt-[.8rem]" prop="strategy" key="重启规则">
        <el-radio-group v-model="Form.new_restart_policy.Name">
          <template v-for="strategy in Strategies.slice(0,3)">
            <el-radio class="!leading-[2.5rem]" :label="strategy.label" :value="strategy.value" />
          </template>
          <el-radio class="!leading-[2.5rem]" :label="Strategies[3].label" :value="Strategies[3].value">
            {{Strategies[3].label}}
            <el-tooltip content="服务器重启时也会马上重启" placement="top">
              <i class="svgtofont-el-info-filled text-warning" style="color: rgb(230 162 60)"/>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="flex items-center cursor-pointer pl-[10rem] my-[2rem] px-[2rem]"
           @click="showMoreInfo=!showMoreInfo">
        <i :class="!showMoreInfo ? 'svgtofont-el-arrow-right' : 'svgtofont-el-arrow-down'" />
        <div class="ml-[1rem] text-[#20a53a] w-[16rem] select-none">
          更多设置,{{showMoreInfo == false ? "点击查看" : "点击收回"}}
        </div>
      </div>
      <div class="pt-[0]" :style="!showMoreInfo ? 'display: none' : '' ">
        <el-form-item label="网络">
          <div class="w-full">
            <el-table fit
                    class="w-full"
                    :header-cell-style="{background:'#f0f0f1'}"
                    :data="Form.network_info"
          >
            <el-table-column label="网络名称" prop="name">
              <template #default="{row, $index}">
                <div class="h-[3rem]">
                  <el-select class="!w-[20rem]" v-model="Form.network_info[$index].name" placeholder="请选择">
                    <el-option v-for="item in HostNetworkOptions"
                               :key="item.value"
                               :value="item.title"
                               :label="item.title" />
                  </el-select>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="IPV4地址">
              <template #default="{row, $index}">
                <el-input placeholder="例如: 172.20.xx"
                          v-model="Form.network_info[$index].ipv4Address"
                          :disabled="unCustomNetwork.includes((Form.network_info[$index].name as string))"/>
              </template>
            </el-table-column>
            <el-table-column label="IPV6地址">
              <template #default="{row, $index}">
                <div class="flex items-center">
                  <el-input :placeholder="unCustomNetwork.includes((Form.network_info[$index].name as string)) ? '自定义网卡可以设置' : '例如: 2001:0db8::1'"
                            v-model="Form.network_info[$index].ipv6Address"
                            :disabled="unCustomNetwork.includes((Form.network_info[$index].name as string))"
                  />
                  <el-button class="!ml-[1rem] h-[2.8]" @click="containerNetData.splice($index, 1)">
                    <span class="">
                      <i class="svgtofont-el-delete"></i>
                    </span>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
            <el-button class="!mt-[1rem]" @click="containerNetData.push(
              {name: null, ipv4Address: null, ipv6Address: null}
              )">
              添加网络
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="挂载/映射">
          <template #default>
            <div class="border-[#ececec] border rounded-[.2rem] mb-[1rem] p-[1.5rem] w-full"
                 v-for="(mountDataItem,index) in containerMountData">
              <div class="flex items-center justify-between mb-[1.5rem]">
                <el-radio-group :options="mountOptions" v-model="containerMountData[index].mode">
                  <el-radio-button label="本机目录" value="dir"/>
                  <el-radio-button label="挂载卷" value="volume"/>
                </el-radio-group>
                <el-button class="!ml-[4rem]" @click="containerMountData.splice(index, 1)">
                  <span class>
                    <i class="svgtofont-el-delete" />
                  </span>
                </el-button>
              </div>
              <div class="flex items-center text-[1.2rem]">
                <div :style="containerMountData[index].mode == 'volume' ? '' : 'display: none'">
                  <div class="px-[.2rem] py-[.4rem]">挂载卷</div>
                  <el-select class="!w-[17rem]" v-model="mountDataItem.data.mountDir"
                             placeholder="请选择"
                             placement="bottom">
                    <el-option v-for="option in targetVolumeOptions"
                               :label="option.name"
                               :value="option.mountPoint"
                    />
                  </el-select>
                </div>
                <div :style="containerMountData[index].mode == 'dir' ? '' : 'display: none'">
                  <div class="px-[.2rem] py-[.4rem]">挂载目录</div>
                  <el-input class="!w-[17rem]" style="width: 100%" v-model="mountDataItem.data.mountDir"
                            placeholder="请输入镜像路径">
                    <!-- Open FileDialog to choose a file path -->
                    <template #append>
                      <el-button class="cursor-pointer">
                        <span class="">
                          <i class="svgtofont-icon-file_mode"
                             style="color: rgb(102, 102, 102); font-size: 16px; height: 16px; line-height: 16px"/>
                        </span>
                      </el-button>
                    </template>
                  </el-input>
                </div>
                <div class="ml-[1rem]">
                  <div class="px-[.2rem] py-[.4rem]">权限</div>
                  <el-select class="!w-[17rem]" v-model="mountDataItem.data.jurisdiction">
                    <el-option label="读写" value="rw" />
                    <el-option label="只读" value="ro" />
                  </el-select>
                </div>
                <div class="ml-[1rem]">
                  <div class="px-[.2rem] py-[.4rem]">容器目录</div>
                  <el-input style="width: 17rem" v-model="mountDataItem.data.containerDir"></el-input>
                </div>
              </div>
            </div>
            <el-button @click="containerMountData.push(
                {mode: 'dir', data: {mountDir: '', jurisdiction: 'ro', containerDir: ''}}
                )">
              添加
            </el-button>
          </template>
        </el-form-item>
        <el-form-item label="command">
          <el-input type="textarea" style="width: 24rem" placeholder="一行一个" :rows="2"
                    v-model="Form.new_command"/>
        </el-form-item>
        <el-form-item label="entrypoint">
          <el-input style="width: 24rem" v-model="Form.new_entrypoint"/>
        </el-form-item>
        <el-form-item class="!mt-[.8rem]" label=" ">
          <el-checkbox label="退出容器后自动删除容器" v-model="Form.new_auto_remove"/>
        </el-form-item>
        <el-form-item class="!mt-[.8rem]" label="控制台交互">
          <el-checkbox-group v-model="consoleSettings">
            <el-checkbox label="伪终端(-t)" value="-t"/>
            <el-checkbox label="标准输入(-i)" value="-i"/>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="!mt-[0rem]" label=" ">
          <el-checkbox label="特权模式" v-model="Form.new_privileged"/>
        </el-form-item>
        <el-form-item v-for="limitOption in LimitOptions"
                      :label="limitOption.label"
                      :key="limitOption.label"
                      class="!mt-[1.4rem]">
          <div class="flex items-center">
            <el-slider class="!w-[20rem] pl-[.6rem]"
                       :max="limitOption.max"
                       v-model="limitOption.value"/>
            <div class="inline-flex ml-[1.2rem] items-center flex-nowrap">
              <div class="mr-[0.8rem] !w-[8rem]">
                <el-input class="mr-[0.8rem] !w-[8rem]"
                          type="text"
                          v-model="limitOption.value"
                          style="width: 100%"
                          :modelModifiers="{number: true}"
                />
              </div>
              <span class="unit">{{ limitOption.appendLabel }} (最大值: {{ limitOption.max }})</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-for="lastTwoTextarea in LastTwoTextAreas"
                      :label="lastTwoTextarea.label"
                      :key="lastTwoTextarea.label">
          <el-input type="textarea"
                    v-model="lastTwoTextarea.value"
                    :rows="5"
                    tabindex="0"
                    autocomplete="off"
                    :key="lastTwoTextarea.key"
                    :placeholder="lastTwoTextarea.placeholder"
                    style="min-height: 28px;"
          />
        </el-form-item>
    </div>
      <el-button class="ml-[10rem] mb-[54px]" type="primary" @click="confirmOptions.showConfirm=true">保存容器配置</el-button>
    </el-form>
  </div>
  <bt-confirm v-model:showConfirm="confirmOptions.showConfirm"
              :confirmTitle="confirmOptions.confirmTitle"
              :confirmContent="confirmOptions.confirmContent"
              :confirmKeyWord="confirmOptions.confirmKeyWord"
              @check-success="outputForm"
  />
</template>

<style scoped>
.container-dialog {
  display: flex;
  flex-direction: column;
}
.unit {
  font-size: 12px;
  --un-text-opacity: 1;
  color: rgb(102 102 102 / var(--un-text-opacity));
  margin-left: 20px;
  line-height: 22px;
}
</style>