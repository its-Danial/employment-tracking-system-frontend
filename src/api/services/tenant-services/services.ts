import api from '@/api'
import endpoints from '@/api/endpoints'
import type { TenantInfoResponse } from './types'

export default {
  async info() {
    const response = await api.get<TenantInfoResponse>(endpoints.TENANT_INFO, {
      attachAccessToken: false,
      showErrorMessageToast: false, // App.vue shows a full page error instead
    })
    return response.data
  },
}
