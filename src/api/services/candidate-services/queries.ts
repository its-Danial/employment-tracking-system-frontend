import { type MaybeRefOrGetter, toValue } from 'vue'
import type { DocumentType } from '@/shared/candidate'
import type {
  Candidate,
  CandidateDocument,
  CandidateRequest,
  CandidateStepRequest,
} from '@/shared/entities'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import directoryQueryKeys from '../directory-services/query-keys'
import queryKeys from './query-keys'
import services from './services'
import type { CandidatesQuery } from './types'

export default {
  useDashboard() {
    return useQuery({
      queryKey: queryKeys.dashboard(),
      queryFn: ({ signal }) => services.fetchDashboard(signal),
    })
  },
  useCandidates(params?: MaybeRefOrGetter<CandidatesQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.list(params),
      queryFn: ({ signal }) => services.fetchCandidates(toValue(params), signal),
      // Keep showing the current page while the next page/filter loads, instead of flashing empty
      placeholderData: keepPreviousData,
    })
  },
  useCandidate(
    uuid: MaybeRefOrGetter<Candidate['uuid']>,
    { enabled = true }: { enabled?: MaybeRefOrGetter<boolean> } = {}
  ) {
    return useQuery({
      queryKey: queryKeys.detail(uuid),
      queryFn: ({ signal }) => services.fetchCandidate(toValue(uuid), signal),
      enabled: () => toValue(enabled),
    })
  },
  useFilterOptions() {
    return useQuery({
      queryKey: queryKeys.filterOptions(),
      queryFn: ({ signal }) => services.fetchFilterOptions(signal),
      staleTime: 5 * 60_000,
    })
  },
  useFormOptions() {
    return useQuery({
      queryKey: queryKeys.formOptions(),
      queryFn: ({ signal }) => services.fetchFormOptions(signal),
      // Places on visas change as others save candidates, so always fetch fresh when the form opens
      staleTime: 0,
    })
  },
  useCreateCandidate() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: (payload: CandidateRequest) => services.createCandidate(payload),
      onSuccess: afterSave,
    })
  },
  useUpdateCandidate() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({ uuid, ...payload }: CandidateRequest & { uuid: Candidate['uuid'] }) =>
        services.updateCandidate(uuid, payload),
      onSuccess: afterSave,
    })
  },
  useRecordStep() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({ uuid, payload }: { uuid: Candidate['uuid']; payload: CandidateStepRequest }) =>
        services.recordStep(uuid, payload),
      onSuccess: afterSave,
    })
  },
  useUploadDocument() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({
        uuid,
        type,
        file,
      }: {
        uuid: Candidate['uuid']
        type: DocumentType
        file: File
      }) => services.uploadDocument(uuid, type, file),
      onSuccess: afterSave,
    })
  },
  useDeleteDocument() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({
        uuid,
        documentUuid,
      }: {
        uuid: Candidate['uuid']
        documentUuid: CandidateDocument['uuid']
      }) => services.deleteDocument(uuid, documentUuid),
      onSuccess: afterSave,
    })
  },
} as const

/**
 * A saved candidate changes lists, the dashboard numbers and visa places on contracts and
 * employers. The profile itself is updated straight from the response, without refetching.
 */
function useAfterSave() {
  const queryClient = useQueryClient()
  return (response: Awaited<ReturnType<typeof services.createCandidate>>) => {
    queryClient.setQueryData(queryKeys.detail(response.data.uuid), response)
    queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() })
    queryClient.invalidateQueries({ queryKey: queryKeys.formOptions() })
    queryClient.invalidateQueries({ queryKey: directoryQueryKeys.contracts().slice(0, 1) })
    queryClient.invalidateQueries({ queryKey: directoryQueryKeys.companies().slice(0, 1) })
    queryClient.invalidateQueries({ queryKey: directoryQueryKeys.agents().slice(0, 1) })
  }
}
