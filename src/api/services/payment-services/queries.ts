import { type MaybeRefOrGetter, toValue } from 'vue'
import type { Candidate, Payment, PaymentRequest } from '@/shared/entities'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import queryKeys from './query-keys'
import services from './services'
import type { PaymentsQuery } from './types'

export default {
  usePayments(params?: MaybeRefOrGetter<PaymentsQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.list(params),
      queryFn: ({ signal }) => services.fetchPayments(toValue(params), signal),
      placeholderData: keepPreviousData,
    })
  },
  useTotals(params?: MaybeRefOrGetter<PaymentsQuery | undefined>) {
    return useQuery({
      queryKey: queryKeys.totals(params),
      queryFn: ({ signal }) => services.fetchTotals(toValue(params), signal),
      placeholderData: keepPreviousData,
    })
  },
  useLedger(
    uuid: MaybeRefOrGetter<Candidate['uuid']>,
    { enabled = true }: { enabled?: MaybeRefOrGetter<boolean> } = {}
  ) {
    return useQuery({
      queryKey: queryKeys.ledger(uuid),
      queryFn: ({ signal }) => services.fetchLedger(toValue(uuid), signal),
      enabled: () => toValue(enabled),
    })
  },
  useRecordPayment() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({ uuid, payload }: { uuid: Candidate['uuid']; payload: PaymentRequest }) =>
        services.recordPayment(uuid, payload),
      onSuccess: (response, { uuid }) => afterSave(uuid, response),
    })
  },
  useDeletePayment() {
    const afterSave = useAfterSave()
    return useMutation({
      mutationFn: ({
        uuid,
        paymentUuid,
      }: {
        uuid: Candidate['uuid']
        paymentUuid: Payment['uuid']
      }) => services.deletePayment(uuid, paymentUuid),
      onSuccess: (response, { uuid }) => afterSave(uuid, response),
    })
  },
} as const

/** The ledger comes back with the response, everything else about money is refetched */
function useAfterSave() {
  const queryClient = useQueryClient()
  return (uuid: Candidate['uuid'], response: Awaited<ReturnType<typeof services.fetchLedger>>) => {
    queryClient.setQueryData(queryKeys.ledger(uuid), response)
    queryClient.invalidateQueries({ queryKey: [...queryKeys.all, 'list'] })
    queryClient.invalidateQueries({ queryKey: [...queryKeys.all, 'totals'] })
  }
}
