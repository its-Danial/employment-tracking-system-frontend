import { type MaybeRefOrGetter, computed, toValue } from 'vue'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/shared/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import services, { type TeamScope } from './services'

const scopeKey = (scope: TeamScope) => (scope.kind === 'company' ? 'company' : scope.tenantUuid)
export const teamQueryKeys = {
  all: ['team'] as const,
  users: (scope: TeamScope) => ['team', scopeKey(scope), 'users'] as const,
  roles: (scope: TeamScope) => ['team', scopeKey(scope), 'roles'] as const,
}

export default {
  useUsers(scope: MaybeRefOrGetter<TeamScope>) {
    return useQuery({
      queryKey: computed(() => teamQueryKeys.users(toValue(scope))),
      queryFn: () => services.fetchUsers(toValue(scope)),
    })
  },
  useRoles(scope: MaybeRefOrGetter<TeamScope>) {
    return useQuery({
      queryKey: computed(() => teamQueryKeys.roles(toValue(scope))),
      queryFn: () => services.fetchRoles(toValue(scope)),
      staleTime: 5 * 60_000,
    })
  },
  useSaveUser(scope: MaybeRefOrGetter<TeamScope>) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ uuid, ...payload }: UpdateUserRequest & { uuid?: User['uuid'] }) =>
        uuid
          ? services.updateUser(toValue(scope), uuid, payload)
          : services.createUser(toValue(scope), payload as CreateUserRequest),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.users(toValue(scope)) }),
    })
  },
  useDeleteUser(scope: MaybeRefOrGetter<TeamScope>) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (uuid: User['uuid']) => services.deleteUser(toValue(scope), uuid),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.users(toValue(scope)) }),
    })
  },
} as const
