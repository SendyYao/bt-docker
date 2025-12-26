<template>
  <div class="docker-management">
    <el-card class="container-card">
      <div slot="header" class="header">
        <span>Docker 容器管理</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="info-card">
            <h3>CPU 使用情况</h3>
            <p>{{ online_cpus }} 核</p>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="info-card">
            <h3>内存总量</h3>
            <p>{{ mem_total }} MB</p>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="filter_container_list" stripe style="width: 100%">
        <el-table-column label="容器名" prop="name" width="180"></el-table-column>
        <el-table-column label="容器 ID" prop="id"
                         :formatter="(_row: any, _column: any, cellValue: string) => cellValue ? cellValue.substring(0, 12) : ''">
        </el-table-column>
        <el-table-column prop="status" width="120"
                         column-key="status"
          >
          <template #header>
            <div class="flex items-center flex-nowrap">
              <!-- 右侧添加触发下拉菜单的图标 -->
              <el-dropdown trigger="hover">
                <span class="status-header-text">
                  状态
                  <el-icon class="filter-icon"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="option in filterOptions" :key="option.text" @click="handleFilter(option.value)">
                      {{ option.text }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="{ row }">
            <el-dropdown>
               <span class="flex items-center h-[3rem]"
                     :class="{'text-[#20a53a]': row['status'] == 'running', 'text-[#ff0000]': row['status'] == 'exited'}">
                 {{ row['status'] == 'running' ? '运行中' : '已停止' }}
                 <span :class="{
                   'svgtofont-icon-start text-[#20a53a]' : row['status'] == 'running',
                   'svgtofont-icon-stop text-[#ff0000]' : row['status'] == 'exited'}">
                 </span>
               </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-if="row['status'] == 'running'">
                    <el-dropdown-item v-for="(label, index) in elDropdownItems.running.map(entry => entry.label)"
                                      @click="async () => {
                                        if (['停止', '重启'].includes(label)) {
                                          await new ContainerOperation().mangeContainer(row, elDropdownItems.running[index].value)
                                        } else {
                                          console.log('暂不支持其他操作', label)
                                        }
                                      }">
                      {{ label }}
                    </el-dropdown-item>
                  </template>
                  <template v-else>
                    <el-dropdown-item v-for="(label, index) in elDropdownItems.stop.map(entry => entry.label)"
                                      @click="async () => {
                                        await new ContainerOperation().mangeContainer(row, elDropdownItems.stop[index].value)
                                      }">
                      {{ label }}
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
    <!--  <template #default="{ row }"><el-tag :type="getStatusType(row.status)">{{ row['status'] }}</el-tag></template> -->
        </el-table-column>
        <el-table-column label="镜像" prop="image"></el-table-column>
        <el-table-column label="端口(主机-->容器)" prop="ports" width="235px">
          <template #default="{ row }">
            <span class="whitespace=pre-wrap gap-4 leading-[2.5]">
               <el-tag type="success"
                       size="default"
                       effect="light"
                       class="bt-tag mr-1"
                       v-for="(item,index) in row['ports']" :key="index">
              <span class="bt-port">{{ item.replace('-->', ' → ') }}</span>
            </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button @click="manageContainer(row)" size="small" type="primary">管理</el-button>
<!--            <el-button @click="stopContainer(row)" size="small" type="danger">停止</el-button>-->
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <MangeDialog v-model="mangeDialogVisible" :container="selectedContainer"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import axios from "axios";
import {ArrowDown} from "@element-plus/icons-vue";
import MangeDialog from "@/components/MangeDialog.vue";
import {useDockerStore} from "@/store/dockerStore.ts";
import ContainerOperation from "@/utils/ContainerOperation.ts";

interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
  ports: ContainerPorts;
}

type ContainerPorts = {
  HostIp: string
  HostPort: string
} | string[]

export default defineComponent({
  name: 'DockerManagement',
  computed: {
    ContainerOperation() {
      return ContainerOperation
    }
  },
  components: {
    MangeDialog,
    ArrowDown
  },
  setup() {
    const mangeDialogVisible = ref(false);
    const online_cpus = ref(0);
    const mem_total = ref(0);
    const elDropdownItems = {
      running: [
        {label: '停止', value: 'stop'},
        {label: '重启', value: 'reload'},
        {label: '强制停止', value: 'kill'},
        {label: '暂停', value: 'pause'}
      ],
      stop: [
        {label: '启动', value: 'start'},
        {label: '重启', value: 'reload'},
      ]
    }
    const filterOptions = [
      { text: '全部', value: ['running', 'paused', 'exited']},
      { text: '正在运行', value: 'running'},
      { text: '暂停', value: 'paused'},
      { text: '停止', value: 'exited'}
    ]
    const selectedFilter = ref<string|string[]>(['running', 'paused', 'exited'])
    const selectedContainer = ref<Container>();
    const container_list = ref<Container[]>([]);
    const filter_container_list = ref<Container[]>([])

    const dockerStore = useDockerStore()

    // const filterMethod = (value: string, row: Container) => {
    //   return selectedFilter.value.includes(row.status)
    // }

    const fetchDockerStats = async () => {
      if (container_list.value.length == 0) {
        try {
          await dockerStore.refreshContainerList()
          online_cpus.value = dockerStore.maxCPU; mem_total.value = Math.floor(dockerStore.maxMem / (1024 * 1024));
          filter_container_list.value = container_list.value = dockerStore.containerList
          // console.log(filter_container_list.value)
        } catch (error) {
          console.error('Error fetching Docker stats:', error);
        }
      }
    };

    const getStatusType = (status: string) => {
      switch (status) {
        case 'running':
          return 'success';
        case 'exited':
          return 'danger';
        default:
          return 'info';
      }
    };

    const manageContainer = (container: Container) => {
      console.log('Managing container', container.name);
      selectedContainer.value = container
      mangeDialogVisible.value = true
      // You can implement management logic here
    };

    const stopContainer = (container: Container) => {
      console.log('Stopping container', container.name);
      // You can implement stop container logic here
    };

    const handleFilter = (value: string | string[]) => {
      selectedFilter.value = value
      console.log(selectedFilter.value)
      filter_container_list.value = container_list.value.filter(row => selectedFilter.value.includes(row.status))
    }

    onMounted(() => {
      fetchDockerStats();
    });

    return {
      mangeDialogVisible,
      online_cpus,
      mem_total,
      elDropdownItems,
      container_list,
      filter_container_list,
      filterOptions,
      selectedFilter,
      selectedContainer,
      handleFilter,
      getStatusType,
      manageContainer,
      stopContainer
    };
  },
});
</script>

<style scoped lang="scss">
.docker-management {
  padding: 20px;
}

.container-card {
  margin-bottom: 20px;
}

.info-card {
  background-color: #fff;
  padding: 20px;
  text-align: center;
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-table {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.el-table-column {
  font-size: 14px;
}

.el-button {
  margin-right: 10px;
}

.bt-tag {
  background: #f0fdf4; /* 类似宝塔绿色的淡背景 */
  border: 1px solid #86efac; /* 边框浅绿色 */
  color: #16a34a; /* 正文深绿色 */
  border-radius: 4px; /* 轻微圆角 */
  font-size: 12px; /* 字体偏小 */
  padding: 0 6px; /* 紧凑一些 */
  margin: 2px; /* 标签间距 */
}

.bt-port {
  font-family: monospace; /* 等宽字体，保证 --> 对齐 */
  letter-spacing: 0.5px; /* 稍微拉开间距 */
}

.custom-header {
  display: flex;
  align-items: center;
}
.custom-header > i {
  margin-left: 8px;
}
</style>
