<script setup lang="ts">
type tabFilterType = {
  name: string,
  disabled?: boolean,
  checked?: boolean,
  prop?: string
}

const props = defineProps<{
  pageName: string,
  tabFilter: tabFilterType[]
  tableData: any
}>()
const isNetworkPanel = props.pageName === 'Network'
const TableTabFilter = isNetworkPanel ? props.tabFilter.slice(0, 6) : props.tabFilter.slice(0, 5)
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between flex-wrap" style="row-gap: 0.8rem">
      <slot name="header-left" />
      <div class="flex flex-shrink-0">
      <div class="flex">
        <el-dropdown title="设置列表字段"
                     trigger="hover">
          <el-button type="default">
            <i class="svgtofont-icon-setting"
               style="color: rgb(102 102 102); font-size: 20px; height: 20px; line-height: 20px"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <template
                  v-for="[Index, Name, Disabled] of tabFilter.map((entry, index) => [index, entry.name, entry?.disabled])">
                <el-dropdown-item>
                  <el-checkbox :disabled="Disabled"
                               @click.stop
                               v-model="tabFilter[(Index as number)]['checked']">
                    {{ Name }}
                  </el-checkbox>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    </div>
    <div class="w-full content py-[12px]">
      <el-table :data="tableData"
                :header-cell-style="{background:'#f0f0f1'}"
                height="600"
                style="position: relative!important; max-height: 615px">
        <el-table-column type="selection" width="55" v-if="isNetworkPanel" />
        <template
            v-for="[Name, Prop, Checked] of TableTabFilter.map((entry, index) => [entry.name, entry?.prop, entry.checked])">
          <el-table-column :label="Name" :prop="Prop" v-if="Checked"/>
        </template>
        <template v-if="isNetworkPanel">
          <el-table-column label="标签" prop="labels" v-if="tabFilter[6].checked"
                           :formatter="(row, column, cellValue: any) => !cellValue ? cellValue.forEach(entry => entry) : ''"/>
          <el-table-column label="创建时间" prop="time" v-if="tabFilter[7].checked"
                           :formatter="(row, column, cellValue: number) => cellValue
                           ? new Date(cellValue * 1000)
                           .toLocaleDateString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit',
                           hour: '2-digit', minute: '2-digit', second: '2-digit'})
                           .replace(/\//g, '-')
                           : ''">
          </el-table-column>
        </template>

        <el-table-column label="操作">
          <template #default="scope">
            <div><span class="bt-link" @click="console.log(scope['$index'])">
              {{ isNetworkPanel ? "删除" : "退出网络" }}
            </span></div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

</template>

<style scoped>

</style>