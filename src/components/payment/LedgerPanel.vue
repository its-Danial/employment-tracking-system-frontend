<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { paymentQueries } from '@/api/services/payment-services'
import AppCard from '@/components/AppCard.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { formatMoney } from '@/lib/utils'
import type { Candidate, Payment } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'
import LedgerEntry from './LedgerEntry.vue'
import RecordPaymentDialog from './RecordPaymentDialog.vue'

/** A candidate's money: what's still owed up top, then every entry, newest first */
const { candidate } = defineProps<{ candidate: Candidate }>()

const { t } = useI18n()
const toast = useToastStore()
const confirmDelete = useConfirmDelete()
const { data: ledgerRes, isLoading } = paymentQueries.useLedger(() => candidate.uuid)
const deletePayment = paymentQueries.useDeletePayment()
const isRecording = ref(false)

const ledger = computed(() => ledgerRes.value?.data)
const outstanding = computed(() => ledger.value?.totals.outstanding ?? 0)
const balanceLabel = computed(() =>
  outstanding.value > 0
    ? t('payments.outstanding')
    : outstanding.value < 0
      ? t('payments.inCredit')
      : t('payments.settled')
)

const remove = (entry: Payment) =>
  confirmDelete({
    itemName: t('payments.deleteItem'),
    onConfirm: async () => {
      await deletePayment.mutateAsync({ uuid: candidate.uuid, paymentUuid: entry.uuid })
      toast.success(t('payments.deleted'))
    },
  })
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold">{{ t('nav.payments') }}</h2>
      <AccessControl :permission="PERMISSIONS.payments.create">
        <Button
          :label="t('payments.record')"
          severity="secondary"
          variant="outlined"
          size="small"
          @click="isRecording = true"
        >
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </div>

    <AppCard class="gap-0 p-0!">
      <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pt-4 pb-3">
        <div class="flex flex-col">
          <span class="text-sm text-muted-color">{{ balanceLabel }}</span>
          <Skeleton v-if="isLoading" width="7rem" height="1.75rem" class="mt-1" />
          <span
            v-else
            dir="ltr"
            class="text-2xl font-semibold tracking-tight rtl:text-right"
            :class="outstanding > 0 ? 'text-color-emphasis' : 'text-green-700 dark:text-green-400'"
          >
            {{ formatMoney(Math.abs(outstanding)) }}
          </span>
        </div>
        <dl v-if="ledger" class="flex gap-5 text-sm">
          <div class="flex flex-col">
            <dt class="text-muted-color">{{ t('payments.charged') }}</dt>
            <dd dir="ltr" class="font-medium rtl:text-right">
              {{ formatMoney(ledger.totals.charged) }}
            </dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-muted-color">{{ t('payments.received') }}</dt>
            <dd dir="ltr" class="font-medium rtl:text-right">
              {{ formatMoney(ledger.totals.received) }}
            </dd>
          </div>
        </dl>
      </div>

      <ul
        v-if="ledger?.entries.length"
        class="divide-y divide-surface-200 border-t border-surface-200 px-4 dark:divide-surface-800 dark:border-surface-800"
      >
        <li v-for="entry in ledger.entries" :key="entry.uuid">
          <LedgerEntry :entry>
            <template #actions>
              <AccessControl :permission="PERMISSIONS.payments.delete">
                <Button
                  variant="text"
                  severity="secondary"
                  size="small"
                  :aria-label="t('payments.remove')"
                  class="-my-1 -me-2 hover:text-red-600!"
                  @click="remove(entry)"
                >
                  <template #icon><TrashIcon /></template>
                </Button>
              </AccessControl>
            </template>
          </LedgerEntry>
        </li>
      </ul>
      <p
        v-else-if="!isLoading"
        class="border-t border-surface-200 px-4 py-5 text-center text-muted-color dark:border-surface-800"
      >
        {{ t('payments.empty') }}
      </p>
    </AppCard>

    <RecordPaymentDialog v-model:visible="isRecording" :candidate />
  </section>
</template>
