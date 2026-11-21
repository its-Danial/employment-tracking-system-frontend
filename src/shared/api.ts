// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

/**
 * Shape of every API response and of common query params
 */

export interface SuccessResponse<T> {
  data: T
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
  data: T[]
  metadata: PaginatedResponseMeta
}

/**
 * A validation error for one field (VineJS SimpleErrorReporter format)
 */
export interface ApiFieldError {
  message: string
  field: string
  rule: string
  index?: number
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  message?: string
  /** Present on validation errors (422) */
  errors?: ApiFieldError[]
}

export interface PaginationQuery<SortBy extends string = string> {
  search?: string
  /** Starts at 1 */
  page?: number
  /** Between 10 and 100 */
  perPage?: number
  sortBy?: SortBy
  sortOrder?: 'asc' | 'desc'
}
