<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppCard from '@/components/AppCard.vue'
import InitialsAvatar from '@/components/InitialsAvatar.vue'
import { formatRelativeTime, formatShortDate } from '@/lib/utils'
import { CANDIDATE_STAGE } from '@/shared/candidate'
import type { CandidateSummary } from '@/shared/entities'
import { RouteName } from '@/types/router'
import StageStamp from './StageStamp.vue'
import StageTrack from './StageTrack.vue'

const { candidate } = defineProps<{ candidate: CandidateSummary }>()
const { t } = useI18n()

const flight = computed(() => {
  if (!candidate.flightDate) return null
  const date = formatShortDate(candidate.flightDate)
  return candidate.stage === CANDIDATE_STAGE.departed
    ? t('candidates.flewOn', { date })
    : t('candidates.fliesOn', { date })
})
</script>

<template>
  <AppCard :to="{ name: RouteName.Candidate, params: { uuid: candidate.uuid } }" class="gap-4">
    <div class="flex items-start gap-3">
      <InitialsAvatar :name="candidate.name" />
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-semibold text-color-emphasis">{{ candidate.name }}</span>
        <span class="truncate text-sm text-muted-color">
          {{ t('candidates.sonOf', { name: candidate.fatherName }) }}
        </span>
      </div>
      <StageStamp :candidate class="mt-0.5" />
    </div>

    <div class="flex min-h-10 flex-col text-sm">
      <template v-if="candidate.trade">
        <span class="truncate font-medium">{{ candidate.trade.name }}</span>
        <span class="truncate text-muted-color">
          {{ candidate.company?.name }}, {{ candidate.company?.country }}
        </span>
      </template>
      <span v-else class="text-muted-color">{{ t('candidates.notPlaced') }}</span>
    </div>

    <StageTrack :candidate />

    <div class="flex items-center justify-between gap-3 text-sm text-muted-color">
      <span dir="ltr" class="tabular-nums">{{ candidate.passportNumber }}</span>
      <span v-if="flight" class="font-medium text-color">{{ flight }}</span>
      <span v-else>{{ formatRelativeTime(candidate.updatedAt) }}</span>
    </div>
  </AppCard>
</template>
