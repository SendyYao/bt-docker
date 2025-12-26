<template>
    <div class="flex flex-wrap">
      <el-dropdown placement="bottom" trigger="hover" popper-class="utils-popper">
        <el-button> bottom </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <bt-switch3 v-model="currentMode" :options="opts" @change="console.log(currentMode)" @click.stop @mouseup.stop/>
            </el-dropdown-item>
            <el-dropdown-item>The Action 2nd</el-dropdown-item>
            <el-dropdown-item>The Action 3rd</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import BtSwitch3 from "@/components/common/BtSwitch3.vue";

const opts = [
  { label: "Light", value: "light", color: "#ef0808", index: 0 },
  { label: "Dark", value: "dark", color: "#f0ad4e", index: 1 },
  { label: "Super Dark", value: "super-dark", color: "#20a53a", index: 2 },
]
const currentMode = ref("light")
</script>
