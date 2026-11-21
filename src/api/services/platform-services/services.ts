import api from '@/api'
import endpoints from '@/api/endpoints'
import type { CreateTenantRequest, PlatformTenant, UpdateTenantRequest } from '@/shared/platform'
import { usePlatformStore } from '@/stores/platform'
import type { PlatformTenantResponse, PlatformTenantsResponse } from './types'

/**
 * Platform requests use the platform admin key instead of a user's login
 */
const platformConfig = () => ({
  attachAccessToken: false,
  headers: { 'X-Platform-Key': usePlatformStore().key },
})

export default {
  async fetchTenants() {
    const response = await api.get<PlatformTenantsResponse>(endpoints.PLATFORM_TENANTS, {
      ...platformConfig(),
      showErrorMessageToast: false, // The page shows "invalid key" itself
    })
    return response.data
  },
  async createTenant(payload: CreateTenantRequest) {
    const response = await api.post<PlatformTenantResponse>(
      endpoints.PLATFORM_TENANTS,
      payload,
      platformConfig()
    )
    return response.data
  },
  async updateTenant(uuid: PlatformTenant['uuid'], payload: UpdateTenantRequest) {
    const response = await api.patch<PlatformTenantResponse>(
      endpoints.PLATFORM_TENANT(uuid),
      payload,
      platformConfig()
    )
    return response.data
  },
}
