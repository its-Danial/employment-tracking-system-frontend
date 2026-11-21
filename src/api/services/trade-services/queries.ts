import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaginationQuery } from '@/shared/api'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import queryKeys from './query-keys'
import services from './services'

export default {
  useTrades(params?: MaybeRefOrGetter<PaginationQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.list(params),
      queryFn: ({ signal }) => services.fetchTrades(toValue(params), signal),
      // Keep showing the current page while the next page/search loads, instead of flashing empty
      placeholderData: keepPreviousData,
    })
  },
} as const
