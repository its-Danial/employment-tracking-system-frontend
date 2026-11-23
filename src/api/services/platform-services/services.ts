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
      { ...platformConfig(), timeout: 120_000 } // Sample data takes a few seconds to load
    )
    return response.data
  },
  async resetSampleData(uuid: PlatformTenant['uuid']) {
    const response = await api.post<PlatformTenantResponse>(
      `${endpoints.PLATFORM_TENANT(uuid)}/reset-sample-data`,
      {},
      { ...platformConfig(), timeout: 120_000 } // Loading sample data takes a few seconds
    )
    return response.data
  },
  /** Only a deactivated company; `subdomain` is the typed confirmation */
  async deleteTenant(uuid: PlatformTenant['uuid'], subdomain: string) {
    await api.delete(endpoints.PLATFORM_TENANT(uuid), { ...platformConfig(), data: { subdomain } })
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
