<script setup lang="ts">
import { storeToRefs } from 'pinia'
import GuillochePattern from '@/components/GuillochePattern.vue'
import { useTenantStore } from '@/stores/tenant'

/** Shown when a list has nothing in it, with the company's print as a quiet watermark */
defineProps<{ message: string }>()
const { tenant } = storeToRefs(useTenantStore())
</script>

<template>
  <div
    class="relative isolate flex min-h-56 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed border-surface-300 px-6 py-12 text-center dark:border-surface-700"
  >
    <GuillochePattern
      :seed="tenant?.subdomain ?? ''"
      class="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-72 -translate-1/2 text-gold-500/15"
    />
    <p class="max-w-sm text-muted-color">{{ message }}</p>
    <slot />
  </div>
</template>
