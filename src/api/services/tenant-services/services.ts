import api from '@/api'
import endpoints from '@/api/endpoints'
import type { TenantInfoResponse } from './types'

export default {
  async info() {
    return (await api.get<TenantInfoResponse>(endpoints.TENANT_INFO, { attachAccessToken: false }))
      .data
  },
}
