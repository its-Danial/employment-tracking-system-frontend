// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

import type { ObjectValues } from './utils.js'

/**
 * Every permission in the app, grouped by module. Format: `<module>.<action>`.
 */
export const PERMISSIONS = {
  dashboard: { view: 'dashboard.view' },
  reports: { view: 'reports.view', export: 'reports.export' },
  candidates: {
    view: 'candidates.view',
    create: 'candidates.create',
    update: 'candidates.update',
    delete: 'candidates.delete',
  },
  contracts: {
    view: 'contracts.view',
    create: 'contracts.create',
    update: 'contracts.update',
    delete: 'contracts.delete',
  },
  companies: {
    view: 'companies.view',
    create: 'companies.create',
    update: 'companies.update',
    delete: 'companies.delete',
  },
  agents: {
    view: 'agents.view',
    create: 'agents.create',
    update: 'agents.update',
    delete: 'agents.delete',
  },
  /** Money received from and owed by candidates */
  payments: {
    view: 'payments.view',
    create: 'payments.create',
    delete: 'payments.delete',
  },
  trades: {
    view: 'trades.view',
    create: 'trades.create',
    update: 'trades.update',
    delete: 'trades.delete',
  },
  users: {
    view: 'users.view',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
  },
  roles: {
    view: 'roles.view',
    create: 'roles.create',
    update: 'roles.update',
    delete: 'roles.delete',
  },
  settings: { update: 'settings.update' },
} as const

/**
 * Grants every permission, including ones added in the future. Only used by the Admin role.
 */
export const WILDCARD_PERMISSION = '*'

export type Permission = ObjectValues<{
  [Module in keyof typeof PERMISSIONS]: ObjectValues<(typeof PERMISSIONS)[Module]>
}>

export type GrantedPermission = Permission | typeof WILDCARD_PERMISSION

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) =>
  Object.values(group)
) as Permission[]
