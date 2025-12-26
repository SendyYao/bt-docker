type Container = Record<"container_id" | "container_name", string>
interface Image {
    id: string,
    tags: string,
    name: string,
    digest: string,
    time: number,
    size: number,
    created_at: number,
    used: number,
    container: Container[]
}

export type ImageList = Image[]