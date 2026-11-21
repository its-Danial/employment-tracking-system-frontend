<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatBackendDateForDisplay, formatMoney } from '@/lib/utils'
import { PAYMENT_KIND } from '@/shared/candidate'
import type { Payment } from '@/shared/entities'
import { RouteName } from '@/types/router'

/**
 * One line of a money statement. From the company's side: a payment is money in (+), a refund
 * is money out (−), a charge is what the candidate owes.
 */
const { entry, showCandidate = false } = defineProps<{ entry: Payment; showCandidate?: boolean }>()
const { t } = useI18n()

const title = computed(() => entry.description || t(`payments.kind.${entry.kind}`))
const details = computed(() =>
  [
    entry.description ? t(`payments.kind.${entry.kind}`) : null,
    entry.method ? t(`payments.method.${entry.method}`) : null,
    entry.reference,
    entry.recordedBy?.fullName ? t('payments.by', { name: entry.recordedBy.fullName }) : null,
  ]
    .filter(Boolean)
    .join(', ')
)
const sign = { [PAYMENT_KIND.payment]: '+', [PAYMENT_KIND.refund]: '−', [PAYMENT_KIND.charge]: '' }
const amountClass = {
  [PAYMENT_KIND.payment]: 'text-green-700 dark:text-green-400',
  [PAYMENT_KIND.refund]: 'text-amber-700 dark:text-amber-400',
  [PAYMENT_KIND.charge]: 'text-color-emphasis',
}
</script>

<template>
  <div class="flex items-start gap-4 py-3">
    <time :datetime="entry.paidOn" class="w-24 shrink-0 pt-px text-sm text-muted-color">
      {{ formatBackendDateForDisplay(entry.paidOn) }}
    </time>
    <div class="flex min-w-0 flex-1 flex-col">
      <span class="truncate font-medium text-color-emphasis">
        <router-link
          v-if="showCandidate"
          :to="{ name: RouteName.Candidate, params: { uuid: entry.candidate.uuid } }"
          class="hover:underline"
        >
          {{ entry.candidate.name }}
        </router-link>
        <template v-else>{{ title }}</template>
      </span>
      <span class="truncate text-sm text-muted-color">
        {{ showCandidate ? [title, details].filter(Boolean).join(', ') : details }}
      </span>
    </div>
    <span
      class="shrink-0 pt-px text-end font-semibold whitespace-nowrap"
      :class="amountClass[entry.kind]"
      dir="ltr"
    >
      {{ sign[entry.kind] }}{{ formatMoney(entry.amount) }}
    </span>
    <slot name="actions" />
  </div>
</template>
