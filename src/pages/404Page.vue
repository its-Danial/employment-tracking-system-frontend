<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ErrorPage from '@/pages/ErrorPage.vue'

const { t } = useI18n()
</script>

<template>
  <ErrorPage :title="t('pageTitles.notFound')" :message="t('errors.pageNotFound')" />
</template>
