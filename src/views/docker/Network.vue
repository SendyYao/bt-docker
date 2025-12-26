<script setup lang="ts">

import {ref} from "vue";
import type {HostNetworkResp} from "@/types/ContainerStats.ts";
import axiosInstance from "@/axios.ts";
import BtDialog from "@/components/common/BtDialog.vue";
import {ArrowDown} from "@element-plus/icons-vue";
import BtNetTable from "@/components/common/BtNetTable.vue";
import BtFeedback from "@/components/common/BtFeedback.vue";

const tableData = ref<HostNetworkResp>()

const tabFilter = ref([
  {name: "网络名", disabled: true, checked: true, prop: "name"},
  {name: "设备", checked: true, prop: "driver"},
  {name: "ipv4网络号", checked: true, prop: "subnet"},
  {name: "ipv4网关", checked: true, prop: "gateway"},
  {name: "ipv6网络号", checked: false, prop: "subnetv6"},
  {name: "ipv6网关", checked: false, prop: "gatewayv6"},
  {name: "标签", checked: true, prop: "labels"},
  {name: "创建时间", checked: true, prop: "time"},
  {name: "操作", disabled: true, checked: true}
])

const formValue = ref({
  Name: '',
  Device: 'bridge',
  Subnet: '',
  Gateway: '',
  IPV4Range: '',
  EnableIPV6: false,
  SubnetV6: '',
  GatewayV6: '',
  Remark: '',
})

const deviceOption = ['bridge', 'ipvlan', 'macvlan', 'overlay']

const dialogVisible = ref(false)
const feedbackVisible = ref(false)

const showMoreConfig = ref(false)

const fetchHostNetworkConfig = async () => {
  try {
    const response = await axiosInstance.post(
        "/btdocker/network/get_host_network"
    )
    tableData.value = response.data
  } catch (error) {
    console.log(error)
  }
}

if (!tableData.value) {
  console.log("获取数据")
  fetchHostNetworkConfig()
}
</script>

<template>
  <div class="relative container-table-tab p-[1.6rem]">
    <bt-net-table :tab-filter="tabFilter" :table-data="tableData" page-name="Network">
      <template #header-left>
        <div class="flex flex-shrink-0">
          <div class="flex items-center">
            <div class="flex items-center">
              <el-button type="primary" @click="dialogVisible=true">添加网络</el-button>
              <el-button type="default">清理网络</el-button>
            </div>
            <a class="ml-[1rem] bt-link" @click="feedbackVisible=true">需求反馈</a>
          </div>
        </div>
      </template>
    </bt-net-table>
    <bt-dialog
        v-model="dialogVisible"
        title="添加网络"
        @close="dialogVisible=false"
    >
      <div class="h-[inherit]">
        <div class="p-[1.6rem] !h-[inherit]">
          <el-form label-position="right">
            <el-form-item required label="网络名">
              <template #default>
                <div class="!w-[40rem]">
                  <el-input v-model="formValue.Name"
                            :placeholder="formValue.Name"
                            autocomplete="off"
                            style="width: 100%"
                  />
                </div>
              </template>
            </el-form-item>
            <el-divider class="w-full" direction="horizontal" content-position="center"
                        style="--el-border-style: solid">
              <template #default>
                <div class="flex items-center w-full" @click="showMoreConfig = !showMoreConfig">
                  <span class="bt-link mr-[4px]">{{ showMoreConfig == false ? '展开' : '收起' }}更多配置</span>
                  <el-icon style="color: rgb(102 102 102); font-size: 16px; height: 16px; line-height: 16px">
                    <ArrowDown/>
                  </el-icon>
                </div>
              </template>
            </el-divider>
            <template v-if="showMoreConfig">
              <el-form-item label="设备">
                <el-select v-model="formValue.Device" placeholder="bridge">
                  <el-option v-for="item in deviceOption"
                             :key="item"
                             :label="item"
                             :value="item"
                  />
                </el-select>
              </el-form-item>
              <div class="flex flex-wrap w-full">
                <el-form-item label="ipv4子网">
                  <el-input v-model="formValue.Subnet" placeholder="例: 124.42.0.0/16"/>
                </el-form-item>
                <el-form-item label="ipv4网关">
                  <el-input v-model="formValue.Gateway" placeholder="例: 124.42.0.254"/>
                </el-form-item>
              </div>
              <el-form-item label="ipv4范围">
                <div class="!w-[40rem]">
                  <el-input v-model="formValue.IPV4Range" placeholder="例: 124.42.0.0/24"/>
                </div>
              </el-form-item>
              <el-form-item label="开启IPV6" label-position="left">
                <el-switch v-model="formValue.EnableIPV6"/>
              </el-form-item>
              <template v-if="formValue.EnableIPV6">
                <div class="flex flex-wrap w-full">
                  <el-form-item label="IPV6子网" required label-position="left">
                    <el-input v-model="formValue.SubnetV6" placeholder="例: 2001:db8::/48"/>
                  </el-form-item>
                  <el-form-item label="IPV6网关" required label-position="left">
                    <el-input v-model="formValue.GatewayV6" placeholder="例: 2001:db8::1"/>
                  </el-form-item>
                </div>
              </template>
              <el-form-item label="备注">
                <el-input type="textarea" placeholder="请输入备注" v-model="formValue.Remark"/>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-between flex-row-reverse">
          <div>
            <el-button type="warning" @click="dialogVisible=false">取消</el-button>
            <el-button type="primary" @click="() => {console.log(formValue); dialogVisible=false}">添加</el-button>
          </div>
        </div>
      </template>
    </bt-dialog>
    <bt-feedback feedback-component="docker"
                 v-model:show-feedback="feedbackVisible"/>
  </div>
</template>

<style scoped>

</style>