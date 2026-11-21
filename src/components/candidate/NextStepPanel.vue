<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { candidateQueries } from '@/api/services/candidate-services'
import FormField from '@/components/form/FormField.vue'
import { useFormRules } from '@/composables/use-form-rules'
import { getFieldErrors } from '@/lib/api-errors'
import { parsePickedDate, toApiDate } from '@/lib/utils'
import {
  CANDIDATE_MEDICAL_STATUS,
  CANDIDATE_STEP,
  CANDIDATE_VISA_STATUS,
  type CandidateStep,
} from '@/shared/candidate'
import type { Candidate, CandidateStepRequest } from '@/shared/entities'
import { useToastStore } from '@/stores/toast'

/**
 * The one thing to record next for a candidate (medical result, E-Number, visa, flight...).
 * The API decides which step is due, so stages can't be skipped.
 */
const { candidate } = defineProps<{ candidate: Candidate }>()

const { t } = useI18n()
const rules = useFormRules()
const toast = useToastStore()
const recordStep = candidateQueries.useRecordStep()

const step = computed(() => candidate.nextStep as CandidateStep)
const needsVisaPlacement = computed(
  () => step.value === CANDIDATE_STEP.visa && !candidate.contractVisaUuid
)
const { data: optionsRes } = candidateQueries.useFormOptions()

const emptyValues = () => ({
  date: null as Date | null,
  medicalStatus: CANDIDATE_MEDICAL_STATUS.fit as 'fit' | 'unfit',
  visaStatus: CANDIDATE_VISA_STATUS.issued as 'issued' | 'rejected',
  text: '',
  // Protector step: registration and insurance numbers, both optional
  protectorNumber: '',
  insuranceNumber: '',
  contractVisaUuid: null as Candidate['contractVisaUuid'],
})
const values = ref(emptyValues())
const errors = ref<Record<string, string>>({})
// A new step starts with a clean form
watch(step, () => ((values.value = emptyValues()), (errors.value = {})))

const isIssued = computed(() => values.value.visaStatus === CANDIDATE_VISA_STATUS.issued)
const dateLabel = computed(() =>
  step.value === CANDIDATE_STEP.departure ? t('candidates.fileDelivered') : t('steps.date')
)

/** Client-side checks, the API checks the same again */
function validate() {
  const date = values.value.date
  const field = dateLabel.value
  const checks: Record<string, z.ZodType | undefined> = {
    date:
      step.value === CANDIDATE_STEP.departure ||
      (step.value === CANDIDATE_STEP.visa && !isIssued.value)
        ? rules.optionalDate(field, { past: true })
        : step.value === CANDIDATE_STEP.eNumberIssue
          ? undefined
          : rules.date(field, { past: step.value !== CANDIDATE_STEP.flight }),
    text:
      step.value === CANDIDATE_STEP.eNumberIssue
        ? rules.text(t('candidates.eNumber'), { min: 3, max: 30 })
        : step.value === CANDIDATE_STEP.flight
          ? rules.text(t('steps.flight.number'), { min: 3, max: 10 })
          : undefined,
  }
  errors.value = {}
  for (const [key, schema] of Object.entries(checks)) {
    const result = schema?.safeParse(key === 'date' ? date : values.value.text)
    if (result && !result.success) errors.value[key] = result.error.issues[0]!.message
  }
  return !Object.keys(errors.value).length
}

function buildPayload(): CandidateStepRequest {
  const { date, medicalStatus, visaStatus, text, contractVisaUuid } = values.value
  const picked = parsePickedDate(date)
  const day = picked ? toApiDate(picked) : null
  switch (step.value) {
    case CANDIDATE_STEP.medical:
      return { step: 'medical', medicalDate: day!, medicalStatus }
    case CANDIDATE_STEP.eNumberApplication:
      return { step: 'e_number_application', eNumberApplicationDate: day! }
    case CANDIDATE_STEP.eNumberIssue:
      return { step: 'e_number_issue', eNumber: text.trim() }
    case CANDIDATE_STEP.dropbox:
      return { step: 'dropbox', dropboxSubmissionDate: day! }
    case CANDIDATE_STEP.visa:
      return {
        step: 'visa',
        visaStatus,
        visaIssuedDate: isIssued.value ? day : null,
        contractVisaUuid,
      }
    case CANDIDATE_STEP.protector:
      return {
        step: 'protector',
        protectorDate: day!,
        protectorRegistrationNumber: values.value.protectorNumber.trim() || null,
        insurancePolicyNumber: values.value.insuranceNumber.trim() || null,
      }
    case CANDIDATE_STEP.flight:
      return { step: 'flight', flightDate: day!, flightNumber: text.trim().toUpperCase() }
    case CANDIDATE_STEP.departure:
      return { step: 'departure', fileDeliveredDate: day }
  }
}

// API field names mapped onto this form's fields
const API_FIELDS: Record<string, string> = {
  medicalDate: 'date',
  eNumberApplicationDate: 'date',
  dropboxSubmissionDate: 'date',
  visaIssuedDate: 'date',
  flightDate: 'date',
  fileDeliveredDate: 'date',
  eNumber: 'text',
  flightNumber: 'text',
  contractVisaUuid: 'contractVisaUuid',
  protectorDate: 'date',
  protectorRegistrationNumber: 'protectorNumber',
  insurancePolicyNumber: 'insuranceNumber',
}

