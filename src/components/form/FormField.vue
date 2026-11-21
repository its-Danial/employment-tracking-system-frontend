<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Label, input (default slot), hint and error for one form field. Shows the client-side error
 * from PrimeVue Form first, then the one the API returned for the same field.
 *
 * @example
 * <FormField :label="t('candidateForm.name')" for="name" :state="$form.name" :server-error="serverErrors.name">
 *   <InputText id="name" name="name" fluid />
 * </FormField>
 */
const { state, serverError } = defineProps<{
  label: string
  for: string
  hint?: string
  optional?: boolean
  state?: { invalid?: boolean; error?: { message?: string } }
  serverError?: string
}>()

const { t } = useI18n()
const error = computed(() => (state?.invalid ? state.error?.message : serverError))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="$props.for" class="flex items-baseline justify-between gap-2">
      {{ label }}
      <span v-if="optional" class="text-sm font-normal text-muted-color">
        {{ t('candidateForm.optional') }}
      </span>
    </label>
    <slot />
    <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
    <small v-else-if="hint" class="text-muted-color">{{ hint }}</small>
  </div>
</template>
