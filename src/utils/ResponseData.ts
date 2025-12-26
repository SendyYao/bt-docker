import type {Container} from "@/types/Container";
import {useDockerStore} from "@/store/dockerStore.ts";

class ResponseData {
    processGetContainerList(getListData: any) {
        let processedData: Container[] = []
        try {
            useDockerStore().setCPUAndMem([getListData.online_cpus, getListData.mem_total])
            processedData = getListData.container_list.map((container: Container) => {
                if (Object.keys(container.ports).length == 0) {
                    container.ports = []
                }
                else {
                    let PortsArray: string[] = [];
                    // Todo container.ports 改为数组形式， 在template中使用v-for
                    Object.values(container.ports).forEach((value, index) => {
                        const oneInfo = "0.0.0.0:" + (value[0]['HostPort'] as string) + "-->" + (Object.keys(container.ports)[index] as string)
                        PortsArray.push(oneInfo)
                    })
                    container.ports = PortsArray
                    // console.log(container.ports)
                }
                return {
                    id: container.id,
                    name: container.name,
                    status: container.status,
                    image: container.image,
                    ports: container.ports
                }
            })
        } catch (error) {
            console.error('Error fetching Docker stats:', error);
        }
        return processedData
    }
}

export default ResponseData