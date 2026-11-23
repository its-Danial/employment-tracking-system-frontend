import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaginationQuery } from '@/shared/api'
import type { Trade } from '@/shared/entities'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
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
  useSaveTrade() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        uuid,
        ...payload
      }: {
        uuid?: Trade['uuid']
        name: string
        description?: string | null
      }) => services.saveTrade(payload, uuid),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
    })
  },
  useDeleteTrade() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (uuid: Trade['uuid']) => services.deleteTrade(uuid),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
    })
  },
} as const
