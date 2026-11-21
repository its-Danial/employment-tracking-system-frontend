<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { type CompaniesQuery, directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import MeterBar from '@/components/MeterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import SimpleCardSkeleton from '@/components/list/SimpleCardSkeleton.vue'
import { usePagedList } from '@/composables/use-paged-list'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<CompaniesQuery>({ sortBy: 'name', sortOrder: 'asc' })
const {
  data: companiesRes,
  isLoading,
  isPlaceholderData,
} = directoryQueries.useCompanies(queryParams)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.companies')" :subtitle="t('companies.subtitle')" />
    <SearchField v-model="filters.search" />

    <CardGrid
      :loading="isLoading"
      :refreshing="isPlaceholderData"
      :empty="!companiesRes?.data.length"
    >
      <template #skeleton><SimpleCardSkeleton /></template>
      <AppCard v-for="company in companiesRes?.data" :key="company.uuid" class="gap-4">
        <div class="flex flex-col gap-0.5">
          <span class="font-semibold text-color-emphasis">{{ company.name }}</span>
          <!-- Arabic name as printed on the employer's documents -->
          <span v-if="company.arabicName" dir="rtl" lang="ar" class="font-urdu text-muted-color">
            {{ company.arabicName }}
          </span>
        </div>
        <span class="text-sm">
          {{ company.country }}
          <span class="text-muted-color">
            &ensp;{{ t('companies.contracts', company.contractsCount) }}
            <template v-if="company.activeContractsCount">
              ({{ t('companies.active', { count: company.activeContractsCount }) }})
            </template>
          </span>
        </span>
        <div class="mt-auto flex flex-col gap-1.5">
          <span class="text-sm text-muted-color tabular-nums">
            {{
              t('companies.visasPlaced', {
                allocated: company.allocatedVisas,
                total: company.totalVisas,
              })
            }}
          </span>
          <MeterBar
            :value="company.allocatedVisas"
            :max="company.totalVisas"
            :label="company.name"
          />
        </div>
      </AppCard>
      <template #empty>
        <EmptyState :message="filters.search ? t('common.noResults') : t('companies.empty')" />
      </template>
    </CardGrid>

    <ListPagination
      v-model:page="filters.page!"
      :total="companiesRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
