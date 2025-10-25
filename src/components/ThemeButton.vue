<script lang="ts">
import { usePresetStore } from '@/stores/preset'
</script>

<script setup lang="ts">
const presetStore = usePresetStore()
</script>
<template>
  <Button
    @click="presetStore.toggleTheme"
    variant="text"
    :aria-label="presetStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :dt="{ padding: { y: 0, x: 0 }, iconOnlyWidth: 'fit' }"
    class="size-6"
    severity="contrast"
  >
    <template #icon>
      <SunIcon v-if="presetStore.isDark" />
      <MoonIcon v-else />
    </template>
  </Button>
</template>
