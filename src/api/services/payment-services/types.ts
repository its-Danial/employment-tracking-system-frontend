import type { PaginatedResponse, PaginationQuery, SuccessResponse } from '@/shared/api'
import type { PaymentKind, PaymentMethod } from '@/shared/candidate'
import type { CandidateLedger, Payment, PaymentTotals } from '@/shared/entities'

// REQUEST
export interface PaymentsQuery extends PaginationQuery<'paidOn' | 'amount' | 'createdAt'> {
  kind?: PaymentKind
  method?: PaymentMethod
  /** `YYYY-MM-DD` */
  from?: string
  to?: string
}

// RESPONSE
export type PaymentsResponse = PaginatedResponse<Payment>
export type PaymentTotalsResponse = SuccessResponse<PaymentTotals>
export type CandidateLedgerResponse = SuccessResponse<CandidateLedger>
