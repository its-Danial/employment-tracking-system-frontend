// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

/**
 * Platform admin API: managing companies (tenants). Used by the hidden /platform page.
 */
import type { Tenant } from './entities.js'
import type { ISODateString, UUID } from './utils.js'

export interface PlatformTenant extends Tenant {
  uuid: UUID
  userCount: number
  createdAt: ISODateString
  updatedAt: ISODateString
}

/**
 * Subdomains that can't be used by a company, since the app itself needs them
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'platform',
  'mail',
  'static',
  'assets',
] as const

export interface CreateTenantRequest {
  name: string
  /** Lowercase letters, numbers and hyphens, e.g. `al-hazam` */
  subdomain: string
  contactEmail: string
  contactPhone?: string | null
  companyWebsite?: string | null
  /** Brand color as hex, e.g. `#0f766e` */
  color?: string | null
  /** First user of the company, gets the Admin role */
  admin: {
    fullName: string
    email: string
    password: string
  }
}

export interface UpdateTenantRequest {
  name?: string
  contactEmail?: string
  contactPhone?: string | null
  companyWebsite?: string | null
  color?: string | null
  isActive?: boolean
}
