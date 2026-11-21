import type { MaybeRefOrGetter } from 'vue'
import type { PaginationQuery } from '@/shared/api'
import type { Trade } from '@/shared/entities'

/**
 * Hierarchical keys so related caches can be invalidated together, e.g. after an update:
 * `queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all })` refreshes every trade list and detail
 */
const all = ['trades'] as const

export default {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params?: MaybeRefOrGetter<PaginationQuery | undefined>) =>
    [...all, 'list', params] as const,
  details: () => [...all, 'detail'] as const,
  detail: (uuid: MaybeRefOrGetter<Trade['uuid']>) => [...all, 'detail', uuid] as const,
} as const
