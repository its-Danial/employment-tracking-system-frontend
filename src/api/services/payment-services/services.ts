import api from '@/api'
import endpoints from '@/api/endpoints'
import type { Candidate, Payment, PaymentRequest } from '@/shared/entities'
import type {
  CandidateLedgerResponse,
  PaymentTotalsResponse,
  PaymentsQuery,
  PaymentsResponse,
} from './types'

export default {
  async fetchPayments(params?: PaymentsQuery, signal?: AbortSignal) {
    return (await api.get<PaymentsResponse>(endpoints.PAYMENTS, { params, signal })).data
  },
  /** Totals for the same filters, across every page */
  async fetchTotals(params?: PaymentsQuery, signal?: AbortSignal) {
    const {
      page: _page,
      perPage: _perPage,
      sortBy: _sortBy,
      sortOrder: _order,
      ...filters
    } = params ?? {}
    return (
      await api.get<PaymentTotalsResponse>(endpoints.PAYMENT_TOTALS, { params: filters, signal })
    ).data
  },
  async fetchLedger(uuid: Candidate['uuid'], signal?: AbortSignal) {
    return (await api.get<CandidateLedgerResponse>(endpoints.CANDIDATE_PAYMENTS(uuid), { signal }))
      .data
  },
  async recordPayment(uuid: Candidate['uuid'], payload: PaymentRequest) {
    return (await api.post<CandidateLedgerResponse>(endpoints.CANDIDATE_PAYMENTS(uuid), payload))
      .data
  },
  async deletePayment(uuid: Candidate['uuid'], paymentUuid: Payment['uuid']) {
    return (
      await api.delete<CandidateLedgerResponse>(endpoints.CANDIDATE_PAYMENT(uuid, paymentUuid))
    ).data
  },
}
