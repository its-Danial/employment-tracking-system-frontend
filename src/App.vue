<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { onBeforeMount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import OfflineBanner from '@/components/OfflineBanner.vue'
import OverlayLoader from '@/components/loader/OverlayLoader.vue'
import { getErrorMessage } from '@/lib/api-errors'
import ErrorPage from '@/pages/ErrorPage.vue'
import { updateDocumentTitle } from '@/router'
import { useLoadingStore } from '@/stores/loading'
import { useLocaleStore } from '@/stores/locale'
import { usePresetStore } from '@/stores/preset'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const router = useRouter()
const loadingStore = useLoadingStore()
const tenantStore = useTenantStore()
const { locale, isRtl } = storeToRefs(useLocaleStore()) // Applies the saved language and direction
useToastStore()
usePresetStore() // Initialize color mode

watch(locale, () => updateDocumentTitle())

const tenantState = ref({ loading: true, error: null as string | null })
onBeforeMount(async () => {
  try {
    await router.isReady()
    // Platform admin pages are not tied to a company
    if (router.currentRoute.value.meta.platform) return
    await tenantStore.initializeTenant()
  } catch (error) {
    tenantState.value.error = getErrorMessage(error)
  } finally {
    tenantState.value.loading = false
  }
})
</script>

<template>
  <!-- Full width on phones so messages are readable -->
  <Toast
    :position="isRtl ? 'top-left' : 'top-right'"
    :breakpoints="{ '640px': { width: 'calc(100vw - 2rem)', right: '1rem', left: '1rem' } }"
  />
  <ConfirmDialog :style="{ width: '28rem' }" :breakpoints="{ '640px': '92vw' }" />
  <OfflineBanner />
  <OverlayLoader :loading="loadingStore.loading" />
  <router-view v-slot="{ Component, route }">
    <OverlayLoader v-if="tenantState.loading" :loading="tenantState.loading" />
    <component v-else-if="route.meta.platform" :is="Component" />
    <ErrorPage
      v-else-if="tenantState.error"
      :title="t('errors.companyLoadFailed')"
      :message="tenantState.error"
      :show-home-button="false"
    />
    <ErrorPage
      v-else-if="!tenantStore.tenant?.isActive"
      :title="t('errors.companyInactiveTitle')"
      :message="t('errors.companyInactive')"
      :show-home-button="false"
      :show-error-image="false"
    />
    <keep-alive v-else>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
