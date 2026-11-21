import type { NavigationGuard } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'

/**
 * Guard to check if the user is authenticated and refresh their permissions once per app load.
 */
export const authenticate: NavigationGuard = async () => {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) return { name: RouteName.Login }

  if (!userStore.isUserRefreshed) {
    try {
      await userStore.refreshUser()
    } catch {
      // 401 is handled by the API interceptor (logs out). On other errors (e.g. offline)
      // continue with the stored user, the API still enforces permissions.
    }
  }
  return true
}

/**
 * Guard to allow only guests (unauthenticated users) to access certain routes.
 */
export const guestsOnly: NavigationGuard = async () => {
  if (useUserStore().isAuthenticated) return { name: RouteName.Dashboard }
  else return true
}

/**
 * Global guard: blocks routes whose `meta.permission` the user doesn't have.
 * Runs after `authenticate` (a per-route guard), so permissions are already refreshed.
 */
export const authorize: NavigationGuard = (to) => {
  const permission = to.meta.permission
  if (!permission || useUserStore().can(permission)) return true
  return { name: RouteName.Unauthorized }
}
