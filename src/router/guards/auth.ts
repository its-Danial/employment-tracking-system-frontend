import type { NavigationGuard } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'

/**
 * Guard to check if the user is authenticated and load user data if not present.
 */
export const authenticate: NavigationGuard = async () => {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) return { name: RouteName.Login }
  // TODO: fetch user permissions
  else return true
}

/**
 * Guard to allow only guests (unauthenticated users) to access certain routes.
 */
export const guestsOnly: NavigationGuard = async () => {
  if (useUserStore().isAuthenticated) return { name: RouteName.Dashboard }
  else return true
}
