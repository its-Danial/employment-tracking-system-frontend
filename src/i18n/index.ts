import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ur from './locales/ur.json'

export type MessageSchema = typeof en

export const LOCALES = {
  en: { label: 'English', dir: 'ltr', dateLocale: 'en-US' },
  ur: { label: 'اردو', dir: 'rtl', dateLocale: 'ur-PK' },
} as const

export type AppLocale = keyof typeof LOCALES

// Type check: the Urdu file must have every key the English one has
const urMessages: MessageSchema = ur

/**
 * Use `const { t } = useI18n()` in components and `i18n.global.t` elsewhere (stores, api).
 * Keys are type checked, a typo or missing translation is a compile error.
 */
const i18n = createI18n<[MessageSchema], AppLocale, false>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ur: urMessages },
})

export default i18n
