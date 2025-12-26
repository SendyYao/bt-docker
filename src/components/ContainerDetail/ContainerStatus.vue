<script setup lang="ts">
import type {Container} from "@/types/Container";
import axios from "axios";
import {ElMessage} from "element-plus";
import {onMounted, reactive, ref} from "vue";
import {useDockerStore} from "@/store/dockerStore.ts";
import CommonDockerRequest from "@/utils/request.ts";

type ContainerInfo = Record<'Name' | 'ID' | 'Image' | 'operationTime' | 'createdAt' | 'startedAt' | 'Port' | 'IP' | 'IPV6', any>;

const currentConDetail = useDockerStore().currentConDetail

const props = defineProps<{container: Container}>()
const emit = defineEmits<{'update:container': [Container]}>()

const container = reactive({ ...props.container })

const containerDetails = ref<ContainerInfo | {}>({})

const mangeContainer = async (operation: string) => {
    console.log(operation == 'start' ? '启动容器' : '停止容器/重启')
    await new CommonDockerRequest().SetContainerStatus(props.container.id, operation)
    container.status = ['start', 'reload'].includes(operation) ? 'running' : 'exited'
    emit('update:container', container)
    const target = useDockerStore().containerList.find(c => c.id === container.id)
    if (target) target.status = container.status
    // await useDockerStore().refreshContainerList()
    // 缺少get-list 操作
    // await getContainerDetail(props.container.id)
}

const getContainerDetail = async (id: string) => {
  const formData = new FormData();
  formData.append('id', id);
  await axios.post(
      "http://192.168.2.141:8008/btdocker/container/get_container_info",
      formData)
      .then(res => {
        const data = res.data;
        useDockerStore().setCurrentConDetail(data)
        containerDetails.value = {
          Name: props.container.name,
          ID: props.container.id.substring(0,12),
          Image: props.container.image,
          operationTime: Math.floor((new Date().getTime() / 1000 - data['State']['StartedTs']) / 3600).toString()+'小时',
          createdAt: data['Created'].substring(0,19).replace('T', ' '),
          startedAt: data['State']['StartedAt'].substring(0,19).replace('T', ' '),
          Port: props.container.ports,
          IP: data['NetworkSettings']['IPAddress'],
          IPV6: '--'
        }
        // console.log(res.data)
      })
      .catch(error => {
        ElMessage.error("oops:", error)
      })
}

try {
  containerDetails.value = {
    Name: props.container.name,
    ID: props.container.id.substring(0, 12),
    Image: props.container.image,
    operationTime: Math.floor((new Date().getTime() / 1000 - currentConDetail['State']['StartedTs']) / 3600).toString()+'小时',
    createdAt: currentConDetail['Created'].substring(0,19).replace('T', ' '),
    startedAt: currentConDetail['State']['StartedAt'].substring(0,19).replace('T', ' '),
    Port: props.container.ports,
    IP: currentConDetail['NetworkSettings']['IPAddress'],
    IPV6: '--'
  };
} catch (error) {
  getContainerDetail(props.container.id)
}
onMounted(() => {
  if (currentConDetail['Id'] != props.container.id){
    getContainerDetail(props.container.id)
  }
})
</script>

<template>
  <div class="container-dialog">
    <div class="pb-[3rem] border-b border-[#ececec]">
      <div class="flex items-center ml-[2rem]">
        <span>当前状态：</span>
        <span class="ml-[1rem]">{{container.status == 'running' ? '运行中' : '已停止'}}</span>
        <span :class="container.status == 'running' ? 'svgtofont-icon-start text-[#20a53a]' : 'svgtofont-icon-stop text-[#ff0000]'"></span>
      </div>
      <div class="flex mt-[2rem] ml-[2rem]">
        <el-button aria-disabled="false" @click="mangeContainer(container.status == 'running' ? 'stop' : 'start')">{{container.status == 'running' ? '停止' : '启动'}}</el-button>
        <el-button aria-disabled="false" @click="mangeContainer('reload')">重启</el-button>
      </div>
    </div>
    <div class="table ml-[2rem] mt-[2rem]">
      <div v-for="(value, key) in containerDetails" :key="key" class="item">
        <div class="w-[30%]">{{key}}</div>
        <div class="w-[70%] truncate" v-if="key!='Port'">
          <el-tooltip disabled :teleported="false">{{value}}</el-tooltip>
        </div>
        <div class="w-[70%] relative" v-else>
          <div class="py-[1rem] pr-[2rem] min-h-[6.5rem] grid gap-[1rem] h-[5rem] items-center"
               style="grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));"
          >
            <template v-for="singlePort of (containerDetails as ContainerInfo)?.Port">
              <span class="custom-success-tag">{{(singlePort as string).replace('0.0.0.0:', '')}}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-dialog {
  font-size: 1.6rem;
  min-height: 580px;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}
.table .item:not(:last-child) {
  border-bottom-width: 1px;
  --un-border-opacity: 1;
  border-color: rgb(236 236 236 / var(--un-border-opacity));
}
.table .item {
  min-height: 50px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.custom-success-tag {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  border-width: 1px;
  border-color: rgb(211 241 218 / var(--un-border-opacity));
  border-radius: 4px;
  --un-bg-opacity: 1;
  background-color: rgb(233 248 236 / var(--un-bg-opacity));
  padding-left: 7px;
  padding-right: 7px;
  text-align: center;
  --un-text-opacity: 1;
  color: rgb(33 186 69 / var(--un-text-opacity));
  line-height: 20px;
}
* {
  box-sizing: border-box;
}
</style>