// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

/**
 * Records as the API returns them (JSON serialized: camelCase keys, dates as ISO strings)
 */
import type {
  CandidateActivityType,
  CandidateMedicalStatus,
  CandidateStage,
  CandidateStep,
  CandidateVisaStatus,
  DocumentType,
  PaymentKind,
  PaymentMethod,
} from './candidate.js'
import type { ContractStatus } from './contract.js'
import type { GrantedPermission } from './permissions.js'
import type { ISODateString, UUID } from './utils.js'

interface Timestamps {
  createdAt: ISODateString
  updatedAt: ISODateString
}

/**
 * Public company profile, shown before login
 */
export interface Tenant {
  name: string
  subdomain: string
  companyWebsite: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  isActive: boolean
  color: string | null
  logoUrl: string | null
  tagline: string | null
  description: string | null
}

export interface Role extends Timestamps {
  uuid: UUID
  name: string
  description: string | null
  permissions: GrantedPermission[]
  isSystem: boolean
}

export interface User extends Timestamps {
  uuid: UUID
  fullName: string | null
  email: string
  roleUuid: UUID | null
  role: Role | null
  /** Resolved from the role, `['*']` means everything */
  permissions: GrantedPermission[]
  isActive: boolean
}

export interface AccessToken {
  value: string
  expiresAt: ISODateString
}

export interface Trade extends Timestamps {
  uuid: UUID
  name: string
  description: string | null
}

/**
 * Returned by login and register
 */
export interface AuthSession {
  user: User
  token: AccessToken
}

/**
 * Foreign employer that sends visas (e.g. a Saudi construction company)
 */
export interface Company extends Timestamps {
  uuid: UUID
  name: string
  arabicName: string | null
  companyWebsite: string | null
  contactInfo: string | null
  country: string
  contractsCount: number
  activeContractsCount: number
  /** Visas across all of the company's contracts */
  totalVisas: number
  allocatedVisas: number
}

/**
 * Local sub-agent who brings in candidates
 */
export interface Agent extends Timestamps {
  uuid: UUID
  name: string
  contactPhone: string | null
  contactEmail: string | null
  hireDate: ISODateString | null
  isActive: boolean
  candidatesCount: number
  departedCount: number
}

/**
 * Visas for one trade under a contract, e.g. 20 electrician visas
 */
export interface ContractVisa {
  uuid: UUID
  visaNumber: string
  totalVisas: number
  allocatedVisas: number
  trade: { uuid: UUID; name: string }
}

export interface Contract extends Timestamps {
  uuid: UUID
  contractNumber: string
  title: string
  status: ContractStatus
  startDate: ISODateString | null
  endDate: ISODateString | null
  company: { uuid: UUID; name: string; country: string }
  visas: ContractVisa[]
}

/**
 * A candidate as shown in lists
 */
export interface CandidateSummary extends Timestamps {
  uuid: UUID
  name: string
  fatherName: string
  passportNumber: string
  phoneNumber: string | null
  stage: CandidateStage
  medicalStatus: CandidateMedicalStatus
  visaStatus: CandidateVisaStatus
  flightDate: ISODateString | null
  flightNumber: string | null
  /** From the visa the candidate is placed on, null until placed */
  trade: { uuid: UUID; name: string } | null
  company: { uuid: UUID; name: string; country: string } | null
  agent: { uuid: UUID; name: string } | null
}

export interface CandidateActivity {
  uuid: UUID
  activityType: CandidateActivityType
  /** For `stage_changed`: the stage moved to */
  newValue: string | null
  performedBy: { uuid: UUID; fullName: string | null } | null
  createdAt: ISODateString
}

export interface CandidateDocument {
  uuid: UUID
  type: DocumentType
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: ISODateString
}

export interface Candidate extends CandidateSummary {
  dateOfBirth: ISODateString
  cnicNumber: string
  medicalDate: ISODateString | null
  eNumber: string | null
  eNumberApplicationDate: ISODateString | null
  dropboxSubmissionDate: ISODateString | null
  visaIssuedDate: ISODateString | null
  fileDeliveredDate: ISODateString | null
  protectorDate: ISODateString | null
  protectorRegistrationNumber: string | null
  insurancePolicyNumber: string | null
  notes: string | null
  contract: { uuid: UUID; contractNumber: string; title: string } | null
  /** The visa the candidate is placed on */
  contractVisaUuid: UUID | null
  visaNumber: string | null
  /** What can be recorded next, null once departed */
  nextStep: CandidateStep | null
  /** Newest first */
  activities: CandidateActivity[]
  documents: CandidateDocument[]
}

