import axiosInstance from "@/axios.ts";
import {ref} from "vue";
import {ElMessage} from "element-plus";
import type {Container} from "@/types/Container";
import ResponseData from "@/utils/ResponseData.ts";
import type {ImageList} from "@/types/ImageList";
import type {HostNetworkResp} from "@/types/ContainerStats.ts";
import type {MountedVolumeList} from "@/types/MountedVolumeList.ts";

type PostType = {
    msg: string,
    name?: string,
    status: boolean
}

type ResponseType<T = PostType> = T

type CommonDockerResponse = PostType | Container[] | ImageList | HostNetworkResp | MountedVolumeList | ProxyConfig

enum requestType {
    GET,
    POST,
    MIXED
}

const operationName = {
    start: '启动', stop: '停止', kill: '强制停止', reload: '重启', pause: '暂停'
}

class CommonDockerRequest {
    readonly baseUrl = '/btdocker/'

    async SetContainerStatus(ContainerID: string, Status: string) {
        const responseData = ref<ResponseType>()
        const formData = new FormData();
        formData.set('id', ContainerID)
        formData.set('status', Status)
        await axiosInstance.post(
            '/btdocker/container/set_container_status',
            formData,
            {
                loading: `正在${operationName[Status]}容器，请稍后`
            }
        ).then((response) => {
            responseData.value = response.data
        }).catch((error) => {
            console.log(error)
        })

        if (responseData.value?.status) {
            console.log(responseData.value?.name + responseData.value?.msg)
        }
    }

    async createRequest<T extends CommonDockerResponse>(
        action: string,
        pdata: object | null,
        RType: number,
        loadingMsg: string|undefined = undefined): Promise<T> {
        // const responseData = ref<ResponseType<T>>()
        let responseData: T = {msg: "", status: false} as T;
        if (requestType.POST == RType) {
            let formData: FormData | null = null
            if (pdata != null) {
                formData = new FormData()
                Object.entries(pdata).map(([key, value]) => {
                    (formData as FormData).set(key, value)
                })
            }
            await axiosInstance.post(
                this.baseUrl + action,
                formData,
                {
                    loading: loadingMsg
                }
            ).then((response) => {
                responseData = response.data
            }).catch((error) => {
                ElMessage({
                    type: 'error',
                    message: error
                })
            })
        } else if (requestType.GET == RType) {
            // responseData.value = []
            switch (action) {
                case 'container/get_list':
                    await axiosInstance.get(
                        this.baseUrl + action
                    ).then((response) => {
                        const data = response.data
                        if (data.status != false) {
                            responseData = new ResponseData().processGetContainerList(data) as T
                        }
                    }).catch((error) => {
                        ElMessage({
                            type: 'error',
                            message: error
                        })
                    })
                    break
                default:
                    await axiosInstance.get(
                        this.baseUrl + action
                    ).then((response) => {
                        responseData = response.data
                    }).catch((error) => {
                        ElMessage({
                            type: 'error',
                            message: error
                        })
                    })
            }
        } else {
            ElMessage({
                type: 'error',
                message: '不支持的Request Type'
            })
        }
        return responseData;
    }
}

export default CommonDockerRequest
