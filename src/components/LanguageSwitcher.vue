<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { type AppLocale, LOCALES } from '@/i18n'
import { useLocaleStore } from '@/stores/locale'

const { t } = useI18n()
const { locale } = storeToRefs(useLocaleStore())

const options = Object.entries(LOCALES).map(([value, { label }]) => ({
  value: value as AppLocale,
  label,
}))
</script>

<template>
  <SelectButton
    v-model="locale"
    :options
    option-label="label"
    option-value="value"
    :allow-empty="false"
    :aria-label="t('common.language')"
    size="small"
  />
</template>
