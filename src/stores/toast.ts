import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'

/**
 * We wrap the PrimeVue Toast Service in a Pinia store to make it easier to use throughout the app.
 * This also allows us to use the toast outside of Vue components.
 * since the store is initialized at App.vue level.
 */
export const useToastStore = defineStore('toast', () => {
  const toast = useToast()
  return { ...toast }
})
