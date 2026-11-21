import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { parsePickedDate } from '@/lib/utils'

/**
 * Translated validation rules for forms, so every form shows the same wording.
 * Build the schema inside `computed()` so messages switch language with the UI.
 *
 * @example
 * const rules = useFormRules()
 * const resolver = computed(() =>
 *   zodResolver(z.object({ email: rules.email(t('auth.email')), password: rules.password(t('auth.password')) }))
 * )
 */
export function useFormRules() {
  const { t } = useI18n()

  const text = (field: string, { min = 1, max = 255 } = {}) =>
    z
      .string()
      .trim()
      .min(1, { error: t('validation.required', { field }) })
      .min(min, { error: t('validation.minLength', { field, min }) })
      .max(max, { error: t('validation.maxLength', { field, max }) })

  const optionalText = (field: string, { max = 255 } = {}) =>
    z
      .string()
      .trim()
      .max(max, { error: t('validation.maxLength', { field, max }) })
      .optional()

  return {
    text,
    optionalText,
    email: (field: string) =>
      z.email({
        error: (issue) =>
          issue.input ? t('validation.email') : t('validation.required', { field }),
      }),
    password: (field: string) => text(field, { min: 8, max: 100 }),
    optionalUrl: () => z.union([z.literal(''), z.url({ error: t('validation.url') })]).optional(),
    subdomain: (field: string) =>
      text(field, { min: 1, max: 30 }).regex(/^[a-z\d](?:[a-z\d-]{0,28}[a-z\d])?$/, {
        error: t('validation.subdomain'),
      }),
    /** Two letters and seven digits, upper-cased as typed */
    passport: (field: string) =>
      text(field)
        .transform((value) => value.toUpperCase())
        .pipe(z.string().regex(/^[A-Z]{2}\d{7}$/, { error: t('validation.passport') })),
    cnic: (field: string) => text(field).regex(/^\d{5}-\d{7}-\d$/, { error: t('validation.cnic') }),
    /** A picked date, `past` refuses dates after today */
    date: (field: string, { past = false } = {}) =>
      z
        .preprocess(parsePickedDate, z.date({ error: t('validation.required', { field }) }))
        .refine((date) => !past || date <= new Date(), {
          error: t('validation.pastDate', { field }),
        }),
    optionalDate: (field: string, { past = false } = {}) =>
      z
        .preprocess(parsePickedDate, z.date().nullable())
        .refine((date) => !date || !past || date <= new Date(), {
          error: t('validation.pastDate', { field }),
        }),
    hexColor: () =>
      z
        .union([
          z.literal(''),
          z.string().regex(/^#[\da-f]{6}$/i, { error: t('validation.color') }),
        ])
        .optional(),
  }
}
