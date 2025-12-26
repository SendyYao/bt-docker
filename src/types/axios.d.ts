import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        /**
         * 是否显示 loading，传入 string 就是 loading 的文字
         */
        loading?: string;
    }
}
