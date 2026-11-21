import { AxiosError, isAxiosError, isCancel } from 'axios'
import i18n from '@/i18n'
import type { ApiErrorResponse } from '@/shared/api'

/**
 * Turns any error into a short message a non-technical user can act on, in their language.
 * Server internals (stack traces, SQL errors) are never shown. Messages the API sends are
 * already translated (it reads the Accept-Language header).
 */
export function getErrorMessage(error: unknown): string {
  const { t } = i18n.global
  if (!isAxiosError<ApiErrorResponse>(error)) return t('errors.unexpected')

  if (!error.response) {
    if (!navigator.onLine) return t('errors.offline')
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return t('errors.timeout')
    }
    return t('errors.unreachable')
  }

  const { status, data } = error.response
  const serverMessage = data?.message

  if (status === 422 && data?.errors?.length) {
    return data.errors.map((fieldError) => fieldError.message).join('\n')
  }
  if (status === 401) return t('errors.sessionExpired')
  if (status === 403) return t('errors.forbidden')
  if (status === 404) return serverMessage ?? t('errors.notFound')
  if (status === 429) return serverMessage ?? t('errors.tooManyRequests')
  if (status >= 500) return t('errors.server')

  return serverMessage ?? t('errors.generic')
}

/**
 * Validation errors keyed by field name, for showing messages under form inputs.
 * @example const errors = getFieldErrors(error) // { email: 'The email field must be a valid email' }
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError<ApiErrorResponse>(error) || error.response?.status !== 422) return {}
  return Object.fromEntries(
    (error.response.data?.errors ?? []).map((fieldError) => [fieldError.field, fieldError.message])
  )
}

/**
 * Requests cancelled on purpose (navigating away, a newer search) are not errors to report
 */
export const isCancelledRequest = (error: unknown) => isCancel(error)
