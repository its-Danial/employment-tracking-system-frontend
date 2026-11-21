<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CANDIDATE_STAGE_ORDER } from '@/shared/candidate'
import type { CandidateSummary } from '@/shared/entities'
import { stageIndex, toneOf } from './candidate-status'

/** Seven ticks, one per stage, filled up to where the candidate is */
const { candidate } = defineProps<{
  candidate: Pick<CandidateSummary, 'stage' | 'medicalStatus' | 'visaStatus'>
}>()

const { t } = useI18n()
const reached = computed(() => stageIndex(candidate))
const tone = computed(() => toneOf(candidate))
</script>

<template>
  <div
    class="flex gap-1"
    role="img"
    :aria-label="`${t('candidates.progress')}: ${t(`stages.${candidate.stage}`)}`"
  >
    <span
      v-for="(stage, index) in CANDIDATE_STAGE_ORDER"
      :key="stage"
      class="h-1 flex-1 rounded-full"
      :class="
        index > reached
          ? 'bg-surface-200 dark:bg-surface-800'
          : tone === 'departed'
            ? 'bg-gold-500'
            : tone === 'blocked' && index === reached
              ? 'bg-red-500'
              : 'bg-primary'
      "
    />
  </div>
</template>
