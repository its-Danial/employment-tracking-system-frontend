import api from '@/api'
import endpoints from '@/api/endpoints'
import type {
  AgentsQuery,
  AgentsResponse,
  CompaniesQuery,
  CompaniesResponse,
  ContractsQuery,
  ContractsResponse,
} from './types'

/**
 * Employers, contracts and agents: the records candidates are linked to
 */
export default {
  async fetchCompanies(params?: CompaniesQuery, signal?: AbortSignal) {
    return (await api.get<CompaniesResponse>(endpoints.COMPANIES, { params, signal })).data
  },
  async fetchContracts(params?: ContractsQuery, signal?: AbortSignal) {
    return (await api.get<ContractsResponse>(endpoints.CONTRACTS, { params, signal })).data
  },
  async fetchAgents(params?: AgentsQuery, signal?: AbortSignal) {
    return (await api.get<AgentsResponse>(endpoints.AGENTS, { params, signal })).data
  },
}
