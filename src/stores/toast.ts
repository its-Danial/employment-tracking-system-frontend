import { defineStore } from 'pinia'
import type { ToastMessageOptions } from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import i18n from '@/i18n'

type Severity = 'success' | 'info' | 'warn' | 'error'

// Errors stay longer so there is time to read them
const DURATION_MS: Record<Severity, number> = {
  success: 3000,
  info: 4000,
  warn: 5000,
  error: 6000,
}

/**
 * We wrap the PrimeVue Toast Service in a Pinia store to make it easier to use throughout the app.
 * This also allows us to use the toast outside of Vue components (e.g. axios interceptors),
 * since the store is initialized at App.vue level.
 *
 * @example
 * const toast = useToastStore()
 * toast.success('Trade saved')
 * toast.error('Could not save the trade', 'Save failed')
 */
export const useToastStore = defineStore('toast', () => {
  const toast = useToast()

  const show = (severity: Severity) => (detail: string, summary?: string) =>
    toast.add({
      severity,
      summary: summary ?? i18n.global.t(`toast.${severity}`),
      detail,
      life: DURATION_MS[severity],
    } satisfies ToastMessageOptions)

  return {
    ...toast,
    success: show('success'),
    info: show('info'),
    warn: show('warn'),
    error: show('error'),
  }
})
