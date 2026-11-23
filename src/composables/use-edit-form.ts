import { type Ref, ref } from 'vue'
import type { z } from 'zod'
import { getFieldErrors } from '@/lib/api-errors'

/**
 * State for a small edit form (dialogs): values, errors per field, client checks with a zod
 * schema and the API's validation errors under the same fields.
 *
 * @example
 * const form = useEditForm(() => ({ name: '' }), () => z.object({ name: rules.text(t('x')) }))
 * if (!form.validate()) return
 * try { await save(form.values.value) } catch (error) { form.showServerErrors(error) }
 */
export function useEditForm<Values extends object>(empty: () => Values, schema: () => z.ZodType) {
  const values = ref(empty()) as Ref<Values>
  const errors = ref<Record<string, string>>({})

  /** Starts over, optionally from an existing record */
  function reset(initial: Partial<Values> = {}) {
    values.value = { ...empty(), ...initial }
    errors.value = {}
  }

  function validate() {
    const result = schema().safeParse(values.value)
    errors.value = result.success
      ? {}
      : Object.fromEntries(
          result.error.issues.reverse().map((issue) => [issue.path.join('.'), issue.message])
        )
    return result.success
  }

  const showServerErrors = (error: unknown) => (errors.value = getFieldErrors(error))

  return { values, errors, reset, validate, showServerErrors }
}
