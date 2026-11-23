import api from '@/api'
import endpoints from '@/api/endpoints'
import type { PaginationQuery, SuccessResponse } from '@/shared/api'
import type { Trade } from '@/shared/entities'
import type { TradesResponse } from './types'

export default {
  /**
   * `signal` lets TanStack Query cancel the request when it's superseded (e.g. typing in search)
   */
  async fetchTrades(params?: PaginationQuery, signal?: AbortSignal) {
    return (await api.get<TradesResponse>(endpoints.TRADES, { params, signal })).data
  },
  async saveTrade(payload: { name: string; description?: string | null }, uuid?: Trade['uuid']) {
    const request = uuid
      ? api.put<SuccessResponse<Trade>>(endpoints.TRADE(uuid), payload)
      : api.post<SuccessResponse<Trade>>(endpoints.TRADES, payload)
    return (await request).data
  },
  async deleteTrade(uuid: Trade['uuid']) {
    await api.delete(endpoints.TRADE(uuid))
  },
}
