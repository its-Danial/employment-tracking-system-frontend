import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
  const accessToken = useStorage<{ value: string; expiresAt: string } | undefined>(
    'access-token',
    undefined
  )
  const isAuthenticated = computed(
    () => !!accessToken.value && new Date(accessToken.value.expiresAt).getTime() > Date.now()
  )

  function $reset() {
    accessToken.value = undefined
  }

  return { accessToken, isAuthenticated, $reset }
})
