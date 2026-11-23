<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { markFirstField } from '@/lib/dialog'

/** Dialog around a small form: title, fields (default slot), Cancel and a save button */
const { submitLabel, danger = false } = defineProps<{
  title: string
  saving: boolean
  submitLabel?: string
  /** Red submit button, for something that can't be undone */
  danger?: boolean
}>()
const visible = defineModel<boolean>('visible', { required: true })
defineEmits<{ submit: [] }>()
const { t } = useI18n()
const formRef = useTemplateRef('form')
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    :style="{ width: '34rem' }"
    :breakpoints="{ '640px': '94vw' }"
    @show="markFirstField(formRef)"
  >
    <form ref="form" class="flex flex-col gap-5" novalidate @submit.prevent="$emit('submit')">
      <slot />
      <div class="flex justify-end gap-3 pt-1">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          variant="text"
          @click="visible = false"
        />
        <Button
          type="submit"
          :label="submitLabel ?? t('common.save')"
          :severity="danger ? 'danger' : undefined"
          :loading="saving"
        />
      </div>
    </form>
  </Dialog>
</template>
