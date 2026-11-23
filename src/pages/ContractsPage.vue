<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { type ContractsQuery, directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import CardActions from '@/components/CardActions.vue'
import EmptyState from '@/components/EmptyState.vue'
import MeterBar from '@/components/MeterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import SimpleCardSkeleton from '@/components/list/SimpleCardSkeleton.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { usePagedList } from '@/composables/use-paged-list'
import { formatBackendDateForDisplay } from '@/lib/utils'
import { CONTRACT_STATUS, type ContractStatus } from '@/shared/contract'
import type { Contract } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'
import { RouteName } from '@/types/router'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<ContractsQuery>({
  sortBy: 'startDate',
  sortOrder: 'desc',
})
const {
  data: contractsRes,
  isLoading,
  isPlaceholderData,
} = directoryQueries.useContracts(queryParams)

const router = useRouter()
const toast = useToastStore()
const confirmDelete = useConfirmDelete()
const deleteContract = directoryQueries.useDeleteContract()
const remove = (contract: Contract) =>
  confirmDelete({
    itemName: t('contracts.deleteItem', { number: contract.contractNumber }),
    onConfirm: async () => {
      await deleteContract.mutateAsync(contract.uuid)
      toast.success(t('common.deleted'))
    },
  })

const statusClass: Record<ContractStatus, string> = {
  [CONTRACT_STATUS.active]: 'text-primary',
  [CONTRACT_STATUS.inactive]: 'text-muted-color',
  [CONTRACT_STATUS.completed]: 'text-gold-600 dark:text-gold-300',
  [CONTRACT_STATUS.cancelled]: 'text-red-600 dark:text-red-400',
}
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.contracts')" :subtitle="t('contracts.subtitle')">
      <AccessControl :permission="PERMISSIONS.contracts.create">
        <Button as="router-link" :to="{ name: RouteName.NewContract }" :label="t('contracts.add')">
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </PageHeader>
    <div class="flex flex-col gap-4">
      <nav class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        <button
          v-for="status in [undefined, ...Object.values(CONTRACT_STATUS)]"
          :key="status ?? 'all'"
          type="button"
          class="chip"
          :class="{ 'chip-active': filters.status === status }"
          :aria-pressed="filters.status === status"
          @click="filters.status = status"
        >
          {{ status ? t(`contractStatus.${status}`) : t('contracts.anyStatus') }}
        </button>
      </nav>
      <SearchField v-model="filters.search" />
    </div>

    <CardGrid
      :loading="isLoading"
      :refreshing="isPlaceholderData"
      :empty="!contractsRes?.data.length"
    >
      <template #skeleton><SimpleCardSkeleton :lines="3" /></template>
      <AppCard v-for="contract in contractsRes?.data" :key="contract.uuid" class="gap-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col">
            <span class="truncate font-semibold text-color-emphasis">
              {{ contract.company.name }}
            </span>
            <span class="truncate text-sm text-muted-color">
              {{ contract.title }}, {{ contract.company.country }}
            </span>
          </div>
          <span
            class="shrink-0 -rotate-2 rounded-[4px] border-[1.5px] border-current px-1.5 text-[0.8125rem] font-semibold rtl:rotate-2"
            :class="statusClass[contract.status]"
          >
            {{ t(`contractStatus.${contract.status}`) }}
          </span>
          <CardActions
            :name="contract.contractNumber"
            :edit-permission="PERMISSIONS.contracts.update"
            :delete-permission="PERMISSIONS.contracts.delete"
            @edit="router.push({ name: RouteName.EditContract, params: { uuid: contract.uuid } })"
            @delete="remove(contract)"
          />
        </div>

        <ul v-if="contract.visas.length" class="flex flex-col gap-3">
          <li v-for="visa in contract.visas" :key="visa.uuid" class="flex flex-col gap-1.5">
            <span class="flex items-baseline justify-between gap-3 text-sm">
              <span class="font-medium">{{ visa.trade.name }}</span>
              <span class="text-muted-color tabular-nums">
                {{
                  t('contracts.placed', {
                    allocated: visa.allocatedVisas,
                    total: visa.totalVisas,
                  })
                }}
              </span>
            </span>
            <MeterBar
              :value="visa.allocatedVisas"
              :max="visa.totalVisas"
              :label="visa.trade.name"
            />
          </li>
        </ul>
        <p v-else class="text-sm text-muted-color">{{ t('contracts.noVisas') }}</p>

        <div class="mt-auto flex items-center justify-between gap-3 text-sm text-muted-color">
          <span dir="ltr" class="tabular-nums">{{ contract.contractNumber }}</span>
          <span v-if="contract.startDate && contract.endDate">
            {{
              t('contracts.period', {
                start: formatBackendDateForDisplay(contract.startDate),
                end: formatBackendDateForDisplay(contract.endDate),
              })
            }}
          </span>
        </div>
      </AppCard>
      <template #empty>
        <EmptyState
          :message="filters.search || filters.status ? t('common.noResults') : t('contracts.empty')"
        />
      </template>
    </CardGrid>

    <ListPagination
      v-model:page="filters.page!"
      :total="contractsRes?.metadata.total ?? 0"
      :per-page="filters.perPage!"
    />
  </div>
</template>
