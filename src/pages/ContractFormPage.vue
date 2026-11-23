<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import { candidateQueries } from '@/api/services/candidate-services'
import { directoryQueries } from '@/api/services/directory-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import FormField from '@/components/form/FormField.vue'
import { useEditForm } from '@/composables/use-edit-form'
import { useFormRules } from '@/composables/use-form-rules'
import { fromApiDate, parsePickedDate, toApiDate } from '@/lib/utils'
import { CONTRACT_STATUS, type ContractStatus } from '@/shared/contract'
import type { Contract } from '@/shared/entities'
import type { UUID } from '@/shared/utils'
import { useToastStore } from '@/stores/toast'
import { RouteName } from '@/types/router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

/**
 * New contract (`/contracts/new`) or edit one (`/contracts/:uuid/edit`), with its visas
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const rules = useFormRules()
const toast = useToastStore()

const uuid = computed(() => route.params.uuid as Contract['uuid'] | undefined)
const { data: contractRes, isLoading, isError } = directoryQueries.useContract(uuid)
// Employers and trades for the dropdowns
const { data: optionsRes } = candidateQueries.useFilterOptions()
const saveContract = directoryQueries.useSaveContract()

type VisaLine = {
  uuid?: UUID
  tradeUuid: UUID | null
  visaNumber: string
  totalVisas: number | null
  /** Candidates already on this visa, the places can't go below it */
  allocatedVisas: number
  /** Not editable here, sent back unchanged so saving doesn't clear it */
  note: string | null
}
const emptyVisa = (): VisaLine => ({
  tradeUuid: null,
  visaNumber: '',
  totalVisas: null,
  allocatedVisas: 0,
  note: null,
})

const form = useEditForm(
  () => ({
    companyUuid: null as UUID | null,
    contractNumber: '',
    title: '',
    status: CONTRACT_STATUS.active as ContractStatus,
    startDate: null as Date | null,
    endDate: null as Date | null,
    note: '',
    visas: [emptyVisa()] as VisaLine[],
  }),
  () =>
    z.object({
      companyUuid: z.string({
        error: t('validation.required', { field: t('contracts.employer') }),
      }),
      contractNumber: rules.text(t('contracts.number'), { min: 2, max: 50 }),
      title: rules.text(t('contracts.title'), { min: 2, max: 150 }),
      startDate: rules.optionalDate(t('contracts.startDate')),
      endDate: rules.optionalDate(t('contracts.endDate')),
      note: rules.optionalText(t('contracts.note'), { max: 2000 }),
      visas: z.array(
        z.object({
          tradeUuid: z.string({ error: t('validation.required', { field: t('contracts.trade') }) }),
          visaNumber: rules.text(t('contracts.visaNumber'), { min: 3, max: 30 }),
          totalVisas: z.number({
            error: t('validation.required', { field: t('contracts.totalVisas') }),
          }),
        })
      ),
    })
)

// Editing: fill the form once the contract has loaded
watch(
  () => contractRes.value?.data,
  (contract) => {
    if (!contract) return
    form.reset({
      companyUuid: contract.company.uuid,
      contractNumber: contract.contractNumber,
      title: contract.title,
      status: contract.status,
      startDate: fromApiDate(contract.startDate),
      endDate: fromApiDate(contract.endDate),
      note: contract.note ?? '',
      visas: contract.visas.map((visa) => ({
        uuid: visa.uuid,
        tradeUuid: visa.trade.uuid,
        visaNumber: visa.visaNumber,
        totalVisas: visa.totalVisas,
        allocatedVisas: visa.allocatedVisas,
        note: visa.note,
      })),
    })
  },
  { immediate: true }
)

const statusOptions = computed(() =>
  Object.values(CONTRACT_STATUS).map((value) => ({ value, label: t(`contractStatus.${value}`) }))
)

async function submit() {
  if (!form.validate()) return
  const values = form.values.value
  const day = (date: unknown) => {
    const picked = parsePickedDate(date)
    return picked ? toApiDate(picked) : null
  }
  try {
    await saveContract.mutateAsync({
      uuid: uuid.value,
      companyUuid: values.companyUuid!,
      contractNumber: values.contractNumber.trim(),
      title: values.title.trim(),
      status: values.status,
      startDate: day(values.startDate),
      endDate: day(values.endDate),
      note: values.note.trim() || null,
      visas: values.visas.map((visa) => ({
        uuid: visa.uuid,
        tradeUuid: visa.tradeUuid!,
        visaNumber: visa.visaNumber.trim(),
        totalVisas: visa.totalVisas!,
        note: visa.note,
      })),
    })
    toast.success(t('common.saved'))
    await router.push({ name: RouteName.Contracts })
  } catch (error) {
    form.showServerErrors(error)
  }
}

