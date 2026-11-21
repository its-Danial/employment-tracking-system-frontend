import { defineStore } from 'pinia'
import { computed } from 'vue'
import { palette, updatePreset } from '@primeuix/themes'
import { useColorMode } from '@vueuse/core'

export type ColorMode = 'light' | 'dark'

/** Relative luminance (0 black to 1 white) of a #rrggbb colour */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

export const usePresetStore = defineStore('preset', () => {
  // Follows the computer's light/dark setting until the user picks one, then remembers it.
  // New key: the old 'theme' key always held 'light', which ignored the computer's setting.
  const mode = useColorMode({
    selector: 'html',
    attribute: 'class',
    initialValue: 'auto',
    modes: { light: 'light', dark: 'dark' },
    storageKey: 'color-mode',
    storage: localStorage,
    disableTransition: true,
  })

  const isDark = computed(() => mode.state.value === 'dark')

  const toggleTheme = () => (mode.value = isDark.value ? 'light' : 'dark')
  const setTheme = (newTheme: ColorMode) => (mode.value = newTheme)

  /**
   * Rebuilds the primary palette around the company's brand colour, which sits at stop 500
   * like the default passport green. The cover (login panel, sidebar) uses it too; a light
   * colour is darkened there so the cream text on it stays readable.
   */
  function updateAppPreset(color: string) {
    updatePreset({
      semantic: {
        primary: palette(color),
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: '#ffffff',
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}',
            },
            highlight: {
              background: '{primary.50}',
              focusBackground: '{primary.100}',
              color: '{primary.700}',
              focusColor: '{primary.800}',
            },
          },
          dark: {
            primary: {
              color: '{primary.300}',
              contrastColor: '{primary.950}',
              hoverColor: '{primary.200}',
              activeColor: '{primary.100}',
            },
            highlight: {
              background: 'color-mix(in srgb, {primary.300}, transparent 84%)',
              focusBackground: 'color-mix(in srgb, {primary.300}, transparent 76%)',
              color: '{primary.100}',
              focusColor: '{primary.50}',
            },
          },
        },
      },
    })
    const cover = luminance(color) > 0.18 ? `color-mix(in oklab, ${color}, black 45%)` : color
    document.documentElement.style.setProperty('--tenant-cover', cover)
  }

  return {
    mode,
    isDark,
    toggleTheme,
    setTheme,
    updateAppPreset,
  }
})
