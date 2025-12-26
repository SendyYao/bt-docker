interface MountedVolume {
    container: string;
    CreatedAt: number;
    Driver: string;
    Labels: null;
    Mountpoint: string;
    Name: string;
    Options: null;
    Scope: string;
}

export type MountedVolumeList = MountedVolume[]