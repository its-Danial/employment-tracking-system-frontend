/**
 * @see https://github.com/vinejs/vine/blob/main/src/reporters/simple_error_reporter.ts
 */
export interface ApiFieldError {
  message: string
  field: string
  rule: string
  index?: number
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  errors?: ApiFieldError[]
  message?: string
}

export interface ApiSuccessResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponseMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: `/?page=${number}`
  lastPageUrl: `/?page=${number}`
  nextPageUrl: `/?page=${number}` | null
  previousPageUrl: `/?page=${number}` | null
}

export interface PaginatedResponse<T> {
  meta: PaginatedResponseMeta
  data: T[]
}
