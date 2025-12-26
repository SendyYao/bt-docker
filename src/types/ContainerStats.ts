// src/types/ContainerStats.ts
export interface ContainerStats {
    cpu_usage: string
    mem_percent: string
}

type UsedContainer = {
    [containerId: string]: Record<"Name" | "EndpointID" | "MacAddress" | "IPv4Address" | "IPv6Address", string>
}
type HostNetworkConfig = {
    time: number
    labels: {}
    used: number
    containers: UsedContainer
} & Record<'id' | 'name' | 'driver' | 'subnet' | 'gateway' | 'subnetv6' | 'gatewayv6', string>

export type HostNetworkResp = HostNetworkConfig[]

// 容器 ID 作为 key
export type ContainerStatsMap = {
    [containerId: string]: ContainerStats
}
