<script setup lang="ts">
/**
 * Responsive grid of cards. While the first load runs it shows `skeletonCount` skeleton cards,
 * while a new page or filter loads it dims the current cards instead of blanking them.
 */
const {
  loading,
  refreshing = false,
  empty,
  skeletonCount = 6,
} = defineProps<{
  loading: boolean
  refreshing?: boolean
  empty: boolean
  skeletonCount?: number
}>()
</script>

<template>
  <div v-if="loading || !empty" :aria-busy="loading || refreshing" class="card-grid">
    <template v-if="loading">
      <slot v-for="n in skeletonCount" :key="n" name="skeleton" />
    </template>
    <div v-else class="contents transition-opacity" :class="{ 'opacity-60': refreshing }">
      <slot />
    </div>
  </div>
  <slot v-else name="empty" />
</template>

<style scoped>
.card-grid {
  display: grid;
  gap: 0.875rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
}
.contents > :deep(*) {
  transition: opacity 150ms;
}
</style>
