<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatBackendDateForDisplay } from '@/lib/utils'
import {
  CANDIDATE_MEDICAL_STATUS,
  CANDIDATE_STAGE,
  CANDIDATE_STAGE_ORDER,
  type CandidateStage,
} from '@/shared/candidate'
import type { Candidate } from '@/shared/entities'
import { isBlocked, stageIndex } from './candidate-status'

/**
 * The candidate's journey as a passport visa page: each stage reached is an inked stamp with
 * its date, stages still ahead are empty outlines. The newest stamp lands with a thump, on
 * load and whenever a step is recorded.
 */
const { candidate } = defineProps<{ candidate: Candidate }>()
const { t } = useI18n()

// Each stage keeps its own shape, ink and tilt, like stamps from different desks
const STAMPS: Record<
  CandidateStage,
  { shape: 'box' | 'round' | 'oval'; ink: string; tilt: number }
> = {
  registered: { shape: 'box', ink: 'slate', tilt: -5 },
  medical: { shape: 'round', ink: 'primary', tilt: 4 },
  e_number: { shape: 'box', ink: 'blue', tilt: -3 },
  dropbox: { shape: 'oval', ink: 'primary', tilt: 6 },
  visa: { shape: 'round', ink: 'blue', tilt: -6 },
  protector: { shape: 'oval', ink: 'slate', tilt: 5 },
  ticketed: { shape: 'box', ink: 'primary', tilt: 3 },
  departed: { shape: 'round', ink: 'gold', tilt: -8 },
}

const formatDate = (date: string | null | undefined) =>
  date ? formatBackendDateForDisplay(date) : null

const reached = computed(() => stageIndex(candidate))
const blocked = computed(() => isBlocked(candidate))

const stamps = computed(() => {
  const dates: Record<CandidateStage, string | null> = {
    registered: formatDate(candidate.createdAt),
    medical: formatDate(candidate.medicalDate),
    e_number: candidate.eNumber ?? formatDate(candidate.eNumberApplicationDate),
    dropbox: formatDate(candidate.dropboxSubmissionDate),
    visa: formatDate(candidate.visaIssuedDate),
    protector: formatDate(candidate.protectorDate),
    ticketed: candidate.flightNumber,
    departed: formatDate(candidate.flightDate),
  }
  return CANDIDATE_STAGE_ORDER.map((stage, index) => {
    const isCurrent = index === reached.value
    const isRefused = isCurrent && blocked.value
    return {
      stage,
      ...STAMPS[stage],
      ink: isRefused ? 'red' : STAMPS[stage].ink,
      inked: index <= reached.value,
      isCurrent,
      label: !isRefused
        ? t(`stages.${stage}`)
        : candidate.medicalStatus === CANDIDATE_MEDICAL_STATUS.unfit
          ? t('medicalStatus.unfit')
          : t('visaStatus.rejected'),
      detail: index <= reached.value ? dates[stage] : null,
      ltr: stage === CANDIDATE_STAGE.ticketed || stage === CANDIDATE_STAGE.eNumber,
    }
  })
})
</script>

<template>
  <section
    class="relative overflow-x-auto rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
    :aria-label="t('candidates.visaPage')"
  >
    <!-- Roughens stamp edges and leaves small gaps, like ink from a rubber stamp -->
    <svg class="absolute size-0" aria-hidden="true">
      <filter id="stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="2"
          seed="7"
          result="grain"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.05"
          result="gaps"
        />
        <feComposite in="SourceGraphic" in2="gaps" operator="in" result="worn" />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves="1"
          seed="3"
          result="wobble"
        />
        <feDisplacementMap in="worn" in2="wobble" scale="2.5" />
      </filter>
    </svg>

    <ol class="grid min-w-[58rem] grid-cols-8">
      <li
        v-for="stamp in stamps"
        :key="stamp.stage"
        class="flex h-36 items-center justify-center border-dashed border-surface-200 not-first:border-s dark:border-surface-800"
      >
        <div
          v-if="stamp.inked"
          :key="`${stamp.stage}-${stamp.isCurrent}`"
          class="stamp"
          :class="[`stamp-${stamp.shape}`, `ink-${stamp.ink}`, { 'stamp-land': stamp.isCurrent }]"
          :style="{ '--tilt': `${stamp.tilt}deg` }"
        >
          <span class="stamp-label">{{ stamp.label }}</span>
          <span v-if="stamp.detail" :dir="stamp.ltr ? 'ltr' : undefined" class="stamp-detail">
            {{ stamp.detail }}
          </span>
        </div>
        <div v-else class="flex flex-col items-center gap-0.5 text-center text-sm text-muted-color">
          <span>{{ t(`stages.${stamp.stage}`) }}</span>
          <span class="opacity-60">{{ t('candidates.pending') }}</span>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.stamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  max-width: 7.25rem;
  padding: 0.5rem 0.625rem;
  border: 2px solid currentColor;
  outline: 1px solid currentColor;
  outline-offset: -5px;
  text-align: center;
  line-height: 1.15;
  rotate: var(--tilt);
  filter: url(#stamp-ink);
}
.stamp-box {
  min-width: 6.25rem;
  border-radius: 6px;
}
.stamp-round {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
}
.stamp-oval {
  width: 7.25rem;
  height: 5.25rem;
  border-radius: 50%;
}
.stamp-label {
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}
.stamp-detail {
  font-size: 0.6875rem;
  font-weight: 600;
}

.ink-primary {
  color: var(--p-primary-color);
}
.ink-slate {
  color: var(--p-text-muted-color);
}
.ink-blue {
  color: light-dark(#2f4a94, #9db2ee);
}
.ink-gold {
  color: light-dark(var(--color-gold-600), var(--color-gold-300));
}
.ink-red {
  color: light-dark(#b42318, #f97066);
}

/* The newest stamp comes down onto the page */
@media (prefers-reduced-motion: no-preference) {
  .stamp-land {
    animation: stamp-land 420ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
  }
}
@keyframes stamp-land {
  from {
    opacity: 0;
    scale: 1.9;
    rotate: calc(var(--tilt) + 10deg);
  }
  60% {
    opacity: 1;
    scale: 0.985;
  }
  to {
    scale: 1;
    rotate: var(--tilt);
  }
}
</style>
