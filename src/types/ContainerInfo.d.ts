export interface ContainerInfo {
    AppArmorProfile: string;
    Args: string[];
    Config: Config;
    container_info: string;
    Created: string;
    Driver: string;
    ExecIDs: null;
    GraphDriver: GraphDriver;
    HostConfig: HostConfig;
    HostnamePath: string;
    HostsPath: string;
    Id: string;
    Image: string;
    LogPath: string;
    MountLabel: string;
    Mounts: Mount[];
    Name: string;
    NetworkSettings: NetworkSettings;
    Path: string;
    Platform: string;
    ProcessLabel: string;
    ResolvConfPath: string;
    RestartCount: number;
    State: State;
    [property: string]: any;
}

/**
 * ContainerInfoConfig
 */
export interface Config {
    AttachStderr: boolean;
    AttachStdin: boolean;
    AttachStdout: boolean;
    Cmd: string[] | null;
    Domainname: string;
    Entrypoint: string[];
    Env: string[];
    ExposedPorts: ExposedPorts;
    Hostname: string;
    Image: string;
    Labels: Labels;
    OnBuild: null;
    OpenStdin: boolean;
    StdinOnce: boolean;
    Tty: boolean;
    User: string;
    Volumes: Volumes;
    WorkingDir: string;
    [property: string]: any;
}

export interface ExposedPorts {
    "8080/tcp": { [key: string]: any };
    [property: string]: any;
}

export interface Labels {
    maintainer: string;
    [property: string]: string;
}

export interface Volumes {
    "/etc/ssl/certs": { [key: string]: any };
    [property: string]: any;
}

export interface GraphDriver {
    Data: Data;
    Name: string;
    [property: string]: any;
}

export interface Data {
    LowerDir: string;
    MergedDir: string;
    UpperDir: string;
    WorkDir: string;
    [property: string]: any;
}

export interface HostConfig {
    AutoRemove: boolean;
    Binds: string[];
    BlkioDeviceReadBps: null;
    BlkioDeviceReadIOps: null;
    BlkioDeviceWriteBps: null;
    BlkioDeviceWriteIOps: null;
    BlkioWeight: number;
    BlkioWeightDevice: null;
    CapAdd: string[] | null;
    CapDrop: string[] | null;
    Cgroup: string;
    CgroupnsMode: string;
    CgroupParent: string;
    ConsoleSize: number[];
    ContainerIDFile: string;
    CpuCount: number;
    CpuPercent: number;
    CpuPeriod: number;
    CpuQuota: number;
    CpuRealtimePeriod: number;
    CpuRealtimeRuntime: number;
    CpusetCpus: string;
    CpusetMems: string;
    CpuShares: number;
    DeviceCgroupRules: null;
    DeviceRequests: null;
    Devices: null;
    Dns: string[];
    DnsOptions: string[];
    DnsSearch: string[];
    ExtraHosts: null;
    GroupAdd: null;
    IOMaximumBandwidth: number;
    IOMaximumIOps: number;
    IpcMode: string;
    Isolation: string;
    Links: null;
    LogConfig: LogConfig;
    MaskedPaths: null;
    Memory: number;
    MemoryReservation: number;
    MemorySwap: number;
    MemorySwappiness: null;
    NanoCpus: number;
    NetworkMode: string;
    OomKillDisable: null;
    OomScoreAdj: number;
    PidMode: string;
    PidsLimit: null;
    PortBindings: PortBindings;
    Privileged: boolean;
    PublishAllPorts: boolean;
    ReadonlyPaths: null;
    ReadonlyRootfs: boolean;
    RestartPolicy: RestartPolicy;
    Runtime: string;
    SecurityOpt: string[];
    ShmSize: number;
    Ulimits: null;
    UsernsMode: string;
    UTSMode: string;
    VolumeDriver: string;
    VolumesFrom: null;
    [property: string]: any;
}

export interface LogConfig {
    Config: { [key: string]: any };
    Type: string;
    [property: string]: any;
}

export interface PortBindings {
    [port: string]: PortBindingsEntryValue[];
}

export interface PortBindingsEntryValue {
    HostIp?: string;
    HostPort: string;
    [property: string]: any;
}

export interface RestartPolicy {
    MaximumRetryCount: number;
    Name: string;
    [property: string]: any;
}

export interface Mount {
    Destination?: string;
    Mode?: string;
    Propagation?: string;
    RW?: boolean;
    Source?: string;
    Type?: string;
    [property: string]: any;
}

export interface NetworkSettings {
    Bridge: string;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    HairpinMode: boolean;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    LinkLocalIPv6Address: string;
    LinkLocalIPv6PrefixLen: number;
    MacAddress: string;
    Networks: Networks;
    Ports: Ports;
    SandboxID: string;
    SandboxKey: string;
    SecondaryIPAddresses: null;
    SecondaryIPv6Addresses: null;
    [property: string]: any;
}

export interface Networks {
    "minio-imgproxy"?: MinioImgproxy;
    [property: string]: any;
}

export interface MinioImgproxy {
    Aliases: null;
    DNSNames: string[];
    DriverOpts: null;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    IPAddress: string;
    IPAMConfig: IPAMConfig;
    IPPrefixLen: number;
    IPv6Gateway: string;
    Links: null;
    MacAddress: string;
    NetworkID: string;
    [property: string]: any;
}

export interface IPAMConfig {
    IPv4Address: string;
    [property: string]: any;
}

export interface Ports {
    "8080/tcp": Ports8080tcp[];
    [property: string]: any;
}

export interface Ports8080tcp {
    HostIp: string;
    HostPort: string;
    [property: string]: any;
}

/**
 * ContainerInfoState
 */
export interface State {
    Dead: boolean;
    Error: string;
    ExitCode: number;
    FinishedAt: string;
    OOMKilled: boolean;
    Paused: boolean;
    Pid: number;
    Restarting: boolean;
    Running: boolean;
    StartedAt: string;
    Status: string;
    [property: string]: any;
}