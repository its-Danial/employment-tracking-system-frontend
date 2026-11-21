import api from '@/api'
import endpoints from '@/api/endpoints'
import type { PaginationQuery } from '@/shared/api'
import type { TradesResponse } from './types'

export default {
  /**
   * `signal` lets TanStack Query cancel the request when it's superseded (e.g. typing in search)
   */
  async fetchTrades(params?: PaginationQuery, signal?: AbortSignal) {
    return (await api.get<TradesResponse>(endpoints.TRADES, { params, signal })).data
  },
}
