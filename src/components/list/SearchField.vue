<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const search = defineModel<string | undefined>({ required: true })
const { placeholder } = defineProps<{ placeholder?: string }>()
const { t } = useI18n()
</script>

<template>
  <IconField class="w-full sm:max-w-xs">
    <InputIcon><MagnifyingGlassIcon /></InputIcon>
    <InputText
      v-model="search"
      :placeholder="placeholder ?? t('common.search')"
      :aria-label="placeholder ?? t('common.search')"
      fluid
    />
    <InputIcon
      v-if="search"
      role="button"
      :aria-label="t('common.clearSearch')"
      class="cursor-pointer"
      @click="search = undefined"
    >
      <XMarkIcon />
    </InputIcon>
  </IconField>
</template>
