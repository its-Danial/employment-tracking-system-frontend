<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { tradeQueries } from '@/api/services/trade-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import { usePagedList } from '@/composables/use-paged-list'
import type { PaginationQuery } from '@/shared/api'
import { PERMISSIONS } from '@/shared/permissions'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<PaginationQuery<'name' | 'createdAt' | 'updatedAt'>>({
  sortBy: 'name',
  sortOrder: 'asc',
})
const { data: tradesRes, isLoading, isPlaceholderData } = tradeQueries.useTrades(queryParams)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.trades')" :subtitle="t('trades.subtitle')">
      <AccessControl :permission="PERMISSIONS.trades.create">
        <Button :label="t('common.new')">
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </PageHeader>
    <SearchField v-model="filters.search" />

    <CardGrid :loading="isLoading" :refreshing="isPlaceholderData" :empty="!tradesRes?.data.length">
      <template #skeleton>
        <AppCard class="gap-2" aria-hidden="true">
          <Skeleton width="45%" height="0.9375rem" />
          <Skeleton width="75%" height="0.75rem" />
        </AppCard>
      </template>
      <AppCard v-for="trade in tradesRes?.data" :key="trade.uuid" class="gap-1">
        <span class="font-semibold text-color-emphasis">{{ trade.name }}</span>
        <span v-if="trade.description" class="text-sm text-muted-color">
          {{ trade.description }}
        </span>
      </AppCard>
      <template #empty>
        <EmptyState :message="t('common.noResults')" />
      </template>
    </CardGrid>

    <ListPagination
      v-model:page="filters.page!"
      :total="tradesRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
