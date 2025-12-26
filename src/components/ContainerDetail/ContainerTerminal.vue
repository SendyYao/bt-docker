<script setup lang="ts">
import {nextTick, ref} from "vue";
import type {Container} from "@/types/Container";
import CommonDockerRequest from "@/utils/request.ts";
import {ElMessage} from "element-plus";
import {Terminal} from '@xterm/xterm'
import "@xterm/xterm/css/xterm.css"

type PostType = {
  msg: string,
  name?: string,
  status: boolean
}

const prop = defineProps<{ container: Container }>()
const enableRoot = ref(false)
const shell = ref('Bash')
const optionList = [
  {text: 'Bash', value: 'Bash'},
  {text: 'sh', value: 'sh'}
]
const request = new CommonDockerRequest()

const connected = ref(false)
let ws: WebSocket | null = null
const termRef = ref<HTMLDivElement | null>(null)
let term: Terminal
let inputBuffer = ""

const startShell = async () => {
  if (prop.container.status == 'running') {
    const payloadData = enableRoot.value ?
        {id: prop.container.id, shell: shell.value.toLowerCase(), sudo_i: Number(enableRoot.value)} :
        {id: prop.container.id, shell: shell.value.toLowerCase()}
    // console.log('开启终端', payloadData)
    const responseData = await request.createRequest<PostType>('container/docker_shell', payloadData, 1)
    if (responseData.status) {
      console.log(responseData.msg)
      // todo create a websocket request
      term = new Terminal({
        cols: 100,
        rows: 30,
        cursorBlink: true,
        fontFamily: "monospace",
        fontSize: 14
      })
      term.open(termRef.value!)
      try {
        ws = new WebSocket("ws://192.168.2.141:8008/webssh");

        ws.onopen = () => {
          connected.value = true;

          // appendOutput("✅ WebSocket 已连接\n")
          ws?.send(JSON.stringify({
            id: "dockerTerminal",
            host: import.meta.env.VITE_SSH_HOST,
            user: import.meta.env.VITE_SSH_USER,
            password: import.meta.env.VITE_SSH_PASSWORD,
            port: 22,
            "x-http-token": "1g6qCcweQXwiR1oKDhqr1AqTb6R9Y33GQmcLkwGrc4DWMVxd"
          }))
          ws?.send("cd /volume1/homes/XuYao/Application/PythonFlask/app\n")
          ws?.send("clear\n")
          ws?.send(responseData.msg + "\n")
          // appendOutput(`> ${responseData.msg}\n`)
          focusTerminal()
        }

        ws.onmessage = (event) => {
          // appendOutput(event.data + "\n")
          // 处理回显消息
          term.write(event.data.replace(inputBuffer, ""))
          inputBuffer = ""
        }

        ws.onerror = () => {
          term.writeln("❌ WebSocket 出错\n")
        }

        ws.onclose = () => {
          connected.value = false;
          term.writeln("🔌 WebSocket 已关闭\n");
          setTimeout(()=> {term.dispose()}, 2000)
        }

        term.onData((data) => {
          // todo 监听上下键输入，直接发送数据，获取后端历史输入
          if (!connected.value) return
          if (data === "\r") {
            ws?.send(inputBuffer.trimEnd() + "\n")
            term.write("\r\n")
          } else if (data === "\u007f") {
            if (inputBuffer.length > 0) {
              inputBuffer = inputBuffer.slice(0, -1)
              term.write("\b \b")
            }
          } else {
            inputBuffer += data
            term.write(data) // 回显字符
          }
        })

      } catch (err) {
        // term.writeln("❌ 打开终端失败\n");
        console.error(err);
      }
    }
  }
  else {
    ElMessage.error('容器未运行')
  }
}

const focusTerminal = () => {
  nextTick(() => {
    termRef.value?.focus()
  })
}
</script>

<template>
  <div class="h-[60rem]">
    <el-form label-position="right" class="p-[2rem]" v-show="!connected">
      <el-form-item label="请选择shell">
        <el-select class="!w-[20rem]" v-model="shell">
          <el-option
              v-for="option in optionList"
              :label="option.text"
              :value="option.value"/>
        </el-select>
        <el-button type="primary" class="!ml-[2rem]" @click="startShell">开启终端</el-button>
      </el-form-item>
      <el-form-item>
        <el-checkbox label="使用root权限执行" :checked="enableRoot" v-model="enableRoot"></el-checkbox>
      </el-form-item>
    </el-form>
    <div class="terminal-container" ref="termRef"/>
  </div>
</template>

<style scoped>

</style>