<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { tradeQueries } from '@/api/services/trade-services'
import AppCard from '@/components/AppCard.vue'
import CardActions from '@/components/CardActions.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import FormDialog from '@/components/form/FormDialog.vue'
import FormField from '@/components/form/FormField.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { useEditForm } from '@/composables/use-edit-form'
import { useFormRules } from '@/composables/use-form-rules'
import { usePagedList } from '@/composables/use-paged-list'
import type { PaginationQuery } from '@/shared/api'
import type { Trade } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<PaginationQuery<'name' | 'createdAt' | 'updatedAt'>>({
  sortBy: 'name',
  sortOrder: 'asc',
})
const { data: tradesRes, isLoading, isPlaceholderData } = tradeQueries.useTrades(queryParams)

// --- Add / edit / delete ---
const toast = useToastStore()
const rules = useFormRules()
const confirmDelete = useConfirmDelete()
const saveTrade = tradeQueries.useSaveTrade()
const deleteTrade = tradeQueries.useDeleteTrade()
const isEditing = ref(false)
const editing = ref<Trade>()

const form = useEditForm(
  () => ({ name: '', description: '' }),
  () =>
    z.object({
      name: rules.text(t('trades.name'), { min: 2, max: 100 }),
      description: rules.optionalText(t('trades.description'), { max: 255 }),
    })
)

function openForm(trade?: Trade) {
  editing.value = trade
  form.reset(trade && { name: trade.name, description: trade.description ?? '' })
  isEditing.value = true
}

async function submit() {
  if (!form.validate()) return
  try {
    await saveTrade.mutateAsync({
      uuid: editing.value?.uuid,
      name: form.values.value.name.trim(),
      description: form.values.value.description.trim() || null,
    })
    toast.success(t('common.saved'))
    isEditing.value = false
  } catch (error) {
    form.showServerErrors(error)
  }
}

const remove = (trade: Trade) =>
  confirmDelete({
    itemName: trade.name,
    onConfirm: async () => {
      await deleteTrade.mutateAsync(trade.uuid)
      toast.success(t('common.deleted'))
    },
  })
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.trades')" :subtitle="t('trades.subtitle')">
      <AccessControl :permission="PERMISSIONS.trades.create">
        <Button :label="t('trades.add')" @click="openForm()">
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
        <div class="flex items-start justify-between gap-2">
          <span class="font-semibold text-color-emphasis">{{ trade.name }}</span>
          <CardActions
            :name="trade.name"
            :edit-permission="PERMISSIONS.trades.update"
            :delete-permission="PERMISSIONS.trades.delete"
            @edit="openForm(trade)"
            @delete="remove(trade)"
          />
        </div>
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

    <FormDialog
      v-model:visible="isEditing"
      :title="editing ? t('trades.edit') : t('trades.add')"
      :saving="saveTrade.isPending.value"
      @submit="submit"
    >
      <FormField :label="t('trades.name')" for="trade-name" :server-error="form.errors.value.name">
        <InputText
          id="trade-name"
          v-model="form.values.value.name"
          :invalid="!!form.errors.value.name"
          fluid
        />
      </FormField>
      <FormField
        :label="t('trades.description')"
        for="trade-description"
        optional
        :server-error="form.errors.value.description"
      >
        <InputText id="trade-description" v-model="form.values.value.description" fluid />
      </FormField>
    </FormDialog>
  </div>
</template>
