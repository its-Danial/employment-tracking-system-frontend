<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { type CompaniesQuery, directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import CardActions from '@/components/CardActions.vue'
import EmptyState from '@/components/EmptyState.vue'
import MeterBar from '@/components/MeterBar.vue'
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
import type { Company } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const { filters, queryParams } = usePagedList<CompaniesQuery>({ sortBy: 'name', sortOrder: 'asc' })
const {
  data: companiesRes,
  isLoading,
  isPlaceholderData,
} = directoryQueries.useCompanies(queryParams)

// --- Add / edit / delete ---
const toast = useToastStore()
const rules = useFormRules()
const confirmDelete = useConfirmDelete()
const saveCompany = directoryQueries.useSaveCompany()
const deleteCompany = directoryQueries.useDeleteCompany()
const isEditing = ref(false)
const editing = ref<Company>()

const form = useEditForm(
  () => ({ name: '', arabicName: '', country: '', companyWebsite: '', contactInfo: '' }),
  () =>
    z.object({
      name: rules.text(t('companies.name'), { min: 2, max: 150 }),
      arabicName: rules.optionalText(t('companies.arabicName'), { max: 150 }),
      country: rules.text(t('companies.country'), { min: 2, max: 60 }),
      companyWebsite: rules.optionalUrl(),
      contactInfo: rules.optionalText(t('companies.contactInfo'), { max: 500 }),
    })
)

// Common destinations, suggested while typing; any country can be entered
const COUNTRIES = ['Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Oman', 'Kuwait', 'Bahrain']
const countrySuggestions = ref<string[]>([])
const suggestCountries = (query: string) =>
  (countrySuggestions.value = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(query.toLowerCase())
  ))

function openForm(company?: Company) {
  editing.value = company
  form.reset(
    company && {
      name: company.name,
      arabicName: company.arabicName ?? '',
      country: company.country,
      companyWebsite: company.companyWebsite ?? '',
      contactInfo: company.contactInfo ?? '',
    }
  )
  isEditing.value = true
}

async function submit() {
  if (!form.validate()) return
  const values = form.values.value
  try {
    await saveCompany.mutateAsync({
      uuid: editing.value?.uuid,
      name: values.name.trim(),
      arabicName: values.arabicName.trim() || null,
      country: values.country.trim(),
      companyWebsite: values.companyWebsite.trim() || null,
      contactInfo: values.contactInfo.trim() || null,
    })
    toast.success(t('common.saved'))
    isEditing.value = false
  } catch (error) {
    form.showServerErrors(error)
  }
}

const remove = (company: Company) =>
  confirmDelete({
    itemName: company.name,
    onConfirm: async () => {
      await deleteCompany.mutateAsync(company.uuid)
      toast.success(t('common.deleted'))
    },
  })
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.companies')" :subtitle="t('companies.subtitle')">
      <AccessControl :permission="PERMISSIONS.companies.create">
        <Button :label="t('companies.add')" @click="openForm()">
          <template #icon><PlusIcon /></template>
        </Button>
      </AccessControl>
    </PageHeader>
    <SearchField v-model="filters.search" />

    <CardGrid
      :loading="isLoading"
      :refreshing="isPlaceholderData"
      :empty="!companiesRes?.data.length"
    >
      <template #skeleton><SimpleCardSkeleton /></template>
      <AppCard v-for="company in companiesRes?.data" :key="company.uuid" class="gap-4">
        <div class="flex items-start justify-between gap-2">
          <div class="flex min-w-0 flex-col gap-0.5">
            <span class="font-semibold text-color-emphasis">{{ company.name }}</span>
            <!-- Arabic name as printed on the employer's documents -->
            <span v-if="company.arabicName" dir="rtl" lang="ar" class="font-urdu text-muted-color">
              {{ company.arabicName }}
            </span>
          </div>
          <CardActions
            :name="company.name"
            :edit-permission="PERMISSIONS.companies.update"
            :delete-permission="PERMISSIONS.companies.delete"
            @edit="openForm(company)"
            @delete="remove(company)"
          />
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

    <FormDialog
      v-model:visible="isEditing"
      :title="editing ? t('companies.edit') : t('companies.add')"
      :saving="saveCompany.isPending.value"
      @submit="submit"
    >
      <FormField
        :label="t('companies.name')"
        for="company-name"
        :server-error="form.errors.value.name"
      >
        <InputText
          id="company-name"
          v-model="form.values.value.name"
          :invalid="!!form.errors.value.name"
          fluid
        />
      </FormField>
      <FormField
        :label="t('companies.arabicName')"
        for="company-arabic"
        optional
        :server-error="form.errors.value.arabicName"
      >
        <InputText
          id="company-arabic"
          v-model="form.values.value.arabicName"
          dir="rtl"
          lang="ar"
          class="font-urdu"
          fluid
        />
      </FormField>
      <FormField
        :label="t('companies.country')"
        for="company-country"
        :server-error="form.errors.value.country"
      >
        <AutoComplete
          v-model="form.values.value.country"
          input-id="company-country"
          :suggestions="countrySuggestions"
          dropdown
          :invalid="!!form.errors.value.country"
          fluid
          @complete="suggestCountries($event.query)"
        />
      </FormField>
      <FormField
        :label="t('companies.website')"
        for="company-website"
        optional
        :server-error="form.errors.value.companyWebsite"
      >
        <InputText
          id="company-website"
          v-model="form.values.value.companyWebsite"
          type="url"
          dir="ltr"
          placeholder="https://"
          fluid
        />
      </FormField>
      <FormField
        :label="t('companies.contactInfo')"
        for="company-contact"
        optional
        :server-error="form.errors.value.contactInfo"
      >
        <Textarea
          id="company-contact"
          v-model="form.values.value.contactInfo"
          rows="2"
          auto-resize
          fluid
        />
      </FormField>
    </FormDialog>
  </div>
</template>
