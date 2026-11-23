import { type MaybeRefOrGetter, toValue } from 'vue'
import type { Agent, Company, Contract } from '@/shared/entities'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import candidateQueryKeys from '../candidate-services/query-keys'
import queryKeys from './query-keys'
import services from './services'
import type {
  AgentRequest,
  AgentsQuery,
  CompaniesQuery,
  CompanyRequest,
  ContractRequest,
  ContractsQuery,
} from './types'

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
  useContract(uuid: MaybeRefOrGetter<Contract['uuid'] | undefined>) {
    return useQuery({
      queryKey: ['contracts', 'detail', uuid] as const,
      queryFn: ({ signal }) => services.fetchContract(toValue(uuid)!, signal),
      enabled: () => !!toValue(uuid),
    })
  },
  useSaveAgent: () =>
    useSave(({ uuid, ...payload }: AgentRequest & { uuid?: Agent['uuid'] }) =>
      services.saveAgent(payload, uuid)
    ),
  useDeleteAgent: () => useSave((uuid: Agent['uuid']) => services.deleteAgent(uuid)),
  useSaveCompany: () =>
    useSave(({ uuid, ...payload }: CompanyRequest & { uuid?: Company['uuid'] }) =>
      services.saveCompany(payload, uuid)
    ),
  useDeleteCompany: () => useSave((uuid: Company['uuid']) => services.deleteCompany(uuid)),
  useSaveContract: () =>
    useSave(({ uuid, ...payload }: ContractRequest & { uuid?: Contract['uuid'] }) =>
      services.saveContract(payload, uuid)
    ),
  useDeleteContract: () => useSave((uuid: Contract['uuid']) => services.deleteContract(uuid)),
} as const

/**
 * Any change to agents, employers or contracts can show up elsewhere (filters, the visa
 * dropdown, dashboard numbers), so all of those lists are refetched.
 */
function useSave<Variables, Result>(mutationFn: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const key of ['agents', 'companies', 'contracts']) {
        queryClient.invalidateQueries({ queryKey: [key] })
      }
      queryClient.invalidateQueries({ queryKey: candidateQueryKeys.all })
    },
  })
}
