// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

import type { ObjectValues } from './utils.js'

export const CONTRACT_STATUS = {
  active: 'active',
  inactive: 'inactive',
  cancelled: 'cancelled',
  completed: 'completed',
} as const

export type ContractStatus = ObjectValues<typeof CONTRACT_STATUS>
