<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { type PaymentsQuery, paymentQueries } from '@/api/services/payment-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import LedgerEntry from '@/components/payment/LedgerEntry.vue'
import { usePagedList } from '@/composables/use-paged-list'
import { formatMoney, toApiDate } from '@/lib/utils'
import { PAYMENT_KIND, PAYMENT_METHOD, type PaymentKind } from '@/shared/candidate'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<PaymentsQuery>({
  perPage: 20,
  sortBy: 'paidOn',
  sortOrder: 'desc',
})

// A date range picker gives [from, to], to is null until the second day is picked
const dateRange = ref<(Date | null)[] | null>(null)
watch(dateRange, (range) => {
  const [from, to] = range ?? []
  filters.value = {
    ...filters.value,
    from: from ? toApiDate(from) : undefined,
    to: to ? toApiDate(to) : from ? toApiDate(from) : undefined,
  }
})

const { data: paymentsRes, isLoading, isPlaceholderData } = paymentQueries.usePayments(queryParams)
const { data: totalsRes, isLoading: isLoadingTotals } = paymentQueries.useTotals(queryParams)
const totals = computed(() => totalsRes.value?.data)

const kindTabs = computed<{ value: PaymentKind | undefined; label: string }[]>(() => [
  { value: undefined, label: t('common.all') },
  { value: PAYMENT_KIND.payment, label: t('payments.kindPlural.payment') },
  { value: PAYMENT_KIND.charge, label: t('payments.kindPlural.charge') },
  { value: PAYMENT_KIND.refund, label: t('payments.kindPlural.refund') },
])
const methodOptions = computed(() =>
  Object.values(PAYMENT_METHOD).map((value) => ({ value, label: t(`payments.method.${value}`) }))
)
const isFiltered = computed(
  () => !!(filters.value.kind || filters.value.method || filters.value.from || filters.value.search)
)
function clearFilters() {
  dateRange.value = null
  filters.value = { ...filters.value, kind: undefined, method: undefined, search: undefined }
}

/**
 * "Still owed" only means something across every kind of entry. With one kind picked, the
 * headline is that kind's total instead.
 */
const headline = computed(() => {
  const kind = filters.value.kind
  if (!kind) return { label: t('payments.outstanding'), value: totals.value?.outstanding }
  const totalOf = {
    [PAYMENT_KIND.payment]: totals.value?.received,
    [PAYMENT_KIND.charge]: totals.value?.charged,
    [PAYMENT_KIND.refund]: totals.value?.refunded,
  }
  return { label: t(`payments.kindPlural.${kind}`), value: totalOf[kind] }
})

const summary = computed(() => [
  { label: t('payments.received'), value: totals.value?.received },
  { label: t('payments.charged'), value: totals.value?.charged },
  { label: t('payments.refunded'), value: totals.value?.refunded },
])
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-6xl flex-col gap-8">
    <PageHeader :title="t('pageTitles.payments')" :subtitle="t('payments.subtitle')" />

    <!-- What's still owed leads, the three figures it's made of sit beside it -->
    <AppCard class="flex-col gap-6 p-6! sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-muted-color">{{ headline.label }}</span>
        <Skeleton v-if="isLoadingTotals" width="12rem" height="2.75rem" />
        <span
          v-else
          dir="ltr"
          class="text-4xl font-bold tracking-tight text-color-emphasis rtl:text-right"
        >
          {{ formatMoney(headline.value ?? 0) }}
        </span>
      </div>
      <dl v-if="!filters.kind" class="grid grid-cols-3 gap-x-8 gap-y-1">
        <div v-for="item in summary" :key="item.label" class="flex flex-col">
          <dt class="text-sm text-muted-color">{{ item.label }}</dt>
          <Skeleton v-if="isLoadingTotals" width="5rem" height="1.25rem" />
          <dd v-else dir="ltr" class="text-lg font-semibold rtl:text-right">
            {{ formatMoney(item.value ?? 0) }}
          </dd>
        </div>
      </dl>
    </AppCard>

    <div class="flex flex-col gap-4">
      <nav class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        <button
          v-for="tab in kindTabs"
          :key="tab.value ?? 'all'"
          type="button"
          :aria-pressed="filters.kind === tab.value"
          class="chip"
          :class="{ 'chip-active': filters.kind === tab.value }"
          @click="filters.kind = tab.value"
        >
          {{ tab.label }}
        </button>
      </nav>
      <div class="flex flex-wrap items-center gap-3">
        <SearchField v-model="filters.search" />
        <Select
          v-model="filters.method"
          :options="methodOptions"
          option-label="label"
          option-value="value"
          :placeholder="t('payments.anyMethod')"
          :aria-label="t('payments.method_label')"
          show-clear
          class="w-full sm:w-48"
        />
        <DatePicker
          v-model="dateRange"
          selection-mode="range"
          date-format="dd/mm/yy"
          :placeholder="t('payments.dates')"
          :aria-label="t('payments.dates')"
          :max-date="new Date()"
          :manual-input="false"
          show-icon
          icon-display="input"
          show-button-bar
          class="w-full sm:w-64"
        />
        <Button
          v-if="isFiltered"
          :label="t('common.clearFilters')"
          severity="secondary"
          variant="text"
          @click="clearFilters"
        />
      </div>
    </div>

    <AppCard class="p-0!" :aria-busy="isLoading || isPlaceholderData">
      <ul
        v-if="isLoading"
        class="divide-y divide-surface-200 px-5 dark:divide-surface-800"
        aria-hidden="true"
      >
        <li v-for="n in 8" :key="n" class="flex items-center gap-4 py-4">
          <Skeleton width="5rem" height="0.875rem" />
          <div class="flex flex-1 flex-col gap-2">
            <Skeleton width="35%" height="0.875rem" />
            <Skeleton width="55%" height="0.75rem" />
          </div>
          <Skeleton width="6rem" height="1rem" />
        </li>
      </ul>
      <ul
        v-else-if="paymentsRes?.data.length"
        class="divide-y divide-surface-200 px-5 transition-opacity dark:divide-surface-800"
        :class="{ 'opacity-60': isPlaceholderData }"
      >
        <li v-for="entry in paymentsRes.data" :key="entry.uuid">
          <LedgerEntry :entry show-candidate />
        </li>
      </ul>
      <EmptyState
        v-else
        :message="isFiltered ? t('payments.emptyFiltered') : t('payments.empty')"
        class="border-0"
      />
    </AppCard>

    <ListPagination
      v-model:page="filters.page!"
      :total="paymentsRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
