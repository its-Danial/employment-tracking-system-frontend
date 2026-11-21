import type { SuccessResponse } from '@/shared/api'
import type { PlatformTenant } from '@/shared/platform'

export type PlatformTenantsResponse = SuccessResponse<PlatformTenant[]>
export type PlatformTenantResponse = SuccessResponse<PlatformTenant>
