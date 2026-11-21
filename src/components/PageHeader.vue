<script setup lang="ts">
/** Title row at the top of a page, with optional one-line explanation and actions at the end */
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl leading-tight font-bold tracking-tight text-color-emphasis">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-muted-color">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="flex items-center gap-2">
      <slot />
    </div>
  </header>
</template>
