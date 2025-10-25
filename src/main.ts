import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import App from '@/App.vue'
import primevue from '@/config/primevue'
import queryClient from '@/lib/query-client'
import router from '@/router'
import '@/styles/main.css'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, primevue)
  .use(ToastService)
  .use(VueQueryPlugin, { queryClient })

app.mount('#app')
