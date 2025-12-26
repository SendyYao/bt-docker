import CommonDockerRequest from "@/utils/request.ts";
import {useDockerStore} from "@/store/dockerStore.ts";
import type {Container} from "@/types/Container";

class ContainerOperation {
    async mangeContainer(container: Container, operation: string) {
        console.log(operation == 'start' ? '启动容器' : '停止容器/重启')
        await new CommonDockerRequest().SetContainerStatus(container.id, operation)
        container.status = ['start', 'reload'].includes(operation) ? 'running' : 'exited'
        const target = useDockerStore().containerList.find(c => c.id === container.id)
        if (target) target.status = container.status
    }
}
export default ContainerOperation