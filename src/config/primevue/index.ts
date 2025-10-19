import type { PrimeVueConfiguration } from 'primevue/config'
import Aura from '@primeuix/themes/aura'

export default {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue, primevue.overrides, components, utilities',
      },
    },
  },
} as PrimeVueConfiguration
