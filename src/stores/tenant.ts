import { defineStore } from 'pinia'
import { ref } from 'vue'
import tenantServices from '@/api/services/tenant-services'
import type { Tenant } from '@/types/tenant/intex'
import { usePresetStore } from './preset'

export const useTenantStore = defineStore('tenant', () => {
  const presetStore = usePresetStore()

  const tenant = ref<Tenant>()

  async function initializeTenant() {
    try {
      tenant.value = (await tenantServices.info()).data
      if (tenant.value.color) presetStore.updateAppPreset(tenant.value.color)
    } catch (error) {
      throw error
    }
  }

  return { tenant, initializeTenant }
})
