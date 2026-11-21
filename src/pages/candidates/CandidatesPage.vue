<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  type CandidateSortColumn,
  type CandidatesQuery,
  candidateQueries,
} from '@/api/services/candidate-services'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import CandidateCard from '@/components/candidate/CandidateCard.vue'
import CandidateCardSkeleton from '@/components/candidate/CandidateCardSkeleton.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import { usePagedList } from '@/composables/use-paged-list'
import { CANDIDATE_STAGE_ORDER, type CandidateStage } from '@/shared/candidate'
import { PERMISSIONS } from '@/shared/permissions'
import { RouteName } from '@/types/router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

/** Filters kept in the address, so dashboard links, shared links and "back" land on them */
const URL_FILTERS = ['stage', 'agentUuid', 'companyUuid', 'tradeUuid', 'needsAttention'] as const

function filtersFromUrl(): Pick<CandidatesQuery, (typeof URL_FILTERS)[number]> {
  const text = (key: string) =>
    typeof route.query[key] === 'string' ? route.query[key] : undefined
  const stage = text('stage') as CandidateStage | undefined
  return {
    stage: stage && CANDIDATE_STAGE_ORDER.includes(stage) ? stage : undefined,
    agentUuid: text('agentUuid'),
    companyUuid: text('companyUuid'),
    tradeUuid: text('tradeUuid'),
    needsAttention: text('needsAttention') === 'true' || undefined,
  }
}

const { filters, queryParams } = usePagedList<CandidatesQuery>({
  ...filtersFromUrl(),
  sortBy: 'updatedAt',
  sortOrder: 'desc',
})

// Both watchers only act while this page is the current route: when leaving (clicking a card)
// the query empties, and syncing then would redirect back here and cancel the navigation
const isCurrentRoute = () => route.name === RouteName.Candidates

watch(
  () => JSON.stringify(URL_FILTERS.map((key) => filters.value[key])),
  () => {
    if (!isCurrentRoute()) return
    const query = Object.fromEntries(
      URL_FILTERS.filter((key) => filters.value[key]).map((key) => [
        key,
        String(filters.value[key]),
      ])
    )
    router.replace({ query })
  }
)
watch(
  () => route.query,
  () => {
    if (isCurrentRoute()) filters.value = { ...filters.value, ...filtersFromUrl() }
  }
)

const { data: filterOptionsRes } = candidateQueries.useFilterOptions()
const filterOptions = computed(() => filterOptionsRes.value?.data)
const hasFilters = computed(
  () => !!filters.value.search || URL_FILTERS.some((key) => filters.value[key])
)
function clearFilters() {
  filters.value = {
    ...filters.value,
    search: undefined,
    ...Object.fromEntries(URL_FILTERS.map((key) => [key, undefined])),
  }
}

const {
  data: candidatesRes,
  isLoading,
  isPlaceholderData,
} = candidateQueries.useCandidates(queryParams)
// Counts for the stage tabs come from the dashboard numbers (same cache)
const { data: dashboardRes } = candidateQueries.useDashboard()

const stageTabs = computed(() => [
  { value: undefined, label: t('common.all'), count: dashboardRes.value?.data.totalCandidates },
  ...CANDIDATE_STAGE_ORDER.map((stage) => ({
    value: stage,
    label: t(`stages.${stage}`),
    count: dashboardRes.value?.data.stageCounts[stage],
  })),
])

const sortOptions = computed<{ label: string; value: string }[]>(() => [
  { label: t('candidates.sortRecent'), value: 'updatedAt:desc' },
  { label: t('candidates.sortNewest'), value: 'createdAt:desc' },
  { label: t('candidates.sortName'), value: 'name:asc' },
  { label: t('candidates.sortFlight'), value: 'flightDate:asc' },
])
const sort = computed({
  get: () => `${filters.value.sortBy}:${filters.value.sortOrder}`,
  set: (value: string) => {
    const [sortBy, sortOrder] = value.split(':') as [CandidateSortColumn, 'asc' | 'desc']
    filters.value = { ...filters.value, sortBy, sortOrder }
  },
})
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.candidates')" :subtitle="t('candidates.subtitle')">
      <AccessControl :permission="PERMISSIONS.candidates.create">
        <Button
          as="router-link"
          :to="{ name: RouteName.NewCandidate }"
          :label="t('candidates.add')"
        >
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </PageHeader>

    <div class="flex items-start gap-3">
      <!-- Stage tabs: what the office asks most is "who is at visa?", so it's one click -->
      <nav
        class="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 pb-1"
        :aria-label="t('candidates.progress')"
      >
        <button
          v-for="tab in stageTabs"
          :key="tab.value ?? 'all'"
          type="button"
          :aria-pressed="filters.stage === tab.value"
          class="chip"
          :class="{ 'chip-active': filters.stage === tab.value }"
          @click="filters.stage = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tabular-nums opacity-75">{{
            tab.count
          }}</span>
        </button>
      </nav>
      <Select
        v-model="sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        :aria-label="t('common.sort')"
        class="shrink-0"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <SearchField v-model="filters.search" />
      <Select
        v-model="filters.agentUuid"
        :options="filterOptions?.agents"
        option-label="name"
        option-value="uuid"
        :placeholder="t('candidates.anyAgent')"
        :aria-label="t('candidates.agent')"
        show-clear
        filter
        class="w-full sm:w-44"
      />
      <Select
        v-model="filters.companyUuid"
        :options="filterOptions?.companies"
        option-label="name"
        option-value="uuid"
        :placeholder="t('candidates.anyEmployer')"
        :aria-label="t('candidates.employer')"
        show-clear
        filter
        class="w-full sm:w-52"
      />
      <Select
        v-model="filters.tradeUuid"
        :options="filterOptions?.trades"
        option-label="name"
        option-value="uuid"
        :placeholder="t('candidates.anyTrade')"
        :aria-label="t('candidates.trade')"
        show-clear
        filter
        class="w-full sm:w-44"
      />
      <button
        type="button"
        class="chip"
        :class="{ 'chip-attention': filters.needsAttention }"
        :aria-pressed="!!filters.needsAttention"
        @click="filters.needsAttention = filters.needsAttention ? undefined : true"
      >
        <ExclamationTriangleIcon class="size-4!" />
        {{ t('candidates.needsAttention') }}
      </button>
      <Button
        v-if="hasFilters"
        :label="t('common.clearFilters')"
        severity="secondary"
        variant="text"
        @click="clearFilters"
      />
    </div>

    <CardGrid
      :loading="isLoading"
      :refreshing="isPlaceholderData"
      :empty="!candidatesRes?.data.length"
    >
      <template #skeleton><CandidateCardSkeleton /></template>
      <CandidateCard v-for="candidate in candidatesRes?.data" :key="candidate.uuid" :candidate />
      <template #empty>
        <EmptyState :message="hasFilters ? t('common.noResults') : t('candidates.empty')">
          <Button
            v-if="hasFilters"
            :label="t('common.clearFilters')"
            severity="secondary"
            variant="outlined"
            @click="clearFilters"
          />
        </EmptyState>
      </template>
    </CardGrid>

    <ListPagination
      v-model:page="filters.page!"
      :total="candidatesRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
