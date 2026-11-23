import type { PaginatedResponse, PaginationQuery } from '@/shared/api'
import type { ContractStatus } from '@/shared/contract'
import type { Agent, Company, Contract } from '@/shared/entities'
import type { UUID } from '@/shared/utils'

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

// SAVING (dates are YYYY-MM-DD)
export interface AgentRequest {
  name: string
  contactPhone?: string | null
  contactEmail?: string | null
  hireDate?: string | null
  notes?: string | null
  isActive: boolean
}

export interface CompanyRequest {
  name: string
  arabicName?: string | null
  country: string
  companyWebsite?: string | null
  contactInfo?: string | null
}

export interface ContractRequest {
  companyUuid: UUID
  contractNumber: string
  title: string
  status: ContractStatus
  startDate?: string | null
  endDate?: string | null
  note?: string | null
  /** A visa with a uuid is an existing one, without one it's added */
  visas: {
    uuid?: UUID
    tradeUuid: UUID
    visaNumber: string
    totalVisas: number
    note?: string | null
  }[]
}
