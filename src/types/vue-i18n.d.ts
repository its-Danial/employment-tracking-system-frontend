import type { MessageSchema } from '@/i18n'

/**
 * Makes `t('...')` / `$t('...')` keys type checked in every component
 */
declare module 'vue-i18n' {
  // Empty on purpose: this is how vue-i18n is told the message shape
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}
