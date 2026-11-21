import type { MaybeRefOrGetter } from 'vue'
import type { Candidate } from '@/shared/entities'
import type { PaymentsQuery } from './types'

/**
 * `queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })` refreshes every list,
 * total and candidate ledger
 */
const all = ['payments'] as const

export default {
  all,
  list: (params?: MaybeRefOrGetter<PaymentsQuery | undefined>) => [...all, 'list', params] as const,
  totals: (params?: MaybeRefOrGetter<PaymentsQuery | undefined>) =>
    [...all, 'totals', params] as const,
  ledger: (uuid: MaybeRefOrGetter<Candidate['uuid']>) => [...all, 'ledger', uuid] as const,
} as const
