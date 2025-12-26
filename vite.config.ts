import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath} from "node:url";

// https://vite.dev/config/
export default defineConfig({
    preview: {
        host: '192.168.2.4',
        port: 8080,
        strictPort: true,
        cors: false
    },
    server: {
        host: '192.168.2.4',
        port: 8080,
        strictPort: true,
        cors: true
    },
    plugins: [
        vue(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            // "@": path.resolve(__dirname, "./src"),
            "@": fileURLToPath(new URL("./src", import.meta.url))
        },
    },
    build: {
        rollupOptions: {
            output: {
                // 分类输出资源
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'static/css/[name]-[hash][extname]';
                    }
                    if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name || '')) {
                        return 'static/images/[name]-[hash][extname]';
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
                        return 'static/fonts/[name]-[hash][extname]';
                    }
                    // 默认放 assets 目录
                    return 'assets/[name]-[hash][extname]';
                },
                manualChunks: {
                    core: ['vue', 'vue-router', 'vuex'],
                    element: ['element-plus'],
                    style: ['tailwindcss']
                },
                // JS 文件单独放 js 目录
                chunkFileNames: 'static/js/[name]-[hash].js',
                entryFileNames: 'static/js/[name]-[hash].js',
            },
        },
    }
})
