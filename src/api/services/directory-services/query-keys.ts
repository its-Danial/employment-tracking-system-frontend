import type { MaybeRefOrGetter } from 'vue'
import type { AgentsQuery, CompaniesQuery, ContractsQuery } from './types'

export default {
  companies: (params?: MaybeRefOrGetter<CompaniesQuery | undefined>) =>
    ['companies', 'list', params] as const,
  contracts: (params?: MaybeRefOrGetter<ContractsQuery | undefined>) =>
    ['contracts', 'list', params] as const,
  agents: (params?: MaybeRefOrGetter<AgentsQuery | undefined>) =>
    ['agents', 'list', params] as const,
} as const
