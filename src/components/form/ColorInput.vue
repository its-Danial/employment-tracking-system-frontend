<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DEFAULT_TENANT_COLOR } from '@/stores/tenant'

/**
 * Hex colour field: pick from the swatch or type/paste a value like `#0e4a3a`.
 * The model is `''` when empty. `name` lets a PrimeVue Form pick up the text input.
 */
const { id, name, invalid } = defineProps<{ id: string; name?: string; invalid?: boolean }>()
const model = defineModel<string>({ required: true })

const { t } = useI18n()
const HEX = /^#[\da-f]{6}$/i

// The picker works without the leading '#'. While the typed value is incomplete it shows the default.
const pickerValue = computed({
  get: () => (HEX.test(model.value) ? model.value : DEFAULT_TENANT_COLOR).slice(1),
  set: (value: string) => (model.value = `#${value}`),
})
</script>

<template>
  <InputGroup dir="ltr">
    <InputGroupAddon class="p-0!">
      <ColorPicker
        v-model="pickerValue"
        format="hex"
        :pt="{ preview: { 'aria-label': t('common.pickColor') } }"
      />
    </InputGroupAddon>
    <InputText
      :id
      v-model="model"
      :name
      :placeholder="DEFAULT_TENANT_COLOR"
      maxlength="7"
      :invalid
      fluid
    />
  </InputGroup>
</template>
