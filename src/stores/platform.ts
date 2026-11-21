import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

/**
 * Platform admin key for the hidden /platform page. Kept in sessionStorage, so it's forgotten
 * when the browser tab is closed.
 */
export const usePlatformStore = defineStore('platform', () => {
  const key = useStorage<string>('platform-key', '', sessionStorage)
  const isUnlocked = computed(() => key.value.length > 0)

  const unlock = (newKey: string) => (key.value = newKey.trim())
  const lock = () => (key.value = '')

  return { key, isUnlocked, unlock, lock }
})
