import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import type { LoginUserRequest, RegisterUserRequest } from '@/api/services/auth-services'
import authServices from '@/api/services/auth-services'
import i18n from '@/i18n'
import queryClient from '@/lib/query-client'
import router from '@/router'
import type { User } from '@/shared/entities'
import { WILDCARD_PERMISSION } from '@/shared/permissions'
import type { Permission } from '@/shared/permissions'
import { useLoadingStore } from '@/stores/loading'
import { RouteName } from '@/types/router'
import { StorageSerializers, useCountdown, useStorage } from '@vueuse/core'

export type PermissionMatch = 'all' | 'any'

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
  /** Whether the user (and their permissions) was re-fetched since the app loaded */
  const isUserRefreshed = ref(false)

  const isAuthenticated = computed(
    () =>
      !!user.value &&
      !!accessToken.value &&
      !!accessToken.value.expiresAt &&
      new Date(accessToken.value.expiresAt).getTime() > Date.now()
  )

  const grantedPermissions = computed(() => new Set(user.value?.permissions ?? []))

  /**
   * For showing/hiding UI only, the API enforces permissions on every request.
   * @param match `all` (default) requires every permission, `any` requires at least one
   */
  function can(permissions: Permission | Permission[], match: PermissionMatch = 'all') {
    if (grantedPermissions.value.has(WILDCARD_PERMISSION)) return true
    const required = [permissions].flat()
    return match === 'all'
      ? required.every((permission) => grantedPermissions.value.has(permission))
      : required.some((permission) => grantedPermissions.value.has(permission))
  }

  const { start: startAutoLogoutCountdown, stop: stopAutoLogoutCountdown } = useCountdown(0, {
    onComplete: () => {
      logout(false).then(() =>
        toast.add({
          severity: 'info',
          summary: i18n.global.t('auth.loggedOut'),
          detail: i18n.global.t('auth.sessionExpired'),
          life: 5000,
        })
      )
    },
  })

  watch(
    [user, accessToken],
    ([newUser, newToken]) => {
      // Half a session (e.g. storage edited/cleared in another tab) is treated as logged out.
      // Skipped when both are empty, which is what logout itself produces.
      if (!newUser !== !newToken) logout(false)
      if (newToken?.expiresAt) {
        const expiresAt = new Date(newToken.expiresAt).getTime()
        const now = Date.now()
        const timeUntilExpiry = Math.max(0, Math.floor((expiresAt - now) / 1000))

        if (timeUntilExpiry > 0) startAutoLogoutCountdown(timeUntilExpiry)
      }
    },
    { immediate: true }
  )

  /**
   * Re-fetches the user so role/permission changes made by an admin apply without re-login
   */
  async function refreshUser() {
    user.value = (await authServices.me()).data
    isUserRefreshed.value = true
  }

  async function login(payload: LoginUserRequest) {
    const { user: userData, token } = (await authServices.login(payload)).data
    user.value = userData
    accessToken.value = token
    isUserRefreshed.value = true
  }

  async function logout(hitApi = true) {
    try {
      loadingStore.showLoading()
      if (hitApi) await authServices.logout()
    } finally {
      stopAutoLogoutCountdown()
      $reset()
      // Cached API data belongs to the previous user, it must not be visible to the next one
      queryClient.clear()
      loadingStore.hideLoading()
      await router.replace({ name: RouteName.Login })
    }
  }

  async function register(payload: RegisterUserRequest) {
    const { user: userData, token } = (await authServices.register(payload)).data
    user.value = userData
    accessToken.value = token
    isUserRefreshed.value = true
  }

  function $reset() {
    user.value = undefined
    accessToken.value = undefined
    isUserRefreshed.value = false
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isUserRefreshed,
    can,
    refreshUser,
    login,
    logout,
    register,
    $reset,
  }
})
