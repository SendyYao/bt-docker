// src/stores/dockerStore.ts
import { defineStore } from 'pinia'
import type { ContainerInfo } from '@/types/ContainerInfo'
import type { ContainerStatsMap } from "@/types/ContainerStats.ts";
import type { Container } from "@/types/Container";
import CommonDockerRequest from "@/utils/request.ts";

export const useDockerStore = defineStore('dockerStore', {
    state: () => ({
        containerList: [] as Container[] | [],
        currentConDetail: {} as ContainerInfo | {}, // 初始默认值 {}
        maxCPU: 1,
        maxMem: 1024,
        loading: false,
        refreshWs: false,
        customLimit: {
            container: false,
            images: false,
            network: false,
            storage: false,
            warehouse: false
        },
        deployMenuData: {
            app_type: "all",
            maximum_cpu: "--",
            maximum_memory: "--"
        },
        cpuAndMemData: {} as ContainerStatsMap | {}
    }),
    actions: {
        async refreshContainerList() {
            this.containerList = await new CommonDockerRequest().createRequest<Container[]>('container/get_list',null, 0) as Container[]
        },
        setCurrentConDetail(info: ContainerInfo) {
            this.currentConDetail = info
        },
        setCPUAndMem(data: [number, number]) {
            this.maxCPU = data[0]
            this.maxMem = data[1]
        },
        resetCurrentConDetail() {
            this.currentConDetail = {}
        },
    },
    persist: {
        key: 'DOCKER-STORE',
        storage: sessionStorage,
        serializer: {
            serialize: (state: Record<string, any>) => {
                const clone = { ...state }
                delete clone.containerList
                return JSON.stringify(clone)
            },
            deserialize: (raw: string) => {
                try { return JSON.parse(raw) } catch { return {} }
            },
        },
    },
})
