import type { Candidate, CandidateDocument, Payment, Trade } from '@/shared/entities'
import type { PlatformTenant } from '@/shared/platform'

export default {
  // AUTH
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  // TENANT
  TENANT_INFO: 'tenant/info',
  // Trades
  TRADES: 'trades',
  TRADE: (uuid: Trade['uuid']) => `trades/${uuid}`,
  // Recruitment
  DASHBOARD: 'dashboard',
  CANDIDATES: 'candidates',
  CANDIDATE_FORM_OPTIONS: 'candidates/form-options',
  CANDIDATE: (uuid: Candidate['uuid']) => `candidates/${uuid}`,
  CANDIDATE_STEPS: (uuid: Candidate['uuid']) => `candidates/${uuid}/steps`,
  CANDIDATE_DOCUMENTS: (uuid: Candidate['uuid']) => `candidates/${uuid}/documents`,
  CANDIDATE_DOCUMENT: (uuid: Candidate['uuid'], documentUuid: CandidateDocument['uuid']) =>
    `candidates/${uuid}/documents/${documentUuid}`,
  CANDIDATE_DOCUMENT_DOWNLOAD: (uuid: Candidate['uuid'], documentUuid: CandidateDocument['uuid']) =>
    `candidates/${uuid}/documents/${documentUuid}/download`,
  CANDIDATE_FILTER_OPTIONS: 'candidates/filter-options',
  CANDIDATE_PAYMENTS: (uuid: Candidate['uuid']) => `candidates/${uuid}/payments`,
  CANDIDATE_PAYMENT: (uuid: Candidate['uuid'], paymentUuid: Payment['uuid']) =>
    `candidates/${uuid}/payments/${paymentUuid}`,
  PAYMENTS: 'payments',
  PAYMENT_TOTALS: 'payments/totals',
  COMPANIES: 'companies',
  CONTRACTS: 'contracts',
  AGENTS: 'agents',
  // PLATFORM (managing companies)
  PLATFORM_TENANTS: 'platform/tenants',
  PLATFORM_TENANT: (uuid: PlatformTenant['uuid']) => `platform/tenants/${uuid}`,
} as const
