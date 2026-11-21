import { isAxiosError } from 'axios'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import App from '@/App.vue'
import primevue from '@/config/primevue'
import i18n from '@/i18n'
import queryClient from '@/lib/query-client'
import router from '@/router'
import { useToastStore } from '@/stores/toast'
import '@/styles/main.css'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)

app
  .use(createPinia())
  .use(i18n)
  .use(router)
  .use(PrimeVue, primevue)
  .use(ToastService)
  .use(ConfirmationService)
  .use(VueQueryPlugin, { queryClient })

// Last line of defence for unexpected errors (bugs) so the user isn't left with a silent failure.
// API errors are skipped, the axios interceptor already showed a toast for them.
app.config.errorHandler = (error) => {
  console.error(error)
  if (isAxiosError(error)) return
  useToastStore().error(i18n.global.t('errors.unexpected'))
}

app.mount('#app')
