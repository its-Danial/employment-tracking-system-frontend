import { defineStore } from 'pinia'
import { ref } from 'vue'
import tenantServices from '@/api/services/tenant-services'
import type { Tenant } from '@/shared/entities'
import { usePresetStore } from './preset'

const DEFAULT_TENANT_COLOR = '#0e4a3a'

export const useTenantStore = defineStore('tenant', () => {
  const presetStore = usePresetStore()

  const tenant = ref<Tenant>()

  async function initializeTenant() {
    try {
      tenant.value = (await tenantServices.info()).data
      // The default green already has a hand-tuned palette in the preset
      const color = tenant.value.color?.toLowerCase()
      if (color && color !== DEFAULT_TENANT_COLOR) presetStore.updateAppPreset(color)
    } catch (error) {
      throw error
    }
  }

  return { tenant, initializeTenant }
})
