<script setup lang="ts">
import { initialsOf } from '@/lib/utils'

defineProps<{ name: string }>()
</script>

<template>
  <span
    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 select-none dark:bg-primary-900/50 dark:text-primary-200"
    aria-hidden="true"
  >
    {{ initialsOf(name) }}
  </span>
</template>
