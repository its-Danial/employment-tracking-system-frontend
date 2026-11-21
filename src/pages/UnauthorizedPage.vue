<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ErrorPage from '@/pages/ErrorPage.vue'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// Plain wording: most users won't know what a "permission" or "role" is
const message = computed(() => (userStore.user?.role ? t('errors.noAccess') : t('errors.noRole')))
</script>

<template>
  <ErrorPage
    :title="t('errors.noAccessTitle')"
    :message
    :show-error-image="false"
    :show-home-button="!!userStore.user?.role"
  >
    <Button
      v-if="userStore.isAuthenticated"
      :label="t('common.logout')"
      variant="text"
      severity="secondary"
      @click="userStore.logout()"
    />
  </ErrorPage>
</template>
