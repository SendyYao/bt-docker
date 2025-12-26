// src/utils/loading.ts
import { ElLoading } from 'element-plus'

let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

export function showLoading(text = '加载中...') {
    // 避免重复创建
    if (loadingInstance) return loadingInstance

    loadingInstance = ElLoading.service({
        lock: true,
        text,
        background: 'rgba(0, 0, 0, 0.3)',
        customClass: 'my-loading'
    })

    // 插入自定义 DOM
    const spinner = document.createElement('i')
    spinner.className = 'circular'
    const container = loadingInstance.$el.querySelector('.el-loading-spinner')
    const FuckSVG = loadingInstance.$el.querySelector('.circular')
    let BOX = document.querySelector(".el-loading-mask");
    if (BOX) {
        (BOX as HTMLElement).style.zIndex = "2058"
    }
    if (container  && FuckSVG) {
        container.prepend(spinner)
        FuckSVG.remove()
    }

    return loadingInstance
}

export function closeLoading() {
    if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
    }
}
