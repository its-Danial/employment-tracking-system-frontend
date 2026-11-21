<script setup lang="ts">
import { computed } from 'vue'

/** Company logo, or its initials stamped in gold when there is no logo */
const { name = '', logoUrl } = defineProps<{ name?: string; logoUrl?: string | null }>()

const initials = computed(() =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')
)
</script>

<template>
  <img v-if="logoUrl" :src="logoUrl" :alt="name" class="size-full object-contain" />
  <span
    v-else
    class="flex size-full items-center justify-center rounded-md bg-passport font-bold tracking-tight text-gold-300 ring-1 ring-gold-500/50 select-none ring-inset"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>
