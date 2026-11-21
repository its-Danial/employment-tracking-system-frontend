<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CANDIDATE_MEDICAL_STATUS } from '@/shared/candidate'
import type { CandidateSummary } from '@/shared/entities'
import { toneOf } from './candidate-status'

/**
 * The candidate's stage, inked like a passport stamp. A blocked candidate shows why instead.
 */
const { candidate } = defineProps<{
  candidate: Pick<CandidateSummary, 'stage' | 'medicalStatus' | 'visaStatus'>
}>()

const { t } = useI18n()
const tone = computed(() => toneOf(candidate))
const toneClass = {
  waiting: 'text-muted-color',
  moving: 'text-primary',
  departed: 'text-gold-600 dark:text-gold-300',
  blocked: 'text-red-600 dark:text-red-400',
} as const
const label = computed(() => {
  if (tone.value !== 'blocked') return t(`stages.${candidate.stage}`)
  return candidate.medicalStatus === CANDIDATE_MEDICAL_STATUS.unfit
    ? t('medicalStatus.unfit')
    : t('visaStatus.rejected')
})
</script>

<template>
  <span
    class="inline-flex shrink-0 -rotate-2 items-center rounded-[4px] border-[1.5px] border-current px-1.5 text-[0.8125rem] leading-normal font-semibold whitespace-nowrap rtl:rotate-2"
    :class="toneClass[tone]"
  >
    {{ label }}
  </span>
</template>
