<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouteName } from '@/types/router'

const { t } = useI18n()

const {
  title,
  message,
  showErrorImage = true,
  showHomeButton = true,
} = defineProps<{
  title?: string
  message?: string
  showErrorImage?: boolean
  showHomeButton?: boolean
}>()
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center overflow-hidden bg-surface-50 dark:bg-surface-950"
  >
    <div
      class="flex flex-col items-center gap-4 rounded-border bg-surface-0 px-8 py-20 shadow sm:px-20 dark:bg-surface-900"
    >
      <div
        class="flex size-12 items-center justify-center rounded-full border-2 border-red-400 text-red-400"
      >
        <ExclamationTriangleIcon class="size-6" />
      </div>
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
        {{ title ?? t('pageTitles.error') }}
      </h1>
      <span class="text-center text-muted-color">{{ message ?? t('errors.unexpected') }}</span>
      <img v-if="showErrorImage" src="/svg/error/asset-error.svg" alt="" width="80%" class="mt-4" />
      <Button
        v-if="showHomeButton"
        as="router-link"
        :label="t('common.goToDashboard')"
        :to="{ name: RouteName.Dashboard }"
        severity="danger"
        class="mt-6"
      />
      <!-- Extra actions -->
      <slot />
    </div>
  </div>
</template>
