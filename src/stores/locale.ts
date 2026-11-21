import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import i18n, { type AppLocale, LOCALES } from '@/i18n'
import { useStorage } from '@vueuse/core'

// Naskh renders reliably inside inputs, buttons and tables (Nastaliq needs much taller lines)
const URDU_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&display=swap'

/**
 * Loads the Urdu font only the first time Urdu is selected, English users never download it
 */
function loadUrduFont() {
  if (document.getElementById('urdu-font')) return
  const link = document.createElement('link')
  link.id = 'urdu-font'
  link.rel = 'stylesheet'
  link.href = URDU_FONT_URL
  document.head.append(link)
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = useStorage<AppLocale>('locale', 'en', localStorage)

  const isRtl = computed(() => LOCALES[locale.value].dir === 'rtl')
  const dateLocale = computed(() => LOCALES[locale.value].dateLocale)

  watch(
    locale,
    (newLocale) => {
      // Unknown value in storage (e.g. edited by hand) falls back to English
      if (!(newLocale in LOCALES)) {
        locale.value = 'en'
        return
      }
      i18n.global.locale.value = newLocale
      document.documentElement.lang = newLocale
      document.documentElement.dir = LOCALES[newLocale].dir
      if (newLocale === 'ur') loadUrduFont()
    },
    { immediate: true }
  )

  const setLocale = (newLocale: AppLocale) => (locale.value = newLocale)

  return { locale, isRtl, dateLocale, setLocale }
})
