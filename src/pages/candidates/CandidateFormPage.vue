<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import { candidateQueries } from '@/api/services/candidate-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import FormField from '@/components/form/FormField.vue'
import { useFormRules } from '@/composables/use-form-rules'
import { getFieldErrors } from '@/lib/api-errors'
import { fromApiDate, parsePickedDate, toApiDate } from '@/lib/utils'
import type { Candidate, CandidateRequest } from '@/shared/entities'
import { useToastStore } from '@/stores/toast'
import { RouteName } from '@/types/router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'

/**
 * Add a candidate (`/candidates/new`) or edit one (`/candidates/:uuid/edit`)
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const rules = useFormRules()
const toast = useToastStore()

const uuid = computed(() => route.params.uuid as Candidate['uuid'] | undefined)
const isEdit = computed(() => !!uuid.value)

const {
  data: candidateRes,
  isLoading: isLoadingCandidate,
  isError,
} = candidateQueries.useCandidate(() => uuid.value!, { enabled: isEdit })
const { data: optionsRes, isLoading: isLoadingOptions } = candidateQueries.useFormOptions()
const createCandidate = candidateQueries.useCreateCandidate()
const updateCandidate = candidateQueries.useUpdateCandidate()

const candidate = computed(() => candidateRes.value?.data)
const isReady = computed(
  () =>
    !isLoadingOptions.value && (!isEdit.value || (!isLoadingCandidate.value && !!candidate.value))
)

const initialValues = computed(() => {
  const c = candidate.value
  return {
    name: c?.name ?? '',
    fatherName: c?.fatherName ?? '',
    dateOfBirth: fromApiDate(c?.dateOfBirth),
    passportNumber: c?.passportNumber ?? '',
    cnicNumber: c?.cnicNumber ?? '',
    phoneNumber: c?.phoneNumber ?? '',
    agentUuid: c?.agent?.uuid ?? null,
    contractVisaUuid: c?.contractVisaUuid ?? null,
    notes: c?.notes ?? '',
  }
})
type Values = (typeof initialValues)['value']

const resolver = computed(() =>
  zodResolver(
    z.object({
      name: rules.text(t('candidateForm.name'), { min: 2, max: 100 }),
      fatherName: rules.text(t('candidateForm.fatherName'), { min: 2, max: 100 }),
      dateOfBirth: rules.date(t('candidateForm.dateOfBirth'), { past: true }),
      passportNumber: rules.passport(t('candidateForm.passportNumber')),
      cnicNumber: rules.cnic(t('candidateForm.cnicNumber')),
      phoneNumber: rules.optionalText(t('candidateForm.phoneNumber'), { max: 30 }),
      notes: rules.optionalText(t('candidateForm.notes'), { max: 2000 }),
      // Not validated, but only fields in the schema are passed on to submit
      agentUuid: z.string().nullable().optional(),
      contractVisaUuid: z.string().nullable().optional(),
    })
  )
)

const agentOptions = computed(() => optionsRes.value?.data.agents ?? [])

/**
 * Open visas grouped by employer. The candidate's current visa is kept in the list even when
 * it's full, otherwise editing would look like it removed them from it.
 */
const visaGroups = computed(() => {
  const visas = [...(optionsRes.value?.data.visas ?? [])]
  const current = candidate.value
  if (current?.contractVisaUuid && !visas.some((visa) => visa.uuid === current.contractVisaUuid)) {
    visas.unshift({
      uuid: current.contractVisaUuid,
      visaNumber: current.visaNumber ?? '',
      trade: current.trade?.name ?? '',
      company: current.company?.name ?? '',
      country: current.company?.country ?? '',
      contractNumber: current.contract?.contractNumber ?? '',
      remaining: 0,
    })
  }
  const groups = new Map<string, typeof visas>()
  for (const visa of visas) {
    const key = `${visa.company}, ${visa.country}`
    groups.set(key, [...(groups.get(key) ?? []), visa])
  }
  return [...groups].map(([label, items]) => ({ label, items }))
})

const serverErrors = ref<Record<string, string>>({})

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return
  serverErrors.value = {}
  const values = event.values as Values
  const payload: CandidateRequest = {
    name: values.name.trim(),
    fatherName: values.fatherName.trim(),
    dateOfBirth: toApiDate(parsePickedDate(values.dateOfBirth)!),
    passportNumber: values.passportNumber.trim().toUpperCase(),
    cnicNumber: values.cnicNumber,
    phoneNumber: values.phoneNumber?.trim() || null,
    agentUuid: values.agentUuid ?? null,
    contractVisaUuid: values.contractVisaUuid ?? null,
    notes: values.notes?.trim() || null,
  }
  try {
    const { data } = isEdit.value
      ? await updateCandidate.mutateAsync({ uuid: uuid.value!, ...payload })
      : await createCandidate.mutateAsync(payload)
    toast.success(
      isEdit.value ? t('candidateForm.saved') : t('candidateForm.created', { name: data.name })
    )
    await router.push({ name: RouteName.Candidate, params: { uuid: data.uuid } })
  } catch (error) {
    // The API toast says what went wrong, the same messages also go under the fields
    serverErrors.value = getFieldErrors(error)
  }
}

