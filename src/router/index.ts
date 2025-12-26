import type {RouteRecordRaw} from "vue-router";
import {createRouter, createWebHistory} from "vue-router";
import NotFound from "@/views/NotFound.vue";

const ALLOW_COMPONENTS = [
    'appstore', 'conmanger', 'dockersite', 'containers',
    'cloudimages', 'images', 'orchestration', 'network',
    'storage', 'warehouse', 'setting', 'dockerinstall'
]
const routes: Array<RouteRecordRaw> = [
    {path: '/home', name: 'home', meta: {title: 'Home'}, component: () => import('@/views/HomeView.vue')},
    {
        path: '/docker/:componentName',
        name: 'docker',
        meta: {title: 'Docker Manager'},
        component: () => import('@/views/DockerView.vue'),
        beforeEnter: (to) => {
            if (!ALLOW_COMPONENTS.includes(to.params.componentName as string)) {
                router.push('/404').then(r => console.log('Push to 404'))
            }
        }
    },
    {
        path: '/test', name: 'Test', meta: {title: 'Test View'},
        component: () => import('@/views/TestView.vue')
    },
    {
        path: '/:catchAll(.*)', name: 'NotFound', meta: {title: 'Page not found', isLogin: false},
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
router.beforeEach(async (to, from, next) => {
    next();

})

router.afterEach((to) => {
    const _title = to.meta.title;
    if (_title) {
        window.document.title = String(_title);
    }
})


export default router