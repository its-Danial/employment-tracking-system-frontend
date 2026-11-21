import type { PaginatedResponse, PaginationQuery } from '@/shared/api'
import type { ContractStatus } from '@/shared/contract'
import type { Agent, Company, Contract } from '@/shared/entities'

// REQUEST
export type CompaniesQuery = PaginationQuery<'name' | 'createdAt'>
export interface ContractsQuery
  extends PaginationQuery<'contractNumber' | 'startDate' | 'createdAt'> {
  status?: ContractStatus
}
export type AgentsQuery = PaginationQuery<'name' | 'createdAt'>

// RESPONSE
export type CompaniesResponse = PaginatedResponse<Company>
export type ContractsResponse = PaginatedResponse<Contract>
export type AgentsResponse = PaginatedResponse<Agent>