async function submit() {
  if (!validate()) return
  try {
    await recordStep.mutateAsync({ uuid: candidate.uuid, payload: buildPayload() })
    toast.success(t('steps.saved'))
  } catch (error) {
    const fieldErrors = getFieldErrors(error)
    errors.value = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, message]) => [API_FIELDS[field] ?? field, message])
    )
  }
}

const notice = computed(() => {
  if (step.value === CANDIDATE_STEP.medical && candidate.medicalStatus === 'unfit') {
    return t('steps.medical.retest')
  }
  if (step.value === CANDIDATE_STEP.visa && candidate.visaStatus === 'rejected') {
    return t('steps.visa.retry')
  }
  return null
})

const showDate = computed(
  () =>
    step.value !== CANDIDATE_STEP.eNumberIssue &&
    (step.value !== CANDIDATE_STEP.visa || isIssued.value)
)
const showText = computed(
  () => step.value === CANDIDATE_STEP.eNumberIssue || step.value === CANDIDATE_STEP.flight
)
const visaOptions = computed(() => optionsRes.value?.data.visas ?? [])
</script>

<template>
  <section
    class="flex flex-col gap-5 rounded-xl border border-primary/40 bg-primary-50/60 p-5 dark:bg-primary-950/25"
    :aria-label="t('steps.title')"
  >
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-color-emphasis">{{ t(`steps.${step}.title`) }}</h2>
      <p class="text-muted-color">{{ notice ?? t(`steps.${step}.hint`) }}</p>
    </div>

    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <div class="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          v-if="step === CANDIDATE_STEP.medical"
          :label="t('steps.medical.result')"
          for="step-medical-result"
        >
          <SelectButton
            id="step-medical-result"
            v-model="values.medicalStatus"
            :options="[
              { label: t('steps.medical.fit'), value: CANDIDATE_MEDICAL_STATUS.fit },
              { label: t('steps.medical.unfit'), value: CANDIDATE_MEDICAL_STATUS.unfit },
            ]"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </FormField>

        <FormField
          v-if="step === CANDIDATE_STEP.visa"
          :label="t('steps.visa.result')"
          for="step-visa-result"
        >
          <SelectButton
            id="step-visa-result"
            v-model="values.visaStatus"
            :options="[
              { label: t('steps.visa.issued'), value: CANDIDATE_VISA_STATUS.issued },
              { label: t('steps.visa.rejected'), value: CANDIDATE_VISA_STATUS.rejected },
            ]"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </FormField>

        <FormField
          v-if="needsVisaPlacement && isIssued"
          :label="t('candidateForm.visa')"
          for="step-visa"
          :server-error="errors.contractVisaUuid"
        >
          <Select
            v-model="values.contractVisaUuid"
            input-id="step-visa"
            :options="visaOptions"
            :option-label="(visa) => `${visa.trade}, ${visa.company}`"
            option-value="uuid"
            filter
            fluid
          />
        </FormField>

        <FormField
          v-if="showText"
          :label="
            step === CANDIDATE_STEP.flight ? t('steps.flight.number') : t('candidates.eNumber')
          "
          for="step-text"
          :server-error="errors.text"
        >
          <InputText
            id="step-text"
            v-model="values.text"
            dir="ltr"
            :class="{ uppercase: step === CANDIDATE_STEP.flight }"
            :invalid="!!errors.text"
            fluid
          />
        </FormField>

        <template v-if="step === CANDIDATE_STEP.protector">
          <FormField
            :label="t('steps.protector.number')"
            for="step-protector-number"
            optional
            :server-error="errors.protectorNumber"
          >
            <InputText
              id="step-protector-number"
              v-model="values.protectorNumber"
              dir="ltr"
              fluid
            />
          </FormField>
          <FormField
            :label="t('steps.protector.insurance')"
            for="step-insurance-number"
            optional
            :server-error="errors.insuranceNumber"
          >
            <InputText
              id="step-insurance-number"
              v-model="values.insuranceNumber"
              dir="ltr"
              fluid
            />
          </FormField>
        </template>

        <FormField
          v-if="showDate"
          :label="dateLabel"
          for="step-date"
          :optional="step === CANDIDATE_STEP.departure"
          :server-error="errors.date"
        >
          <DatePicker
            v-model="values.date"
            input-id="step-date"
            date-format="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            :max-date="step === CANDIDATE_STEP.flight ? undefined : new Date()"
            :invalid="!!errors.date"
            show-icon
            icon-display="input"
            dir="ltr"
            fluid
          />
        </FormField>
      </div>

      <Message v-if="errors.step" severity="error" size="small" variant="simple">
        {{ errors.step }}
      </Message>
      <div>
        <Button
          type="submit"
          :label="t(`steps.${step}.action`)"
          :loading="recordStep.isPending.value"
        />
      </div>
    </form>
  </section>
</template>
