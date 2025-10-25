import type { PrimeVueConfiguration } from 'primevue/config'
import preset from './preset'

export default {
  theme: {
    preset,
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
