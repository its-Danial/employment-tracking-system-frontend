<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { type AgentsQuery, directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import CardActions from '@/components/CardActions.vue'
import EmptyState from '@/components/EmptyState.vue'
import InitialsAvatar from '@/components/InitialsAvatar.vue'
import PageHeader from '@/components/PageHeader.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import FormDialog from '@/components/form/FormDialog.vue'
import FormField from '@/components/form/FormField.vue'
import CardGrid from '@/components/list/CardGrid.vue'
import ListPagination from '@/components/list/ListPagination.vue'
import SearchField from '@/components/list/SearchField.vue'
import SimpleCardSkeleton from '@/components/list/SimpleCardSkeleton.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { useEditForm } from '@/composables/use-edit-form'
import { useFormRules } from '@/composables/use-form-rules'
import { usePagedList } from '@/composables/use-paged-list'
import { formatBackendDateForDisplay, fromApiDate, parsePickedDate, toApiDate } from '@/lib/utils'
import type { Agent } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<AgentsQuery>({ sortBy: 'name', sortOrder: 'asc' })
const { data: agentsRes, isLoading, isPlaceholderData } = directoryQueries.useAgents(queryParams)

// --- Add / edit / delete ---
const toast = useToastStore()
const rules = useFormRules()
const confirmDelete = useConfirmDelete()
const saveAgent = directoryQueries.useSaveAgent()
const deleteAgent = directoryQueries.useDeleteAgent()
const isEditing = ref(false)
const editing = ref<Agent>()

const form = useEditForm(
  () => ({
    name: '',
    contactPhone: '',
    contactEmail: '',
    hireDate: null as Date | null,
    notes: '',
    isActive: true,
  }),
  () =>
    z.object({
      name: rules.text(t('agents.name'), { min: 2, max: 100 }),
      contactPhone: rules.optionalText(t('agents.phone'), { max: 30 }),
      contactEmail: z.union([z.literal(''), rules.email(t('agents.email'))]),
      hireDate: rules.optionalDate(t('agents.hireDate'), { past: true }),
      notes: rules.optionalText(t('agents.notes'), { max: 2000 }),
    })
)

function openForm(agent?: Agent) {
  editing.value = agent
  form.reset(
    agent && {
      name: agent.name,
      contactPhone: agent.contactPhone ?? '',
      contactEmail: agent.contactEmail ?? '',
      hireDate: fromApiDate(agent.hireDate),
      notes: agent.notes ?? '',
      isActive: agent.isActive,
    }
  )
  isEditing.value = true
}

async function submit() {
  if (!form.validate()) return
  const { name, contactPhone, contactEmail, hireDate, notes, isActive } = form.values.value
  const picked = parsePickedDate(hireDate)
  try {
    await saveAgent.mutateAsync({
      uuid: editing.value?.uuid,
      name: name.trim(),
      contactPhone: contactPhone.trim() || null,
      contactEmail: contactEmail.trim() || null,
      hireDate: picked ? toApiDate(picked) : null,
      notes: notes.trim() || null,
      isActive,
    })
    toast.success(t('common.saved'))
    isEditing.value = false
  } catch (error) {
    form.showServerErrors(error)
  }
}

const remove = (agent: Agent) =>
  confirmDelete({
    itemName: agent.name,
    onConfirm: async () => {
      await deleteAgent.mutateAsync(agent.uuid)
      toast.success(t('common.deleted'))
    },
  })
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.agents')" :subtitle="t('agents.subtitle')">
      <AccessControl :permission="PERMISSIONS.agents.create">
        <Button :label="t('agents.add')" @click="openForm()">
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </PageHeader>
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
          <CardActions
            :name="agent.name"
            :edit-permission="PERMISSIONS.agents.update"
            :delete-permission="PERMISSIONS.agents.delete"
            @edit="openForm(agent)"
            @delete="remove(agent)"
          />
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

    <FormDialog
      v-model:visible="isEditing"
      :title="editing ? t('agents.edit') : t('agents.add')"
      :saving="saveAgent.isPending.value"
      @submit="submit"
    >
      <FormField :label="t('agents.name')" for="agent-name" :server-error="form.errors.value.name">
        <InputText
          id="agent-name"
          v-model="form.values.value.name"
          :invalid="!!form.errors.value.name"
          fluid
        />
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          :label="t('agents.phone')"
          for="agent-phone"
          optional
          :server-error="form.errors.value.contactPhone"
        >
          <InputText
            id="agent-phone"
            v-model="form.values.value.contactPhone"
            type="tel"
            dir="ltr"
            fluid
          />
        </FormField>
        <FormField
          :label="t('agents.email')"
          for="agent-email"
          optional
          :server-error="form.errors.value.contactEmail"
        >
          <InputText
            id="agent-email"
            v-model="form.values.value.contactEmail"
            type="email"
            dir="ltr"
            fluid
          />
        </FormField>
      </div>
      <FormField
        :label="t('agents.hireDate')"
        for="agent-hire-date"
        optional
        :server-error="form.errors.value.hireDate"
      >
        <DatePicker
          v-model="form.values.value.hireDate"
          input-id="agent-hire-date"
          date-format="dd/mm/yy"
          placeholder="dd/mm/yyyy"
          :max-date="new Date()"
          show-icon
          icon-display="input"
          dir="ltr"
          fluid
        />
      </FormField>
      <FormField
        :label="t('agents.notes')"
        for="agent-notes"
        optional
        :server-error="form.errors.value.notes"
      >
        <Textarea id="agent-notes" v-model="form.values.value.notes" rows="2" auto-resize fluid />
      </FormField>
      <label class="flex items-center gap-3">
        <ToggleSwitch v-model="form.values.value.isActive" />
        {{ t('agents.active') }}
      </label>
    </FormDialog>
  </div>
</template>
