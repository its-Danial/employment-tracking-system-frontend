import api from '@/api'
import endpoints from '@/api/endpoints'
import type { SuccessResponse } from '@/shared/api'
import type { Agent, Company, Contract } from '@/shared/entities'
import type {
  AgentRequest,
  AgentsQuery,
  AgentsResponse,
  CompaniesQuery,
  CompaniesResponse,
  CompanyRequest,
  ContractRequest,
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
  // Saving: a uuid updates, without one creates
  async saveAgent(payload: AgentRequest, uuid?: Agent['uuid']) {
    const request = uuid
      ? api.put<SuccessResponse<Agent>>(`${endpoints.AGENTS}/${uuid}`, payload)
      : api.post<SuccessResponse<Agent>>(endpoints.AGENTS, payload)
    return (await request).data
  },
  async deleteAgent(uuid: Agent['uuid']) {
    await api.delete(`${endpoints.AGENTS}/${uuid}`)
  },
  async saveCompany(payload: CompanyRequest, uuid?: Company['uuid']) {
    const request = uuid
      ? api.put<SuccessResponse<Company>>(`${endpoints.COMPANIES}/${uuid}`, payload)
      : api.post<SuccessResponse<Company>>(endpoints.COMPANIES, payload)
    return (await request).data
  },
  async deleteCompany(uuid: Company['uuid']) {
    await api.delete(`${endpoints.COMPANIES}/${uuid}`)
  },
  async fetchContract(uuid: Contract['uuid'], signal?: AbortSignal) {
    return (await api.get<SuccessResponse<Contract>>(`${endpoints.CONTRACTS}/${uuid}`, { signal }))
      .data
  },
  async saveContract(payload: ContractRequest, uuid?: Contract['uuid']) {
    const request = uuid
      ? api.put<SuccessResponse<Contract>>(`${endpoints.CONTRACTS}/${uuid}`, payload)
      : api.post<SuccessResponse<Contract>>(endpoints.CONTRACTS, payload)
    return (await request).data
  },
  async deleteContract(uuid: Contract['uuid']) {
    await api.delete(`${endpoints.CONTRACTS}/${uuid}`)
  },
}
