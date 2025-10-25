import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

export type ColorMode = 'light' | 'dark'

export const usePresetStore = defineStore('preset', () => {
  const theme = useColorMode({
    selector: 'html',
    attribute: 'class',
    initialValue: 'light',
    modes: { light: 'light', dark: 'dark' },
    storageKey: 'theme',
    storage: localStorage,
    disableTransition: true,
  })

  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => (theme.value = theme.value === 'light' ? 'dark' : 'light')
  const setTheme = (newTheme: ColorMode) => (theme.value = newTheme)

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  }
})
