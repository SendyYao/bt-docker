<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import type {Container} from "@/types/Container";
import CommonDockerRequest from "@/utils/request.ts";

const prop = defineProps<{container: Container}>()

interface HelpInfo {
  content: string;
  additionContent?: string;
  link?: string;
}

const helpInfo: HelpInfo[] = [
  {content: "粘贴此域名的证书到面板，浏览器即可信任访问"},
  {content: "粘贴您的*.key以及*.pem内容，然后保存即可访问", additionContent: "帮助", link: "https://www.bt.cn/bbs/thread-105443-1-1.html"},
  {content: "如果浏览器提示证书链不完整，请检查是否正确拼接PEM证书"},
  {content: "PEM格式证书 = 域名证书.crt + 根证书(root_bundle).crt"},
  {content: "如需更多设置，请前往", additionContent: "Docker--网站", link: "/docker/dockersite"}
]

const proxyLocalPort = ref<{label: string, value: string}[]>([])

const SSLCertRadio = [
  {label: "不部署证书", value: 'no'},
  {label: "自定义证书", value: 'auto'},
  {label: "选择已有证书", value: 'select'}
]

const proxyForm = reactive({
  status: false,
  bindDomain: "",
  proxyLocalPort: "",
  sslMode: 'no'
})

onMounted(async () => {
  if (proxyLocalPort.value.length == 0) {
    const proxyConfig = await new CommonDockerRequest().createRequest<ProxyConfig>('/proxy/get_proxy_info', {container_id: prop.container.id}, 1, '正在获取容器配置,请稍后')
    proxyForm.status = proxyConfig.status
    proxyForm.proxyLocalPort = proxyConfig.proxy_port[0]
    proxyConfig.proxy_port.forEach((item) => {
      proxyLocalPort.value.push({label: item, value: item})
    })
  }

})

</script>

<template>
  <div>
    <div v-if="proxyForm.proxyLocalPort == ''">
      <div class="software-mask"></div>
      <div class="software-install">
        <div class="software-view">
          <i class="svgtofont-el-warning-filled text-warning mr-4px text-2rem" />
          <span>当前容器暂无端口映射，无法做容器反向代理</span>
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <span>反向代理状态: </span>
      <span class="ml-[1rem]">
        {{!proxyForm.status? '未开启': '已开启'}}
      </span>
      <span :class="!proxyForm.status
        ? 'svgtofont-icon-stop text-[#ff0000]'
        : 'svgtofont-icon-start text-[#20a53a]'"/>
    </div>
    <div class="flex items-center mt-6">
      <span>绑定域名</span>
      <div class="w-[20rem] flex ml-[1rem]">
        <el-input v-model="proxyForm.bindDomain" placeholder="请输入绑定的端口"/>
      </div>
    </div>
    <div class="flex items-center mt-6">
      <span>需要代理的本地端口</span>
      <div class="w-[20rem] flex ml-[1rem]">
        <el-select
            class="w-[20rem]"
            v-model="proxyForm.proxyLocalPort">
          <el-option
              v-for="option in proxyLocalPort"
              :key="option.value"
              :label="option.label"
              :value="option.value"/>
        </el-select>
      </div>
    </div>
    <div class="my-6 flex items-center leading-[3rem]">
      <span>SSL 证书</span>
      <div class="flex ml-[1rem]">
        <el-radio-group v-model="proxyForm.sslMode">
          <el-radio v-for="radio in SSLCertRadio" :value="radio.value">{{radio.label}}</el-radio>
        </el-radio-group>
      </div>
    </div>

    <el-button class="mt-1rem" type="primary" @click="console.log(proxyForm)">保存</el-button>
    <ul class="list-disc text-[#777] px-[2rem] pt-[1.2rem]">
      <template v-for="help in helpInfo">
        <li v-if="!help.additionContent">{{help.content}}</li>
        <li v-else>
          <div class="flex items-center">
            {{help.content}}
            <el-link type="primary" :href="help.link" :target="help.link?.includes('http') ? '_blank' : ''" underline="never" style="font-size:12px">
              {{help.additionContent}}
            </el-link>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.software-mask {
  position: absolute;
  left: 0;
  top: 0;
  background-color: #fff;
  opacity: .7;
  height: 100%;
  width: 100%;
  z-index: 99;
  border-radius: 0.5rem;
}

.software-install {
  display: flex;
  justify-content: center;
}

.software-view {
  box-shadow: 0 0 10px 1px #f1f1f1;
  border: 1px solid #f1f1f1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  border-radius: 0.25rem;
  position: absolute;
  z-index: 100;
  background-color: #fff;
  margin: auto;
  width: fit-content;
  height: fit-content;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
}
</style>