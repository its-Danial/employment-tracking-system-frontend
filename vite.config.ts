import { URL, fileURLToPath } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { HeroiconsResolver } from './src/config/heroicons-resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    Components({
      dirs: [], // Exclude local components from auto-imports
      extensions: ['vue'],
      dts: './src/types/components.d.ts',
      resolvers: [PrimeVueResolver(), HeroiconsResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Framework code changes rarely, separate chunks stay browser-cached across our deploys.
        // PrimeVue components are left out so each one still loads only with the page using it.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(@primeuix|@primevue\/core)\//.test(id)) return 'vendor-primevue'
          if (/node_modules\/(@vue|vue|vue-router|pinia|@vueuse)\//.test(id)) return 'vendor-vue'
        },
      },
    },
  },
})
