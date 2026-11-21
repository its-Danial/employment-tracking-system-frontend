<script setup lang="ts">
import { computed } from 'vue'

/** Thin filled bar for "x of y", e.g. visas filled */
const { value, max } = defineProps<{ value: number; max: number; label?: string }>()
const percent = computed(() => (max > 0 ? Math.min(100, (value / max) * 100) : 0))
</script>

<template>
  <div
    role="meter"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
    class="h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800"
  >
    <div
      class="h-full rounded-full bg-primary transition-[width] duration-500"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>
