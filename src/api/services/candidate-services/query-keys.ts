import type { MaybeRefOrGetter } from 'vue'
import type { Candidate } from '@/shared/entities'
import type { CandidatesQuery } from './types'

/**
 * `queryClient.invalidateQueries({ queryKey: candidateQueryKeys.all })` refreshes every candidate
 * list, profile and the dashboard (its numbers are about candidates)
 */
const all = ['candidates'] as const

export default {
  all,
  dashboard: () => [...all, 'dashboard'] as const,
  formOptions: () => [...all, 'form-options'] as const,
  filterOptions: () => [...all, 'filter-options'] as const,
  lists: () => [...all, 'list'] as const,
  list: (params?: MaybeRefOrGetter<CandidatesQuery | undefined>) =>
    [...all, 'list', params] as const,
  details: () => [...all, 'detail'] as const,
  detail: (uuid: MaybeRefOrGetter<Candidate['uuid']>) => [...all, 'detail', uuid] as const,
} as const
