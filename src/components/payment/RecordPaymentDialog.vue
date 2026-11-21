<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { paymentQueries } from '@/api/services/payment-services'
import FormField from '@/components/form/FormField.vue'
import { getFieldErrors } from '@/lib/api-errors'
import { parsePickedDate, toApiDate } from '@/lib/utils'
import {
  PAYMENT_KIND,
  PAYMENT_METHOD,
  type PaymentKind,
  type PaymentMethod,
} from '@/shared/candidate'
import type { Candidate } from '@/shared/entities'
import { useToastStore } from '@/stores/toast'

/** Adds one entry to a candidate's ledger: money received, a charge, or a refund */
const { candidate } = defineProps<{ candidate: Pick<Candidate, 'uuid' | 'name'> }>()
const visible = defineModel<boolean>('visible', { required: true })

const { t } = useI18n()
const toast = useToastStore()
const recordPayment = paymentQueries.useRecordPayment()

const emptyValues = () => ({
  kind: PAYMENT_KIND.payment as PaymentKind,
  amount: null as number | null,
  description: '',
  method: PAYMENT_METHOD.cash as PaymentMethod | null,
  reference: '',
  paidOn: new Date() as Date | null,
})
const values = ref(emptyValues())
const errors = ref<Record<string, string>>({})
watch(visible, (open) => open && ((values.value = emptyValues()), (errors.value = {})))

const isCharge = computed(() => values.value.kind === PAYMENT_KIND.charge)
const kindOptions = computed(() =>
  [PAYMENT_KIND.payment, PAYMENT_KIND.charge, PAYMENT_KIND.refund].map((value) => ({
    value,
    label: t(`payments.kind.${value}`),
  }))
)
const methodOptions = computed(() =>
  Object.values(PAYMENT_METHOD).map((value) => ({ value, label: t(`payments.method.${value}`) }))
)

function validate() {
  const { amount, description, paidOn } = values.value
  errors.value = {}
  if (!amount || amount < 1) {
    errors.value.amount = t('validation.required', { field: t('payments.amount') })
  }
  if (isCharge.value && !description.trim()) {
    errors.value.description = t('validation.required', { field: t('payments.description') })
  }
  const day = parsePickedDate(paidOn)
  if (!day) errors.value.paidOn = t('validation.required', { field: t('payments.date') })
  else if (day > new Date()) {
    errors.value.paidOn = t('validation.pastDate', { field: t('payments.date') })
  }
  return !Object.keys(errors.value).length
}

async function submit() {
  if (!validate()) return
  const { kind, amount, description, method, reference, paidOn } = values.value
  try {
    await recordPayment.mutateAsync({
      uuid: candidate.uuid,
      payload: {
        kind,
        amount: amount!,
        description: description.trim() || null,
        method: isCharge.value ? null : method,
        reference: reference.trim() || null,
        paidOn: toApiDate(parsePickedDate(paidOn)!),
      },
    })
    toast.success(t('payments.saved'))
    visible.value = false
  } catch (error) {
    errors.value = getFieldErrors(error)
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="t('payments.recordTitle')"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '94vw' }"
  >
    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <p class="-mt-2 text-muted-color">{{ candidate.name }}</p>
      <SelectButton
        v-model="values.kind"
        :options="kindOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        :aria-label="t('payments.kind.payment')"
        class="w-full *:flex-1"
      />
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField :label="t('payments.amount')" for="payment-amount" :server-error="errors.amount">
          <InputNumber
            v-model="values.amount"
            input-id="payment-amount"
            :min="1"
            :max="10000000"
            :use-grouping="true"
            locale="en-PK"
            :invalid="!!errors.amount"
            dir="ltr"
            fluid
          />
        </FormField>
        <FormField :label="t('payments.date')" for="payment-date" :server-error="errors.paidOn">
          <DatePicker
            v-model="values.paidOn"
            input-id="payment-date"
            date-format="dd/mm/yy"
            :max-date="new Date()"
            :invalid="!!errors.paidOn"
            show-icon
            icon-display="input"
            dir="ltr"
            fluid
          />
        </FormField>
      </div>
      <FormField
        :label="t('payments.description')"
        for="payment-description"
        :optional="!isCharge"
        :server-error="errors.description"
      >
        <InputText
          id="payment-description"
          v-model="values.description"
          :placeholder="isCharge ? t('payments.descriptionPlaceholder') : undefined"
          :invalid="!!errors.description"
          fluid
        />
      </FormField>
      <div v-if="!isCharge" class="grid gap-4 sm:grid-cols-2">
        <FormField
          :label="t('payments.method_label')"
          for="payment-method"
          :server-error="errors.method"
        >
          <Select
            v-model="values.method"
            input-id="payment-method"
            :options="methodOptions"
            option-label="label"
            option-value="value"
            fluid
          />
        </FormField>
        <FormField
          :label="t('payments.reference')"
          for="payment-reference"
          optional
          :server-error="errors.reference"
        >
          <InputText id="payment-reference" v-model="values.reference" dir="ltr" fluid />
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          variant="text"
          @click="visible = false"
        />
        <Button
          type="submit"
          :label="t('payments.save')"
          :loading="recordPayment.isPending.value"
        />
      </div>
    </form>
  </Dialog>
</template>
