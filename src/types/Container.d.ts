export interface Container {
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
