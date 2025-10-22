import type { NavigationGuard } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'

/**
 * Guard to allow only guests (unauthenticated users) to access certain routes.
 */
export const allowGuestsOnly: NavigationGuard = async () => {
  if (useUserStore().isAuthenticated) return { name: RouteName.Dashboard }
  else return true
}
