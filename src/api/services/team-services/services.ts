import api from '@/api'
import type { SuccessResponse } from '@/shared/api'
import type { CreateUserRequest, Role, UpdateUserRequest, User } from '@/shared/entities'
import type { PlatformTenant } from '@/shared/platform'
import { usePlatformStore } from '@/stores/platform'

/**
 * Whose users are managed: the logged in admin's own company (Team page), or any company
 * from the platform page, where requests carry the platform key instead of a login.
 */
export type TeamScope =
  | { kind: 'company' }
  | { kind: 'platform'; tenantUuid: PlatformTenant['uuid'] }

const base = (scope: TeamScope) =>
  scope.kind === 'company' ? 'users' : `platform/tenants/${scope.tenantUuid}/users`

const config = (scope: TeamScope) =>
  scope.kind === 'company'
    ? {}
    : { attachAccessToken: false, headers: { 'X-Platform-Key': usePlatformStore().key } }

export default {
  async fetchUsers(scope: TeamScope) {
    return (await api.get<SuccessResponse<User[]>>(base(scope), config(scope))).data
  },
  async fetchRoles(scope: TeamScope) {
    const url =
      scope.kind === 'company' ? 'users/roles' : `platform/tenants/${scope.tenantUuid}/roles`
    return (await api.get<SuccessResponse<Role[]>>(url, config(scope))).data
  },
  async createUser(scope: TeamScope, payload: CreateUserRequest) {
    return (await api.post<SuccessResponse<User>>(base(scope), payload, config(scope))).data
  },
  async updateUser(scope: TeamScope, uuid: User['uuid'], payload: UpdateUserRequest) {
    const url = `${base(scope)}/${uuid}`
    const method = scope.kind === 'company' ? api.put : api.patch
    return (await method<SuccessResponse<User>>(url, payload, config(scope))).data
  },
  async deleteUser(scope: TeamScope, uuid: User['uuid']) {
    await api.delete(`${base(scope)}/${uuid}`, config(scope))
  },
}