export interface Dashboard {
  totalCandidates: number
  /** Every stage is present, 0 when empty */
  stageCounts: Record<CandidateStage, number>
  departedLast30Days: number
  /** Medically unfit or visa rejected, they can't move forward */
  blockedCount: number
  visas: { total: number; allocated: number }
  /** Ticketed candidates flying from today on, soonest first */
  upcomingFlights: CandidateSummary[]
  /** Newest first */
  recentActivity: (CandidateActivity & { candidate: { uuid: UUID; name: string } })[]
}

/**
 * Body of `POST /candidates` and `PUT /candidates/:uuid`. Dates are `YYYY-MM-DD`.
 */
export interface CandidateRequest {
  name: string
  fatherName: string
  dateOfBirth: ISODateString
  /** Two letters and seven digits, e.g. AB1234567 */
  passportNumber: string
  /** 12345-1234567-1 */
  cnicNumber: string
  phoneNumber?: string | null
  agentUuid?: UUID | null
  /** The visa they are placed on, uses one of its places */
  contractVisaUuid?: UUID | null
  notes?: string | null
}

/**
 * Body of `POST /candidates/:uuid/steps`, one shape per step. Dates are `YYYY-MM-DD`.
 */
export type CandidateStepRequest =
  | { step: 'medical'; medicalDate: ISODateString; medicalStatus: 'fit' | 'unfit' }
  | { step: 'e_number_application'; eNumberApplicationDate: ISODateString }
  | { step: 'e_number_issue'; eNumber: string }
  | { step: 'dropbox'; dropboxSubmissionDate: ISODateString }
  | {
      step: 'visa'
      visaStatus: 'issued' | 'rejected'
      visaIssuedDate?: ISODateString | null
      /** Needed for an issued visa when the candidate isn't placed yet */
      contractVisaUuid?: UUID | null
    }
  | {
      step: 'protector'
      protectorDate: ISODateString
      protectorRegistrationNumber?: string | null
      insurancePolicyNumber?: string | null
    }
  | { step: 'flight'; flightDate: ISODateString; flightNumber: string }
  | { step: 'departure'; fileDeliveredDate?: ISODateString | null }

/**
 * Choices for the candidate form: agents and visas that still have places
 */
export interface CandidateFormOptions {
  agents: { uuid: UUID; name: string }[]
  visas: {
    uuid: UUID
    visaNumber: string
    trade: string
    company: string
    country: string
    contractNumber: string
    remaining: number
  }[]
}

/**
 * One line in a candidate's money ledger. Amounts are whole Pakistani rupees.
 */
export interface Payment {
  uuid: UUID
  kind: PaymentKind
  amount: number
  /** What a charge is for, e.g. "Service fee", optional on payments */
  description: string | null
  method: PaymentMethod | null
  /** Receipt, bank or cheque number */
  reference: string | null
  paidOn: ISODateString
  recordedBy: { uuid: UUID; fullName: string | null } | null
  candidate: { uuid: UUID; name: string }
  createdAt: ISODateString
}

export interface PaymentTotals {
  charged: number
  received: number
  refunded: number
  /** charged - received + refunded, what's still owed */
  outstanding: number
}

/** A candidate's whole ledger, newest first */
export interface CandidateLedger {
  entries: Payment[]
  totals: PaymentTotals
}

/** Body of `POST /candidates/:uuid/payments` */
export interface PaymentRequest {
  kind: PaymentKind
  amount: number
  description?: string | null
  method?: PaymentMethod | null
  reference?: string | null
  paidOn: ISODateString
}

/** Choices for the candidate list filters */
export interface CandidateFilterOptions {
  agents: { uuid: UUID; name: string }[]
  companies: { uuid: UUID; name: string }[]
  trades: { uuid: UUID; name: string }[]
}