const errors = computed(() => form.errors.value)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-4xl flex-col gap-8">
    <router-link
      :to="{ name: RouteName.Contracts }"
      class="flex w-fit items-center gap-2 text-sm text-muted-color hover:text-color"
    >
      <ArrowLeftIcon class="size-4! rtl:-scale-x-100" />
      {{ t('pageTitles.contracts') }}
    </router-link>

    <PageHeader :title="uuid ? t('pageTitles.editContract') : t('pageTitles.newContract')" />

    <EmptyState v-if="isError" :message="t('contracts.empty')" />
    <Skeleton v-else-if="uuid && isLoading" height="24rem" border-radius="0.75rem" />

    <form v-else class="flex flex-col gap-6" novalidate @submit.prevent="submit">
      <AppCard class="gap-5 p-5!">
        <h2 class="text-lg font-semibold">{{ t('contracts.details') }}</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField
            :label="t('contracts.employer')"
            for="contract-employer"
            :server-error="errors.companyUuid"
          >
            <Select
              v-model="form.values.value.companyUuid"
              input-id="contract-employer"
              :options="optionsRes?.data.companies"
              option-label="name"
              option-value="uuid"
              filter
              :invalid="!!errors.companyUuid"
              fluid
            />
          </FormField>
          <FormField
            :label="t('contracts.number')"
            for="contract-number"
            :server-error="errors.contractNumber"
          >
            <InputText
              id="contract-number"
              v-model="form.values.value.contractNumber"
              dir="ltr"
              :invalid="!!errors.contractNumber"
              fluid
            />
          </FormField>
          <FormField
            :label="t('contracts.title')"
            for="contract-title"
            :server-error="errors.title"
          >
            <InputText
              id="contract-title"
              v-model="form.values.value.title"
              :placeholder="t('contracts.titlePlaceholder')"
              :invalid="!!errors.title"
              fluid
            />
          </FormField>
          <FormField :label="t('contracts.status')" for="contract-status">
            <Select
              v-model="form.values.value.status"
              input-id="contract-status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </FormField>
          <FormField
            :label="t('contracts.startDate')"
            for="contract-start"
            optional
            :server-error="errors.startDate"
          >
            <DatePicker
              v-model="form.values.value.startDate"
              input-id="contract-start"
              date-format="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              show-icon
              icon-display="input"
              dir="ltr"
              fluid
            />
          </FormField>
          <FormField
            :label="t('contracts.endDate')"
            for="contract-end"
            optional
            :server-error="errors.endDate"
          >
            <DatePicker
              v-model="form.values.value.endDate"
              input-id="contract-end"
              date-format="dd/mm/yy"
              placeholder="dd/mm/yyyy"
              show-icon
              icon-display="input"
              dir="ltr"
              fluid
            />
          </FormField>
        </div>
        <FormField
          :label="t('contracts.note')"
          for="contract-note"
          optional
          :server-error="errors.note"
        >
          <Textarea
            id="contract-note"
            v-model="form.values.value.note"
            rows="2"
            auto-resize
            fluid
          />
        </FormField>
      </AppCard>

      <AppCard class="gap-4 p-5!">
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold">{{ t('contracts.visas') }}</h2>
          <p class="text-sm text-muted-color">{{ t('contracts.visasHint') }}</p>
        </div>
        <Message v-if="errors.visas" severity="error" size="small" variant="simple">
          {{ errors.visas }}
        </Message>

        <ul class="flex flex-col gap-3">
          <li
            v-for="(visa, index) in form.values.value.visas"
            :key="visa.uuid ?? index"
            class="grid items-start gap-3 rounded-lg border border-surface-200 p-3 sm:grid-cols-[2fr_2fr_1fr_auto] dark:border-surface-800"
          >
            <FormField
              :label="t('contracts.trade')"
              :for="`visa-trade-${index}`"
              :server-error="errors[`visas.${index}.tradeUuid`]"
            >
              <Select
                v-model="visa.tradeUuid"
                :input-id="`visa-trade-${index}`"
                :options="optionsRes?.data.trades"
                option-label="name"
                option-value="uuid"
                filter
                :invalid="!!errors[`visas.${index}.tradeUuid`]"
                fluid
              />
            </FormField>
            <FormField
              :label="t('contracts.visaNumber')"
              :for="`visa-number-${index}`"
              :server-error="errors[`visas.${index}.visaNumber`]"
            >
              <InputText
                :id="`visa-number-${index}`"
                v-model="visa.visaNumber"
                dir="ltr"
                :invalid="!!errors[`visas.${index}.visaNumber`]"
                fluid
              />
            </FormField>
            <FormField
              :label="t('contracts.totalVisas')"
              :for="`visa-total-${index}`"
              :hint="
                visa.allocatedVisas
                  ? t('contracts.placed', {
                      allocated: visa.allocatedVisas,
                      total: visa.totalVisas,
                    })
                  : undefined
              "
              :server-error="errors[`visas.${index}.totalVisas`]"
            >
              <InputNumber
                v-model="visa.totalVisas"
                :input-id="`visa-total-${index}`"
                :min="Math.max(1, visa.allocatedVisas)"
                :max="10000"
                :invalid="!!errors[`visas.${index}.totalVisas`]"
                fluid
              />
            </FormField>
            <Button
              type="button"
              variant="text"
              severity="secondary"
              :aria-label="t('contracts.removeVisa')"
              :disabled="visa.allocatedVisas > 0"
              class="mt-7 hover:text-red-600!"
              @click="form.values.value.visas.splice(index, 1)"
            >
              <template #icon><TrashIcon /></template>
            </Button>
          </li>
        </ul>
        <div>
          <Button
            type="button"
            :label="t('contracts.addVisa')"
            severity="secondary"
            variant="outlined"
            size="small"
            @click="form.values.value.visas.push(emptyVisa())"
          >
            <template #icon><PlusIcon /></template>
          </Button>
        </div>
      </AppCard>

      <div class="flex justify-end gap-3">
        <Button
          as="router-link"
          :to="{ name: RouteName.Contracts }"
          :label="t('common.cancel')"
          severity="secondary"
          variant="text"
        />
        <Button
          type="submit"
          :label="uuid ? t('contracts.save') : t('contracts.create')"
          :loading="saveContract.isPending.value"
        />
      </div>
    </form>
  </div>
</template>
