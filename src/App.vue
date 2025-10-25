<script setup lang="ts">
import Toast from 'primevue/toast'
import { onBeforeMount, ref } from 'vue'
import OverlayLoader from '@/components/loader/OverlayLoader.vue'
import ErrorPage from '@/pages/ErrorPage.vue'
import { useLoadingStore } from '@/stores/loading'
import { usePresetStore } from '@/stores/preset'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'

const loadingStore = useLoadingStore()
const tenantStore = useTenantStore()
useToastStore()
usePresetStore() // Initialize color mode

const tenantState = ref({ loading: true, error: null as string | null })
onBeforeMount(async () => {
  try {
    tenantState.value.loading = true
    await tenantStore.initializeTenant()
  } catch (error) {
    console.log('Error loading tenant details:', error)
    tenantState.value.error = error instanceof Error ? error.message : String(error)
  } finally {
    tenantState.value.loading = false
  }
})
</script>

<template>
  <Toast />
  <OverlayLoader :loading="loadingStore.loading" />
  <router-view v-slot="{ Component }">
    <OverlayLoader v-if="tenantState.loading" :loading="tenantState.loading" />
    <ErrorPage
      v-else-if="tenantState.error"
      title="Error while loading company details"
      :message="tenantState.error"
      :show-home-button="false"
    />
    <ErrorPage
      v-else-if="!tenantStore.tenant?.isActive"
      title="Company Inactive"
      message="Please contact support."
      :show-home-button="false"
      :show-error-image="false"
    />
    <keep-alive v-else>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
