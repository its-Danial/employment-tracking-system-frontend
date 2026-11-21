<script setup lang="ts">
import AppCard from '@/components/AppCard.vue'
</script>

<template>
  <!-- Same layout as CandidateCard, so nothing jumps when the real cards arrive -->
  <AppCard class="gap-4" aria-hidden="true">
    <div class="flex items-start gap-3">
      <Skeleton shape="circle" size="2.5rem" />
      <div class="flex flex-1 flex-col gap-2 pt-0.5">
        <Skeleton width="60%" height="0.875rem" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <Skeleton width="4.5rem" height="1.375rem" />
    </div>
    <div class="flex min-h-10 flex-col gap-2">
      <Skeleton width="35%" height="0.75rem" />
      <Skeleton width="70%" height="0.75rem" />
    </div>
    <Skeleton height="0.25rem" />
    <div class="flex justify-between">
      <Skeleton width="6rem" height="0.75rem" />
      <Skeleton width="4rem" height="0.75rem" />
    </div>
  </AppCard>
</template>
