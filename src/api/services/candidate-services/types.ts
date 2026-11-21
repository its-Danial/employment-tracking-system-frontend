import type { PaginatedResponse, PaginationQuery, SuccessResponse } from '@/shared/api'
import type { CandidateStage } from '@/shared/candidate'
import type {
  Candidate,
  CandidateFilterOptions,
  CandidateFormOptions,
  CandidateSummary,
  Dashboard,
} from '@/shared/entities'

// REQUEST
export type CandidateSortColumn = 'name' | 'createdAt' | 'updatedAt' | 'flightDate'

export interface CandidatesQuery extends PaginationQuery<CandidateSortColumn> {
  stage?: CandidateStage
  agentUuid?: string
  companyUuid?: string
  tradeUuid?: string
  needsAttention?: boolean
}

// RESPONSE
export type CandidatesResponse = PaginatedResponse<CandidateSummary>
export type CandidateResponse = SuccessResponse<Candidate>
export type DashboardResponse = SuccessResponse<Dashboard>
export type CandidateFormOptionsResponse = SuccessResponse<CandidateFormOptions>
export type CandidateFilterOptionsResponse = SuccessResponse<CandidateFilterOptions>