const isSaving = computed(() => createCandidate.isPending.value || updateCandidate.isPending.value)
const backTo = computed(() =>
  isEdit.value
    ? { name: RouteName.Candidate, params: { uuid: uuid.value } }
    : { name: RouteName.Candidates }
)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-3xl flex-col gap-8">
    <router-link
      :to="backTo"
      class="flex w-fit items-center gap-2 text-sm text-muted-color hover:text-color"
    >
      <ArrowLeftIcon class="size-4! rtl:-scale-x-100" />
      {{ isEdit ? (candidate?.name ?? t('pageTitles.candidate')) : t('pageTitles.candidates') }}
    </router-link>

    <PageHeader
      :title="isEdit ? t('pageTitles.editCandidate') : t('pageTitles.newCandidate')"
      :subtitle="isEdit ? t('candidateForm.editSubtitle') : t('candidateForm.newSubtitle')"
    />

    <EmptyState v-if="isError" :message="t('candidates.notFound')" />

    <div v-else-if="!isReady" class="flex flex-col gap-4" aria-busy="true">
      <Skeleton height="22rem" border-radius="0.75rem" />
      <Skeleton height="10rem" border-radius="0.75rem" />
    </div>

    <Form
      v-else
      v-slot="$form"
      :initial-values="initialValues"
      :resolver
      class="flex flex-col gap-6"
      @submit="handleSubmit"
    >
      <AppCard class="gap-5 p-5!">
        <h2 class="text-lg font-semibold">{{ t('candidates.personal') }}</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField
            :label="t('candidateForm.name')"
            for="name"
            :state="$form.name"
            :server-error="serverErrors.name"
          >
            <InputText id="name" name="name" autocomplete="off" fluid />
          </FormField>
          <FormField
            :label="t('candidateForm.fatherName')"
            for="fatherName"
            :state="$form.fatherName"
            :server-error="serverErrors.fatherName"
          >
            <InputText id="fatherName" name="fatherName" autocomplete="off" fluid />
          </FormField>
          <FormField
            :label="t('candidateForm.passportNumber')"
            for="passportNumber"
            :hint="t('candidateForm.passportHint')"
            :state="$form.passportNumber"
            :server-error="serverErrors.passportNumber"
          >
            <InputText
              id="passportNumber"
              name="passportNumber"
              dir="ltr"
              autocomplete="off"
              class="uppercase"
              maxlength="9"
              fluid
            />
          </FormField>
          <FormField
            :label="t('candidateForm.cnicNumber')"
            for="cnicNumber"
            :state="$form.cnicNumber"
            :server-error="serverErrors.cnicNumber"
          >
            <InputMask
              id="cnicNumber"
              name="cnicNumber"
              mask="99999-9999999-9"
              placeholder="12345-1234567-1"
              dir="ltr"
              :auto-clear="false"
              fluid
            />
          </FormField>
          <FormField
            :label="t('candidateForm.dateOfBirth')"
            for="dateOfBirth"
            :state="$form.dateOfBirth"
            :server-error="serverErrors.dateOfBirth"
          >
            <DatePicker
              input-id="dateOfBirth"
              name="dateOfBirth"
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
            :label="t('candidateForm.phoneNumber')"
            for="phoneNumber"
            optional
            :state="$form.phoneNumber"
            :server-error="serverErrors.phoneNumber"
          >
            <InputText
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+92 300 1234567"
              dir="ltr"
              fluid
            />
          </FormField>
        </div>
      </AppCard>

      <AppCard class="gap-5 p-5!">
        <h2 class="text-lg font-semibold">{{ t('candidates.placement') }}</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <FormField
            :label="t('candidateForm.agent')"
            for="agentUuid"
            optional
            :server-error="serverErrors.agentUuid"
          >
            <Select
              input-id="agentUuid"
              name="agentUuid"
              :options="agentOptions"
              option-label="name"
              option-value="uuid"
              :placeholder="t('candidateForm.agentNone')"
              show-clear
              filter
              fluid
            />
          </FormField>
          <FormField
            :label="t('candidateForm.visa')"
            for="contractVisaUuid"
            optional
            :hint="t('candidateForm.visaHint')"
            :server-error="serverErrors.contractVisaUuid"
          >
            <Select
              input-id="contractVisaUuid"
              name="contractVisaUuid"
              :options="visaGroups"
              option-group-label="label"
              option-group-children="items"
              :option-label="(visa) => `${visa.trade}, ${visa.company}`"
              option-value="uuid"
              :placeholder="t('candidateForm.visaNone')"
              show-clear
              filter
              :filter-fields="['trade', 'company', 'visaNumber', 'contractNumber']"
              fluid
            >
              <template #option="{ option }">
                <span class="flex w-full items-center justify-between gap-3">
                  <span class="flex flex-col">
                    <span>{{ option.trade }}</span>
                    <span dir="ltr" class="text-sm text-muted-color tabular-nums rtl:text-right">
                      {{ option.visaNumber }}
                    </span>
                  </span>
                  <span v-if="option.remaining" class="text-sm text-muted-color">
                    {{ t('candidateForm.visaPlaces', { count: option.remaining }) }}
                  </span>
                </span>
              </template>
            </Select>
          </FormField>
        </div>
        <FormField
          :label="t('candidateForm.notes')"
          for="notes"
          optional
          :state="$form.notes"
          :server-error="serverErrors.notes"
        >
          <Textarea id="notes" name="notes" rows="3" auto-resize fluid />
        </FormField>
      </AppCard>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <Button
          as="router-link"
          :to="backTo"
          :label="t('common.cancel')"
          severity="secondary"
          variant="text"
        />
        <Button
          type="submit"
          :label="isEdit ? t('candidateForm.save') : t('candidateForm.create')"
          :loading="isSaving"
        />
      </div>
    </Form>
  </div>
</template>
