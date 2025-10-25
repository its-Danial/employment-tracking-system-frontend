import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { computed, watch } from 'vue'
import type { LoginUserRequest, RegisterUserRequest } from '@/api/services/auth-services'
import authServices from '@/api/services/auth-services'
import router from '@/router'
import { useLoadingStore } from '@/stores/loading'
import { RouteName } from '@/types/router'
import type { User } from '@/types/user'
import { StorageSerializers, useCountdown, useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
  const toast = useToast()
  const loadingStore = useLoadingStore()

  const user = useStorage<User | undefined>('user', undefined, localStorage, {
    serializer: StorageSerializers.object,
  })
  const accessToken = useStorage<{ value: string; expiresAt: string } | undefined>(
    'access-token',
    undefined,
    localStorage,
    { serializer: StorageSerializers.object }
  )

  const isAuthenticated = computed(
    () =>
      !!user.value &&
      !!accessToken.value &&
      !!accessToken.value.expiresAt &&
      new Date(accessToken.value.expiresAt).getTime() > Date.now()
  )

  const { start: startAutoLogoutCountdown, stop: stopAutoLogoutCountdown } = useCountdown(0, {
    onComplete: () => {
      logout(false).then(() =>
        toast.add({
          severity: 'info',
          summary: 'Logged Out',
          detail: 'Session expired, please log in again.',
          life: 5000,
        })
      )
    },
  })

  watch(
    [user, accessToken],
    ([newUser, newToken]) => {
      if (!newUser || !newToken) logout(false)
      if (newToken?.expiresAt) {
        const expiresAt = new Date(newToken.expiresAt).getTime()
        const now = Date.now()
        const timeUntilExpiry = Math.max(0, Math.floor((expiresAt - now) / 1000))

        if (timeUntilExpiry > 0) startAutoLogoutCountdown(timeUntilExpiry)
      }
    },
    { immediate: true }
  )

  async function login(payload: LoginUserRequest) {
    try {
      const { user: userData, token } = (await authServices.login(payload)).data
      user.value = userData
      accessToken.value = token
    } catch (error) {
      throw error
    }
  }

  async function logout(hitApi = true) {
    try {
      loadingStore.showLoading()
      if (hitApi) await authServices.logout()
      stopAutoLogoutCountdown()
      $reset()
      await router.replace({ name: RouteName.Login })
    } catch (error) {
      throw error
    } finally {
      loadingStore.hideLoading()
    }
  }

  async function register(payload: RegisterUserRequest) {
    try {
      const { user: userData, token } = (await authServices.register(payload)).data
      user.value = userData
      accessToken.value = token
    } catch (error) {
      throw error
    }
  }

  function $reset() {
    user.value = undefined
    accessToken.value = undefined
  }

  return { user, accessToken, isAuthenticated, login, logout, register, $reset }
})
