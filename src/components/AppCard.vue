<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

/** The one card surface used across the app. With `to` the whole card is a link. */
defineProps<{ to?: RouteLocationRaw }>()
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to
    class="flex flex-col rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900"
    :class="{
      'transition-colors hover:border-surface-400 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:border-surface-600':
        to,
    }"
  >
    <slot />
  </component>
</template>
