<script setup lang="ts">
import {ref} from "vue";
import BtNetTable from "@/components/common/BtNetTable.vue";
import axiosInstance from "@/axios.ts";
import type { Container } from "@/types/Container";
import type {HostNetworkResp} from "@/types/ContainerStats.ts";

type ContainerNetworkInfo = Record<"Name" | "IPV4Address" | "IPV6Address" | "Gateway" | "MACAddress", string>

const tabFilter = ref([
  {name: "网络名", disabled: true, checked: true, prop: "Name"},
  {name: "IPV4地址", checked: true, prop: "IPV4Address"},
  {name: "IPV6地址", checked: false, prop: "IPV6Address"},
  {name: "网关", checked: true, prop: "Gateway"},
  {name: "MAC地址", checked: true, prop: "MACAddress"},
  {name: "操作", disabled: true, checked: true}
])

const prop = defineProps<{container: Container}>()

const HostNetworkConfig = ref<HostNetworkResp>();

const selectedNetwork = ref<string>()

const options = ref<{title: string, value: string}[]>();

const tableData = ref<ContainerNetworkInfo[] | null>(null);

const fetchHostNetworkConfig = async () => {

  try {
    const response = await axiosInstance.post(
        "/btdocker/network/get_host_network"
    )
    HostNetworkConfig.value = response.data
  } catch (error) {
    console.log(error)
  }
}

const setTableData = async () => {
  await fetchHostNetworkConfig()
  options.value = (HostNetworkConfig.value as HostNetworkResp).flatMap(entry => {
    if (entry.name && entry.id) {
      return [{
        title: entry.name,
        value: entry.id
      }]
    }
    return [];
  })
  // console.log("Current Container ID: ", prop.container.id)
  // console.log("HostNetworkConfig: ", HostNetworkConfig.value)
  tableData.value = (HostNetworkConfig.value as HostNetworkResp).flatMap(entry => {
    const item = entry.containers[prop.container.id];
    return item
        ? [
          {
            Name: entry.name,
            IPV4Address: item.IPv4Address.replace('/16', ''),
            IPV6Address: item.IPv6Address,
            Gateway: entry.gateway,
            MACAddress: item.MacAddress
          }
        ]
        : [];
  })
}

if (!HostNetworkConfig.value) {
  console.log("获取数据")
  setTableData()
}

</script>

<template>
  <bt-net-table page-name="ContainerNet" :tab-filter="tabFilter" :table-data="tableData">
    <template #header-left>
      <div class="flex flex-shrink-0">
        <el-select
            class="!w-[20rem]"
            v-model="selectedNetwork"
            placeholder="请选择"
            @change="console.log('selectedNetwork: ' + selectedNetwork)">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.title"
              :value="item.value"
          />
        </el-select>
        <el-button class="!ml-[1rem]" type="primary">加入网络</el-button>
      </div>
    </template>
  </bt-net-table>

</template>

<style scoped>

</style>