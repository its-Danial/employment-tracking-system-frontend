import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import App from '@/App.vue'
import primevue from '@/config/primevue'
import router from '@/router'
import '@/styles/main.css'

const app = createApp(App)

app.use(createPinia()).use(router).use(PrimeVue, primevue).use(ToastService)

app.mount('#app')
