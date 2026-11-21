import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorMessage, getFieldErrors } from '@/lib/api-errors'

function apiError(status: number, data: unknown = {}) {
  const response = { status, data, headers: {}, config: { headers: new AxiosHeaders() } }
  return new AxiosError('Request failed', 'ERR', undefined, undefined, response as AxiosResponse)
}

describe('getErrorMessage', () => {
  it('uses the server message for expected errors', () => {
    expect(getErrorMessage(apiError(400, { message: 'Invalid email or password' }))).toBe(
      'Invalid email or password'
    )
  })

  it('joins validation errors', () => {
    const error = apiError(422, {
      errors: [
        { field: 'name', message: 'Name is required', rule: 'required' },
        { field: 'email', message: 'Email is invalid', rule: 'email' },
      ],
    })
    expect(getErrorMessage(error)).toBe('Name is required\nEmail is invalid')
  })

  it('never shows server internals for 5xx', () => {
    const message = getErrorMessage(apiError(500, { message: 'relation "x" does not exist' }))
    expect(message).not.toContain('relation')
  })

  it('explains timeouts', () => {
    const error = new AxiosError('timeout', AxiosError.ECONNABORTED)
    expect(getErrorMessage(error)).toMatch(/too long/)
  })

  it('has a fallback for non-API errors', () => {
    expect(getErrorMessage(new TypeError('x is undefined'))).toMatch(/refresh the page/)
  })
})

describe('getFieldErrors', () => {
  it('maps validation errors by field', () => {
    const error = apiError(422, {
      errors: [{ field: 'email', message: 'Email is invalid', rule: 'email' }],
    })
    expect(getFieldErrors(error)).toEqual({ email: 'Email is invalid' })
  })

  it('returns nothing for other errors', () => {
    expect(getFieldErrors(apiError(500))).toEqual({})
  })
})
