<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePresetStore } from '@/stores/preset'

const { t } = useI18n()
const presetStore = usePresetStore()
</script>

<template>
  <!-- Picking a mode is remembered, until then the computer's setting is followed -->
  <Button
    @click="presetStore.toggleTheme"
    variant="text"
    severity="secondary"
    :aria-label="presetStore.isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    class="size-9"
  >
    <template #icon>
      <SunIcon v-if="presetStore.isDark" />
      <MoonIcon v-else />
    </template>
  </Button>
</template>
