<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useOnline } from '@vueuse/core'

const { t } = useI18n()
const isOnline = useOnline()
const toast = useToastStore()

watch(isOnline, (online, wasOnline) => {
  if (online && wasOnline === false)
    toast.success(t('toast.backOnline'), t('toast.backOnlineTitle'))
})
</script>

<template>
  <div
    v-if="!isOnline"
    role="status"
    class="fixed inset-x-0 top-0 z-1100 flex items-center justify-center gap-2 bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
  >
    <WifiIcon class="shrink-0" />
    {{ t('offline.banner') }}
  </div>
</template>
