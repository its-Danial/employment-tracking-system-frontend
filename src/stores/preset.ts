import { defineStore } from 'pinia'
import { computed } from 'vue'
import { palette, updatePreset } from '@primeuix/themes'
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

  function updateAppPreset(color: string) {
    const newPalette = palette(color)
    updatePreset({
      semantic: {
        primary: newPalette,
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: '{primary.50}',
              hoverColor: '{primary.400}',
              activeColor: '{primary.300}',
            },
            highlight: {
              background: '{primary.500}',
              focusBackground: '{primary.400}',
              color: '{primary.50}',
              focusColor: '{primary.50}',
            },
          },
          dark: {
            primary: {
              color: '{primary.500}',
              contrastColor: '{primary.950}',
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}',
            },
            highlight: {
              background: '{primary.500}',
              focusBackground: '{primary.700}',
              color: '{primary.950}',
              focusColor: '{primary.950}',
            },
          },
        },
      },
    })
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    updateAppPreset,
  }
})
