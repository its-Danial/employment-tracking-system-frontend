import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PlatformTenant, UpdateTenantRequest } from '@/shared/platform'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import queryKeys from './query-keys'
import services from './services'

export default {
  useTenants(enabled: MaybeRefOrGetter<boolean>) {
    return useQuery({
      queryKey: queryKeys.tenants(),
      queryFn: () => services.fetchTenants(),
      enabled: () => toValue(enabled),
    })
  },

  useCreateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: services.createTenant,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants() }),
    })
  },

  useResetSampleData() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: services.resetSampleData,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants() }),
    })
  },

  useDeleteTenant() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ uuid, subdomain }: { uuid: PlatformTenant['uuid']; subdomain: string }) =>
        services.deleteTenant(uuid, subdomain),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants() }),
    })
  },

  useUpdateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ uuid, ...changes }: UpdateTenantRequest & { uuid: PlatformTenant['uuid'] }) =>
        services.updateTenant(uuid, changes),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants() }),
    })
  },
} as const
