<script setup lang="ts">
import AppCard from '@/components/AppCard.vue'

/** Generic card placeholder: a title, a couple of lines and a footer */
const { lines = 2 } = defineProps<{ lines?: number }>()
</script>

<template>
  <AppCard class="gap-4" aria-hidden="true">
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-1 flex-col gap-2">
        <Skeleton width="55%" height="0.9375rem" />
        <Skeleton width="35%" height="0.75rem" />
      </div>
      <Skeleton width="4rem" height="1.375rem" />
    </div>
    <div class="flex flex-col gap-2">
      <Skeleton v-for="n in lines" :key="n" :width="`${85 - n * 15}%`" height="0.75rem" />
    </div>
    <Skeleton height="0.375rem" />
  </AppCard>
</template>
