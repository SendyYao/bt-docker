import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import {showLoading, closeLoading} from "@/utils/loading.ts";
import {ref} from "vue";

const axiosInstance = axios.create({
    baseURL: 'http://192.168.2.141:8008',
    timeout: 10000,
});
const loadingInstance = ref()
const loadingText = ref('')
// 请求拦截器
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & { loading?: string }) => {
        // 如果请求配置中有 loading 字段，则显示 loading
        if (config.loading) {
            loadingText.value = config.loading
            loadingInstance.value = showLoading(loadingText.value)
        }
        return config;
    },
    (error) => {
        closeLoading()
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // 请求成功后关闭 loading
        if (loadingText.value != '') {
            loadingInstance.value.setText(response.data?.name + ' ' + response.data?.msg)
            setTimeout(() => {closeLoading();}, 1000);
        }
        return response;
    },
    (error) => {
        // 请求失败时关闭 loading
        closeLoading();
        return Promise.reject(error);
    }
);

export default axiosInstance;