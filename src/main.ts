import { createApp } from 'vue'
import App from "@/App.vue";
import ElementPlus from 'element-plus'
import router from "./router";
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import '@/assets/css/main.css'
import 'element-plus/theme-chalk/index.css'
import '@/assets/css/element-override.css'
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.config.globalProperties.$router = router
app
    .use(router)
    .use(pinia)
    .use(ElementPlus)
app.mount('#app')