import { type MaybeRefOrGetter, toValue } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import queryKeys from './query-keys'
import services from './services'
import type { AgentsQuery, CompaniesQuery, ContractsQuery } from './types'

export default {
  useCompanies(params?: MaybeRefOrGetter<CompaniesQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.companies(params),
      queryFn: ({ signal }) => services.fetchCompanies(toValue(params), signal),
      placeholderData: keepPreviousData,
    })
  },
  useContracts(params?: MaybeRefOrGetter<ContractsQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.contracts(params),
      queryFn: ({ signal }) => services.fetchContracts(toValue(params), signal),
      placeholderData: keepPreviousData,
    })
  },
  useAgents(params?: MaybeRefOrGetter<AgentsQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.agents(params),
      queryFn: ({ signal }) => services.fetchAgents(toValue(params), signal),
      placeholderData: keepPreviousData,
    })
  },
} as const
