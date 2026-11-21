<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { type AgentsQuery, directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import InitialsAvatar from '@/components/InitialsAvatar.vue'
import PageHeader from '@/components/PageHeader.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import SimpleCardSkeleton from '@/components/list/SimpleCardSkeleton.vue'
import { usePagedList } from '@/composables/use-paged-list'
import { formatBackendDateForDisplay } from '@/lib/utils'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<AgentsQuery>({ sortBy: 'name', sortOrder: 'asc' })
const { data: agentsRes, isLoading, isPlaceholderData } = directoryQueries.useAgents(queryParams)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.agents')" :subtitle="t('agents.subtitle')" />
    <SearchField v-model="filters.search" />

    <CardGrid :loading="isLoading" :refreshing="isPlaceholderData" :empty="!agentsRes?.data.length">
      <template #skeleton><SimpleCardSkeleton :lines="1" /></template>
      <AppCard
        v-for="agent in agentsRes?.data"
        :key="agent.uuid"
        class="gap-4"
        :class="{ 'opacity-70': !agent.isActive }"
      >
        <div class="flex items-center gap-3">
          <InitialsAvatar :name="agent.name" />
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-semibold text-color-emphasis">{{ agent.name }}</span>
            <span dir="ltr" class="truncate text-sm text-muted-color tabular-nums rtl:text-right">
              {{ agent.contactPhone ?? agent.contactEmail }}
            </span>
          </div>
          <Tag v-if="!agent.isActive" :value="t('agents.inactive')" severity="secondary" />
        </div>
        <div class="flex items-end justify-between gap-3">
          <span class="flex flex-col">
            <span class="text-2xl font-semibold tabular-nums">{{ agent.candidatesCount }}</span>
            <span class="text-sm text-muted-color">{{ t('nav.candidates') }}</span>
          </span>
          <span class="flex flex-col items-end text-sm text-muted-color rtl:items-start">
            <span>{{ t('agents.departed', { count: agent.departedCount }) }}</span>
            <span v-if="agent.hireDate">
              {{ t('agents.since', { date: formatBackendDateForDisplay(agent.hireDate) }) }}
            </span>
          </span>
        </div>
      </AppCard>
      <template #empty>
        <EmptyState :message="filters.search ? t('common.noResults') : t('agents.empty')" />
      </template>
    </CardGrid>

    <ListPagination
      v-model:page="filters.page!"
      :total="agentsRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
